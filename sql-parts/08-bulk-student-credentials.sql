-- =========================================================
-- 08 - BULK STUDENT DEFAULT CREDENTIALS
-- Username = first word of student name, with 2/3/... suffix if needed.
-- Password = 4-digit birth year repeated twice (e.g. 1998 -> 19981998).
-- Missing DOB is rejected so Admin can correct/set it rather than inventing a password.
-- =========================================================

begin;

create or replace function public.admin_bulk_import_student_applications(
    p_token uuid,
    p_rows jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_row jsonb;
    v_batch uuid := gen_random_uuid();
    v_before_id bigint;
    v_application_id bigint;
    v_application_no text;
    v_row_no integer;
    v_name text;
    v_username text;
    v_username_base text;
    v_username_candidate text;
    v_suffix integer;
    v_username_exists boolean;
    v_password text;
    v_birth_date date;
    v_birth_year text;
    v_admission_type text;
    v_phone text;
    v_results jsonb := '[]'::jsonb;
    v_ok integer := 0;
    v_failed integer := 0;
begin
    perform public.require_app_admin(p_token);

    if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
        raise exception 'Rows must be a JSON array';
    end if;

    if jsonb_array_length(p_rows) = 0 then
        return jsonb_build_object('batch_id',v_batch,'total',0,'imported',0,'failed',0,'results','[]'::jsonb);
    end if;

    if jsonb_array_length(p_rows) > 1000 then
        raise exception 'Maximum 1000 students are allowed in one import';
    end if;

    for v_row in select value from jsonb_array_elements(p_rows)
    loop
        begin
            v_row_no := coalesce(nullif(v_row->>'row_no','')::integer,0);
            v_name := btrim(coalesce(v_row->>'name',''));
            v_admission_type := btrim(coalesce(v_row->>'admission_type','منتقلی'));

            if v_name = '' then raise exception 'Student name is required'; end if;
            if nullif(btrim(coalesce(v_row->>'student_class','')),'') is null then raise exception 'Student class is required'; end if;
            if v_admission_type not in ('نیا داخلہ','منتقلی') then raise exception 'Invalid admission type'; end if;

            v_birth_date := nullif(v_row->>'date_of_birth','')::date;
            if v_birth_date is null then
                raise exception 'Date of birth is required for the default temporary password';
            end if;
            v_birth_year := to_char(v_birth_date,'YYYY');
            v_password := v_birth_year || v_birth_year;

            v_username_base := split_part(regexp_replace(v_name,'\s+',' ','g'),' ',1);
            v_username_base := regexp_replace(v_username_base,'[[:space:][:punct:]]+','','g');
            if nullif(v_username_base,'') is null then v_username_base := 'student'; end if;

            v_suffix := 1;
            loop
                v_username_candidate := case when v_suffix = 1 then v_username_base else v_username_base || v_suffix::text end;
                v_username_exists := false;

                begin
                    execute 'select exists(select 1 from public.student_applications where lower(coalesce(requested_username, username, '''')) = lower($1))'
                       into v_username_exists using v_username_candidate;
                exception when undefined_column then
                    begin
                        execute 'select exists(select 1 from public.student_applications where lower(coalesce(requested_username, '''')) = lower($1))'
                           into v_username_exists using v_username_candidate;
                    exception when undefined_column then
                        v_username_exists := false;
                    end;
                end;

                if not v_username_exists and to_regclass('public.student_accounts') is not null then
                    begin
                        execute 'select exists(select 1 from public.student_accounts where lower(coalesce(username, '''')) = lower($1))'
                           into v_username_exists using v_username_candidate;
                    exception when undefined_column then
                        v_username_exists := false;
                    end;
                end if;

                if not v_username_exists and to_regclass('public.accounts') is not null then
                    begin
                        execute 'select exists(select 1 from public.accounts where lower(coalesce(username, '''')) = lower($1))'
                           into v_username_exists using v_username_candidate;
                    exception when undefined_column then
                        v_username_exists := false;
                    end;
                end if;

                exit when not v_username_exists;
                v_suffix := v_suffix + 1;
                if v_suffix > 9999 then raise exception 'Could not generate a unique username'; end if;
            end loop;
            v_username := v_username_candidate;

            v_phone := regexp_replace(coalesce(v_row->>'phone',''),'[^0-9]','','g');
            if length(v_phone)=10 and left(v_phone,1)='3' then
                v_phone := '0'||v_phone;
            elsif length(v_phone)=12 and left(v_phone,2)='92' then
                v_phone := '0'||substr(v_phone,3);
            elsif length(v_phone)=14 and left(v_phone,4)='0092' then
                v_phone := '0'||substr(v_phone,5);
            end if;
            if v_phone ~ '^0+$' or length(v_phone)<>11 then v_phone := null; end if;

            select coalesce(max(id),0) into v_before_id from public.student_applications;

            perform public.submit_student_application(
                p_admission_type    => v_admission_type,
                p_name              => v_name,
                p_father_name       => nullif(btrim(coalesce(v_row->>'father_name','')),''),
                p_guardian_name     => nullif(btrim(coalesce(v_row->>'guardian_name','')),''),
                p_cnic              => nullif(regexp_replace(coalesce(v_row->>'cnic',''),'[^0-9]','','g'),''),
                p_phone             => v_phone,
                p_date_of_birth     => v_birth_date,
                p_student_class     => btrim(v_row->>'student_class'),
                p_address           => nullif(btrim(coalesce(v_row->>'address','')),''),
                p_residence_type    => nullif(btrim(coalesce(v_row->>'residence_type','گھر')),''),
                p_previous_madrassa => nullif(btrim(coalesce(v_row->>'previous_madrassa','')),''),
                p_transfer_date     => nullif(v_row->>'transfer_date','')::date,
                p_mahrams           => coalesce(v_row->'mahrams','[]'::jsonb),
                p_username          => v_username,
                p_password          => v_password
            );

            select a.id,a.application_no into v_application_id,v_application_no
              from public.student_applications a
             where a.id > v_before_id and btrim(coalesce(a.name,'')) = v_name
             order by a.id desc limit 1;

            if v_application_id is null then raise exception 'Application was submitted but could not be identified'; end if;

            update public.student_applications
               set wifaq_registration_no = nullif(btrim(coalesce(v_row->>'wifaq_registration_no','')),''),
                   legacy_registration_no = nullif(btrim(coalesce(v_row->>'legacy_registration_no','')),''),
                   bulk_import_batch_id = v_batch,
                   imported_at = now()
             where id = v_application_id;

            v_ok := v_ok + 1;
            v_results := v_results || jsonb_build_array(jsonb_build_object(
                'row_no',v_row_no,'ok',true,'application_id',v_application_id,
                'application_no',v_application_no,'username',v_username,'password',v_password
            ));

        exception when others then
            v_failed := v_failed + 1;
            v_results := v_results || jsonb_build_array(jsonb_build_object(
                'row_no',coalesce(v_row_no,0),'ok',false,'error',sqlerrm
            ));
        end;
    end loop;

    return jsonb_build_object(
        'batch_id',v_batch,'total',jsonb_array_length(p_rows),
        'imported',v_ok,'failed',v_failed,'results',v_results
    );
end;
$$;

revoke all on function public.admin_bulk_import_student_applications(uuid,jsonb) from public;
grant execute on function public.admin_bulk_import_student_applications(uuid,jsonb) to anon, authenticated;

commit;
