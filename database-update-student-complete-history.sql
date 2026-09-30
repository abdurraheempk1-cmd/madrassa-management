-- =========================================================
-- مدرسہ شہناز اختر للبنات
-- STUDENT COMPLETE HISTORY + PHOTO + DUPLICATE-SAFE UPDATE
-- Run AFTER the existing 2026-09-30 database updates / bulk import update.
-- Safe to re-run. Version: 2026-09-30-history2
-- =========================================================

begin;

alter table public."Students"
  add column if not exists profile_photo_url text;

create table if not exists public.student_update_history (
  id bigserial primary key,
  student_id bigint not null references public."Students"(id) on delete cascade,
  field_name text not null,
  old_value text,
  new_value text,
  changed_at timestamptz not null default now(),
  changed_by text,
  source text not null default 'student_record_update',
  notes text
);

create index if not exists student_update_history_student_idx
  on public.student_update_history(student_id, changed_at, id);

alter table public.student_update_history enable row level security;
revoke all on table public.student_update_history from public, anon, authenticated;

create table if not exists public.student_history_events (
  id bigserial primary key,
  student_id bigint not null references public."Students"(id) on delete cascade,
  event_type text not null,
  event_at timestamptz not null default now(),
  details text not null,
  performed_by text,
  approved_by text,
  notes text,
  source text not null default 'manual',
  created_at timestamptz not null default now()
);

create index if not exists student_history_events_student_idx
  on public.student_history_events(student_id, event_at, id);

alter table public.student_history_events enable row level security;
revoke all on table public.student_history_events from public, anon, authenticated;

create or replace function public.log_student_update_history()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor text := nullif(current_setting('app.audit_actor', true), '');
  v_source text := coalesce(nullif(current_setting('app.audit_source', true), ''), 'student_record_update');
  v_old text;
  v_new text;
  v_key text;
  v_keys text[] := array[
    'admission_no','legacy_registration_no','name','father_name','guardian_name','phone','cnic','date_of_birth',
    'student_class','admission_date','admission_type','address','residence_type','previous_madrassa','transfer_date',
    'mahrams','status','profile_photo_url'
  ];
begin
  if tg_op <> 'UPDATE' then return new; end if;

  foreach v_key in array v_keys loop
    v_old := to_jsonb(old)->>v_key;
    v_new := to_jsonb(new)->>v_key;
    if v_old is distinct from v_new then
      if v_key = 'profile_photo_url' then
        v_old := case when nullif(v_old,'') is null then null else '[photo present]' end;
        v_new := case when nullif(v_new,'') is null then null else '[photo present]' end;
      end if;
      insert into public.student_update_history(student_id,field_name,old_value,new_value,changed_by,source)
      values(new.id,v_key,v_old,v_new,coalesce(v_actor,'system'),v_source);
    end if;
  end loop;
  return new;
end;
$$;

revoke all on function public.log_student_update_history() from public, anon, authenticated;

drop trigger if exists trg_log_student_update_history on public."Students";
create trigger trg_log_student_update_history
after update on public."Students"
for each row execute function public.log_student_update_history();

