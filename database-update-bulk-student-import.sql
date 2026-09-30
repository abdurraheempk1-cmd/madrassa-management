-- =========================================================
-- MSAL HALL / Madrassa Management System
-- PART 06 - Bulk Student Excel/CSV Import
-- Imported students are inserted as PENDING applications.
-- They do NOT become active Students until Admin approval.
-- Wifaq registration number becomes official admission_no on approval.
-- =========================================================

begin;

create extension if not exists pgcrypto;

-- Keep Wifaq / legacy source numbers with the pending application.
alter table public.student_applications
    add column if not exists wifaq_registration_no text,
    add column if not exists legacy_registration_no text,
    add column if not exists bulk_import_batch_id uuid,
    add column if not exists imported_at timestamptz,
    add column if not exists wifaq_applied boolean not null default false;

alter table public."Students"
    add column if not exists legacy_registration_no text;

-- A Wifaq number identifies one student application only.
create unique index if not exists student_applications_wifaq_registration_unique_idx
    on public.student_applications (wifaq_registration_no)
    where nullif(btrim(coalesce(wifaq_registration_no,'')), '') is not null
      and lower(coalesce(status,'pending')) not in ('rejected','cancelled','مسترد','نامنظور');

create index if not exists student_applications_bulk_batch_idx
    on public.student_applications (bulk_import_batch_id, id);

-- ---------------------------------------------------------
-- When Admin approves an imported application, the existing
-- approval RPC inserts into public."Students". This BEFORE
-- INSERT trigger replaces the temporary admission number with
-- the official Wifaq number when a matching imported application
-- is found. If no Wifaq number exists, the existing temporary
-- admission number trigger continues to work normally.
-- ---------------------------------------------------------
create or replace function public.apply_imported_wifaq_admission_no()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_application_id bigint;
    v_wifaq text;
    v_legacy text;
    v_new_cnic text := regexp_replace(coalesce(new.cnic,''), '[^0-9]', '', 'g');
begin
    select a.id, nullif(btrim(a.wifaq_registration_no),''), nullif(btrim(a.legacy_registration_no),'')
      into v_application_id, v_wifaq, v_legacy
      from public.student_applications a
     where a.bulk_import_batch_id is not null
       and coalesce(a.wifaq_applied,false) = false
       and lower(coalesce(a.status,'pending')) in ('pending','approved','active','منظور','منظور شدہ','زیر التواء','زیرِ التواء')
       and (
            (
                length(v_new_cnic) >= 5
                and v_new_cnic !~ '^0+$'
                and regexp_replace(coalesce(a.cnic,''), '[^0-9]', '', 'g') = v_new_cnic
            )
            or
            (
                btrim(coalesce(a.name,'')) = btrim(coalesce(new.name,''))
                and btrim(coalesce(a.father_name,'')) = btrim(coalesce(new.father_name,''))
                and (
                    a.date_of_birth is null
                    or new.date_of_birth is null
                    or a.date_of_birth = new.date_of_birth
                )
            )
       )
     order by a.id desc
     limit 1;

    if v_wifaq is not null then
        if exists (
            select 1
              from public."Students" s
             where s.admission_no = v_wifaq
               and (new.id is null or s.id <> new.id)
        ) then
            raise exception 'Wifaq / admission number already exists: %', v_wifaq;
        end if;

        new.admission_no := v_wifaq;
        new.legacy_registration_no := v_legacy;

        update public.student_applications
           set wifaq_applied = true
         where id = v_application_id;
    elsif v_application_id is not null then
        new.legacy_registration_no := v_legacy;
        update public.student_applications
           set wifaq_applied = true
         where id = v_application_id;
    end if;

    return new;
end;
$$;

-- Use a name that sorts before the default admission trigger in PostgreSQL's
-- trigger name order. Both are BEFORE INSERT; this sets Wifaq first and the
-- default trigger will preserve a non-empty admission_no.
drop trigger if exists aaa_apply_imported_wifaq_admission_no on public."Students";
create trigger aaa_apply_imported_wifaq_admission_no
before insert on public."Students"
for each row execute function public.apply_imported_wifaq_admission_no();

