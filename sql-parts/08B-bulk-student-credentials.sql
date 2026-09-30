-- 08B - bulk student credential rule
begin;

create or replace function public.admin_bulk_import_student_applications(
  p_token uuid,
  p_rows jsonb
) returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  r jsonb;
  batch uuid:=gen_random_uuid();
  before_id bigint;
  app_id bigint;
  app_no text;
  row_no int;
  nm text;
  usr text;
  pwd text;
  dob date;
  yr text;
  typ text;
  ph text;
  outj jsonb:='[]'::jsonb;
  okc int:=0;
  failc int:=0;
begin
  perform public.require_app_admin(p_token);

  if p_rows is null or jsonb_typeof(p_rows)<>'array' then
    raise exception 'Rows must be a JSON array';
  end if;
  if jsonb_array_length(p_rows)>1000 then
    raise exception 'Maximum 1000 students are allowed in one import';
  end if;

  for r in select value from jsonb_array_elements(p_rows)
  loop
    begin
      row_no:=coalesce(nullif(r->>'row_no','')::int,0);
      nm:=btrim(coalesce(r->>'name',''));
      typ:=btrim(coalesce(r->>'admission_type','منتقلی'));

      if nm='' then raise exception 'Student name is required'; end if;
      if nullif(btrim(coalesce(r->>'student_class','')),'') is null then
        raise exception 'Student class is required';
      end if;
      if typ not in ('نیا داخلہ','منتقلی') then
        raise exception 'Invalid admission type';
      end if;

      dob:=nullif(r->>'date_of_birth','')::date;
      if dob is null then
        raise exception 'Date of birth is required for the default temporary password';
      end if;

      yr:=to_char(dob,'YYYY');
      pwd:=yr||yr;
      usr:=public.bulk_next_student_username(nm);
      ph:=public.bulk_normalize_pk_phone(r->>'phone');

      select coalesce(max(id),0) into before_id from public.student_applications;

      perform public.submit_student_application(
        p_admission_type=>typ,
        p_name=>nm,
        p_father_name=>nullif(btrim(coalesce(r->>'father_name','')),''),
        p_guardian_name=>nullif(btrim(coalesce(r->>'guardian_name','')),''),
        p_cnic=>nullif(regexp_replace(coalesce(r->>'cnic',''),'[^0-9]','','g'),''),
        p_phone=>ph,
        p_date_of_birth=>dob,
        p_student_class=>btrim(r->>'student_class'),
        p_address=>nullif(btrim(coalesce(r->>'address','')),''),
        p_residence_type=>nullif(btrim(coalesce(r->>'residence_type','گھر')),''),
        p_previous_madrassa=>nullif(btrim(coalesce(r->>'previous_madrassa','')),''),
        p_transfer_date=>nullif(r->>'transfer_date','')::date,
        p_mahrams=>coalesce(r->'mahrams','[]'::jsonb),
        p_username=>usr,
        p_password=>pwd
      );

      select a.id,a.application_no
      into app_id,app_no
      from public.student_applications a
      where a.id>before_id and btrim(coalesce(a.name,''))=nm
      order by a.id desc limit 1;

      if app_id is null then
        raise exception 'Application was submitted but could not be identified';
      end if;

      update public.student_applications
      set wifaq_registration_no=nullif(btrim(coalesce(r->>'wifaq_registration_no','')),''),
          legacy_registration_no=nullif(btrim(coalesce(r->>'legacy_registration_no','')),''),
          bulk_import_batch_id=batch,
          imported_at=now()
      where id=app_id;

      okc:=okc+1;
      outj:=outj||jsonb_build_array(jsonb_build_object(
        'row_no',row_no,'ok',true,'application_id',app_id,
        'application_no',app_no,'username',usr,'password',pwd
      ));
    exception when others then
      failc:=failc+1;
      outj:=outj||jsonb_build_array(jsonb_build_object(
        'row_no',coalesce(row_no,0),'ok',false,'error',sqlerrm
      ));
    end;
  end loop;

  return jsonb_build_object(
    'batch_id',batch,
    'total',jsonb_array_length(p_rows),
    'imported',okc,
    'failed',failc,
    'results',outj
  );
end;
$$;

revoke all on function public.admin_bulk_import_student_applications(uuid,jsonb) from public;
grant execute on function public.admin_bulk_import_student_applications(uuid,jsonb) to anon,authenticated;

commit;