create or replace function public.admin_update_student(
  p_token uuid,
  p_student_id bigint,
  p_changes jsonb
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_admission_no text;
  v_session jsonb;
  v_admin_id text;
begin
  perform public.require_app_admin(p_token);
  v_session := public.app_session_validate(p_token);
  v_admin_id := coalesce(v_session->>'account_id', v_session->>'username', 'admin');

  perform set_config('app.audit_actor', v_admin_id, true);
  perform set_config('app.audit_source', 'admin_update_student', true);

  if p_changes ? 'admission_no' then
    v_admission_no := nullif(btrim(p_changes->>'admission_no'), '');
    if v_admission_no is null then raise exception 'Admission number cannot be empty'; end if;
    if exists(select 1 from public."Students" where admission_no=v_admission_no and id<>p_student_id) then
      raise exception 'Admission number already exists';
    end if;
  end if;

  if p_changes ? 'cnic'
     and length(regexp_replace(coalesce(p_changes->>'cnic',''),'[^0-9]','','g')) >= 8
     and exists(
       select 1 from public."Students" s
       where s.id<>p_student_id
         and regexp_replace(coalesce(s.cnic,''),'[^0-9]','','g') = regexp_replace(coalesce(p_changes->>'cnic',''),'[^0-9]','','g')
     ) then
    raise exception 'Duplicate student CNIC/B-Form already exists';
  end if;

  update public."Students"
  set admission_no = case when p_changes ? 'admission_no' then v_admission_no else admission_no end,
      name = case when p_changes ? 'name' then coalesce(nullif(p_changes->>'name',''),name) else name end,
      father_name = case when p_changes ? 'father_name' then p_changes->>'father_name' else father_name end,
      guardian_name = case when p_changes ? 'guardian_name' then p_changes->>'guardian_name' else guardian_name end,
      phone = case when p_changes ? 'phone' then p_changes->>'phone' else phone end,
      cnic = case when p_changes ? 'cnic' then p_changes->>'cnic' else cnic end,
      date_of_birth = case when p_changes ? 'date_of_birth' then nullif(p_changes->>'date_of_birth','')::date else date_of_birth end,
      student_class = case when p_changes ? 'student_class' then coalesce(nullif(p_changes->>'student_class',''),student_class) else student_class end,
      address = case when p_changes ? 'address' then p_changes->>'address' else address end,
      residence_type = case when p_changes ? 'residence_type' then coalesce(nullif(p_changes->>'residence_type',''),residence_type) else residence_type end,
      admission_type = case when p_changes ? 'admission_type' then coalesce(nullif(p_changes->>'admission_type',''),admission_type) else admission_type end,
      previous_madrassa = case when p_changes ? 'previous_madrassa' then p_changes->>'previous_madrassa' else previous_madrassa end,
      transfer_date = case when p_changes ? 'transfer_date' then nullif(p_changes->>'transfer_date','')::date else transfer_date end,
      profile_photo_url = case when p_changes ? 'profile_photo_url' then p_changes->>'profile_photo_url' else profile_photo_url end
  where id=p_student_id;

  return found;
end;
$$;

grant execute on function public.admin_update_student(uuid,bigint,jsonb) to anon, authenticated;

create or replace function public.admin_find_student_duplicate(
  p_token uuid,
  p_student jsonb,
  p_exclude_student_id bigint default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public."Students"%rowtype;
  v_reason text;
  v_cnic text := regexp_replace(coalesce(p_student->>'cnic',''),'[^0-9]','','g');
  v_phone text := regexp_replace(coalesce(p_student->>'phone',''),'[^0-9]','','g');
  v_admission text := nullif(btrim(coalesce(p_student->>'admission_no',p_student->>'wifaq_registration_no','')),'');
  v_name text := lower(btrim(coalesce(p_student->>'name','')));
  v_father text := lower(btrim(coalesce(p_student->>'father_name','')));
  v_dob date;
begin
  perform public.require_app_admin(p_token);
  begin v_dob := nullif(p_student->>'date_of_birth','')::date; exception when others then v_dob := null; end;

  if length(v_cnic)>=8 then
    select * into v_row from public."Students" s
    where (p_exclude_student_id is null or s.id<>p_exclude_student_id)
      and regexp_replace(coalesce(s.cnic,''),'[^0-9]','','g')=v_cnic
    order by s.id limit 1;
    if found then v_reason:='CNIC / B-Form match'; end if;
  end if;

  if v_reason is null and v_admission is not null then
    select * into v_row from public."Students" s
    where (p_exclude_student_id is null or s.id<>p_exclude_student_id)
      and btrim(coalesce(s.admission_no,''))=v_admission
    order by s.id limit 1;
    if found then v_reason:='Admission / Wifaq number match'; end if;
  end if;

  if v_reason is null and v_name<>'' and v_father<>'' and v_dob is not null then
    select * into v_row from public."Students" s
    where (p_exclude_student_id is null or s.id<>p_exclude_student_id)
      and lower(btrim(coalesce(s.name,'')))=v_name
      and lower(btrim(coalesce(s.father_name,'')))=v_father
      and s.date_of_birth=v_dob
    order by s.id limit 1;
    if found then v_reason:='Name + father + date of birth match'; end if;
  end if;

  if v_reason is null and v_name<>'' and length(v_phone)>=7 then
    select * into v_row from public."Students" s
    where (p_exclude_student_id is null or s.id<>p_exclude_student_id)
      and lower(btrim(coalesce(s.name,'')))=v_name
      and regexp_replace(coalesce(s.phone,''),'[^0-9]','','g')=v_phone
    order by s.id limit 1;
    if found then v_reason:='Name + phone match'; end if;
  end if;

  if v_reason is null then return null; end if;
  return jsonb_build_object('student_id',v_row.id,'name',v_row.name,'father_name',v_row.father_name,'admission_no',v_row.admission_no,'student_class',v_row.student_class,'phone',v_row.phone,'cnic',v_row.cnic,'match_reason',v_reason);
end;
$$;

grant execute on function public.admin_find_student_duplicate(uuid,jsonb,bigint) to anon, authenticated;

create or replace function public.admin_add_student_history_event(
  p_token uuid,
  p_student_id bigint,
  p_event_type text,
  p_event_at timestamptz default now(),
  p_details text default null,
  p_notes text default null
) returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session jsonb;
  v_admin_id text;
  v_id bigint;
begin
  perform public.require_app_admin(p_token);
  v_session := public.app_session_validate(p_token);
  v_admin_id := coalesce(v_session->>'account_id',v_session->>'username','admin');
  if not exists(select 1 from public."Students" where id=p_student_id) then raise exception 'Student record not found'; end if;
  if nullif(btrim(coalesce(p_event_type,'')),'') is null then raise exception 'Event type is required'; end if;
  if nullif(btrim(coalesce(p_details,'')),'') is null then raise exception 'Event details are required'; end if;
  insert into public.student_history_events(student_id,event_type,event_at,details,performed_by,approved_by,notes,source)
  values(p_student_id,btrim(p_event_type),coalesce(p_event_at,now()),btrim(p_details),v_admin_id,v_admin_id,nullif(btrim(coalesce(p_notes,'')),''),'admin_manual')
  returning id into v_id;
  return v_id;
end;
$$;

grant execute on function public.admin_add_student_history_event(uuid,bigint,text,timestamptz,text,text) to anon, authenticated;

create or replace function public.admin_student_history_addon(
  p_token uuid,
  p_student_id bigint
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_photo text;
  v_updates jsonb;
  v_events jsonb;
begin
  perform public.require_app_admin(p_token);
  select profile_photo_url into v_photo from public."Students" where id=p_student_id;
  if not found then raise exception 'Student record not found'; end if;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.changed_at,x.id),'[]'::jsonb) into v_updates
  from (select id,student_id,field_name,old_value,new_value,changed_at,changed_by,source,notes from public.student_update_history where student_id=p_student_id order by changed_at,id) x;

  select coalesce(jsonb_agg(to_jsonb(x) order by x.event_at,x.id),'[]'::jsonb) into v_events
  from (select id,student_id,event_type,event_at,details,performed_by,approved_by,notes,source,created_at from public.student_history_events where student_id=p_student_id order by event_at,id) x;

  return jsonb_build_object('profile_photo_url',v_photo,'update_history',v_updates,'manual_events',v_events);
end;
$$;

grant execute on function public.admin_student_history_addon(uuid,bigint) to anon, authenticated;

create or replace function public.admin_merge_student_application_into_existing(
  p_token uuid,
  p_application_id bigint,
  p_student_id bigint,
  p_admin_note text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_app public.student_applications%rowtype;
  v_session jsonb;
  v_admin_id text;
  v_changes jsonb;
  v_wifaq text;
begin
  perform public.require_app_admin(p_token);
  v_session := public.app_session_validate(p_token);
  v_admin_id := coalesce(v_session->>'account_id',v_session->>'username','admin');

  select * into v_app from public.student_applications where id=p_application_id for update;
  if not found then raise exception 'Student application not found'; end if;
  if not exists(select 1 from public."Students" where id=p_student_id) then raise exception 'Existing student not found'; end if;

  v_wifaq := nullif(btrim(coalesce(v_app.wifaq_registration_no,'')),'');
  v_changes := jsonb_strip_nulls(jsonb_build_object(
    'name',nullif(btrim(coalesce(v_app.name,'')),''),
    'father_name',nullif(btrim(coalesce(v_app.father_name,'')),''),
    'guardian_name',nullif(btrim(coalesce(v_app.guardian_name,'')),''),
    'cnic',nullif(btrim(coalesce(v_app.cnic,'')),''),
    'phone',nullif(btrim(coalesce(v_app.phone,'')),''),
    'date_of_birth',case when v_app.date_of_birth is null then null else v_app.date_of_birth::text end,
    'student_class',nullif(btrim(coalesce(v_app.student_class,'')),''),
    'address',nullif(btrim(coalesce(v_app.address,'')),''),
    'residence_type',nullif(btrim(coalesce(v_app.residence_type,'')),''),
    'admission_type',nullif(btrim(coalesce(v_app.admission_type,'')),''),
    'previous_madrassa',nullif(btrim(coalesce(v_app.previous_madrassa,'')),''),
    'transfer_date',case when v_app.transfer_date is null then null else v_app.transfer_date::text end
  ));

  if v_wifaq is not null then
    if exists(select 1 from public."Students" where admission_no=v_wifaq and id<>p_student_id) then
      raise exception 'Wifaq / admission number belongs to another student';
    end if;
    v_changes := v_changes || jsonb_build_object('admission_no',v_wifaq);
  end if;

  perform public.admin_update_student(p_token,p_student_id,v_changes);

  if v_app.mahrams is not null and jsonb_typeof(v_app.mahrams)='array' and jsonb_array_length(v_app.mahrams)>0 then
    perform set_config('app.audit_actor',v_admin_id,true);
    perform set_config('app.audit_source','duplicate_application_merge',true);
    update public."Students" set mahrams=v_app.mahrams where id=p_student_id;
  end if;

  update public.student_applications
  set status='approved',
      admin_note=coalesce(nullif(btrim(coalesce(p_admin_note,'')),''),'Duplicate application merged into existing student #'||p_student_id::text),
      wifaq_applied=true
  where id=p_application_id;

  insert into public.student_history_events(student_id,event_type,event_at,details,performed_by,approved_by,notes,source)
  values(p_student_id,'duplicate_application_merge',now(),'Duplicate application #'||p_application_id::text||' was merged into the existing student record; no duplicate student was created.',v_admin_id,v_admin_id,p_admin_note,'application_approval');

  return jsonb_build_object('ok',true,'updated_existing',true,'student_id',p_student_id,'application_id',p_application_id);
end;
$$;

grant execute on function public.admin_merge_student_application_into_existing(uuid,bigint,bigint,text) to anon, authenticated;

commit;

-- SUCCESS: website files must also include student-history-addon.js after script.js.