-- ---------------------------------------------------------
-- Admin-only bulk import RPC.
-- Reuses the project's existing submit_student_application()
-- so password hashing, application numbering and normal
-- validation stay consistent with single-student applications.
-- Each row is isolated: one bad row does not cancel good rows.
-- ---------------------------------------------------------
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
    v_password text;
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
        return jsonb_build_object(
            'batch_id', v_batch,
            'total', 0,
            'imported', 0,
            'failed', 0,
            'results', '[]'::jsonb
        );
    end if;

    if jsonb_array_length(p_rows) > 1000 then
        raise exception 'Maximum 1000 students are allowed in one import';
    end if;

    for v_row in select value from jsonb_array_elements(p_rows)
    loop
        begin
            v_row_no := coalesce(nullif(v_row->>'row_no','')::integer, 0);
            v_name := btrim(coalesce(v_row->>'name',''));
            v_admission_type := btrim(coalesce(v_row->>'admission_type','منتقلی'));
            v_username := lower(btrim(coalesce(v_row->>'username','')));
            v_password := coalesce(v_row->>'password','');

            if v_name = '' then
                raise exception 'Student name is required';
            end if;

            if nullif(btrim(coalesce(v_row->>'student_class','')), '') is null then
                raise exception 'Student class is required';
            end if;

            if v_admission_type not in ('نیا داخلہ','منتقلی') then
                raise exception 'Invalid admission type';
            end if;

            if v_username = '' then
                v_username := 'std' || regexp_replace(coalesce(v_row->>'legacy_registration_no',''), '[^0-9A-Za-z]', '', 'g') || '_' || substr(replace(gen_random_uuid()::text,'-',''),1,6);
            end if;

            if length(v_password) < 8 then
                v_password := 'Msa#' || substr(replace(gen_random_uuid()::text,'-',''),1,12);
            end if;

            v_phone := regexp_replace(coalesce(v_row->>'phone',''), '[^0-9]', '', 'g');
            if length(v_phone) = 10 and left(v_phone,1) = '3' then
                v_phone := '0' || v_phone;
            elsif length(v_phone) = 12 and left(v_phone,2) = '92' then
                v_phone := '0' || substr(v_phone,3);
            elsif length(v_phone) = 14 and left(v_phone,4) = '0092' then
                v_phone := '0' || substr(v_phone,5);
            end if;
            if v_phone ~ '^0+$' or length(v_phone) <> 11 then
                v_phone := null;
            end if;

            select coalesce(max(id),0) into v_before_id from public.student_applications;

            perform public.submit_student_application(
                p_admission_type   => v_admission_type,
                p_name             => v_name,
                p_father_name      => nullif(btrim(coalesce(v_row->>'father_name','')), ''),
                p_guardian_name    => nullif(btrim(coalesce(v_row->>'guardian_name','')), ''),
                p_cnic             => nullif(regexp_replace(coalesce(v_row->>'cnic',''), '[^0-9]', '', 'g'), ''),
                p_phone            => v_phone,
                p_date_of_birth    => nullif(v_row->>'date_of_birth','')::date,
                p_student_class    => btrim(v_row->>'student_class'),
                p_address          => nullif(btrim(coalesce(v_row->>'address','')), ''),
                p_residence_type   => nullif(btrim(coalesce(v_row->>'residence_type','گھر')), ''),
                p_previous_madrassa=> nullif(btrim(coalesce(v_row->>'previous_madrassa','')), ''),
                p_transfer_date    => nullif(v_row->>'transfer_date','')::date,
                p_mahrams          => coalesce(v_row->'mahrams', '[]'::jsonb),
                p_username         => v_username,
                p_password         => v_password
            );

            select a.id, a.application_no
              into v_application_id, v_application_no
              from public.student_applications a
             where a.id > v_before_id
               and btrim(coalesce(a.name,'')) = v_name
             order by a.id desc
             limit 1;

            if v_application_id is null then
                raise exception 'Application was submitted but could not be identified';
            end if;

            update public.student_applications
               set wifaq_registration_no = nullif(btrim(coalesce(v_row->>'wifaq_registration_no','')), ''),
                   legacy_registration_no = nullif(btrim(coalesce(v_row->>'legacy_registration_no','')), ''),
                   bulk_import_batch_id = v_batch,
                   imported_at = now()
             where id = v_application_id;

            v_ok := v_ok + 1;
            v_results := v_results || jsonb_build_array(jsonb_build_object(
                'row_no', v_row_no,
                'ok', true,
                'application_id', v_application_id,
                'application_no', v_application_no,
                'username', v_username
            ));

        exception when others then
            v_failed := v_failed + 1;
            v_results := v_results || jsonb_build_array(jsonb_build_object(
                'row_no', coalesce(v_row_no,0),
                'ok', false,
                'error', sqlerrm
            ));
        end;
    end loop;

    return jsonb_build_object(
        'batch_id', v_batch,
        'total', jsonb_array_length(p_rows),
        'imported', v_ok,
        'failed', v_failed,
        'results', v_results
    );
end;
$$;

revoke all on function public.admin_bulk_import_student_applications(uuid,jsonb) from public;
grant execute on function public.admin_bulk_import_student_applications(uuid,jsonb) to anon, authenticated;

-- Internal trigger function should never be callable by browser roles.
revoke all on function public.apply_imported_wifaq_admission_no() from public, anon, authenticated;

commit;
