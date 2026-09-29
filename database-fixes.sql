-- Madrassa Management System compatibility migration
-- Run once in Supabase SQL Editor after taking a database backup.

begin;

create or replace function public.admin_update_student(
  p_token uuid,
  p_student_id bigint,
  p_changes jsonb
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.require_app_admin(p_token);

  update public."Students"
  set name = coalesce(nullif(p_changes->>'name',''), name),
      father_name = coalesce(p_changes->>'father_name', father_name),
      guardian_name = coalesce(p_changes->>'guardian_name', guardian_name),
      phone = coalesce(p_changes->>'phone', phone),
      cnic = coalesce(p_changes->>'cnic', cnic),
      date_of_birth = coalesce(nullif(p_changes->>'date_of_birth','')::date, date_of_birth),
      student_class = coalesce(nullif(p_changes->>'student_class',''), student_class),
      address = coalesce(p_changes->>'address', address),
      residence_type = coalesce(nullif(p_changes->>'residence_type',''), residence_type)
  where id = p_student_id;

  return found;
end;
$$;

create or replace function public.admin_update_teacher(
  p_token uuid,
  p_teacher_id bigint,
  p_changes jsonb
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.require_app_admin(p_token);

  update public."Teachers"
  set name = coalesce(nullif(p_changes->>'name',''), name),
      father_name = coalesce(p_changes->>'father_name', father_name),
      phone = coalesce(p_changes->>'phone', phone),
      cnic = coalesce(p_changes->>'cnic', cnic),
      date_of_birth = coalesce(nullif(p_changes->>'date_of_birth','')::date, date_of_birth),
      qualification = coalesce(p_changes->>'qualification', qualification),
      specialization = coalesce(p_changes->>'specialization', specialization),
      experience_years = coalesce(nullif(p_changes->>'experience_years','')::integer, experience_years),
      teaching_class = coalesce(p_changes->>'teaching_class', teaching_class),
      subject = coalesce(p_changes->>'subject', subject),
      address = coalesce(p_changes->>'address', address),
      updated_at = now()
  where id = p_teacher_id;

  return found;
end;
$$;

create or replace function public.admin_update_attendance(
  p_token uuid,
  p_attendance_id bigint,
  p_status text,
  p_note text default null
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.require_app_admin(p_token);

  if p_status not in ('present','absent','leave','late','حاضر','غیر حاضر','غیرحاضر','رخصت','تاخیر') then
    raise exception 'Invalid attendance status';
  end if;

  update public."Attendance"
  set status = p_status,
      note = p_note
  where id = p_attendance_id;

  return found;
end;
$$;

create or replace function public.admin_update_marks(
  p_token uuid,
  p_marks_id bigint,
  p_obtained_marks numeric,
  p_total_marks numeric,
  p_note text default null
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.require_app_admin(p_token);

  if p_total_marks <= 0 or p_obtained_marks < 0 or p_obtained_marks > p_total_marks then
    raise exception 'Invalid marks';
  end if;

  update public."Marks"
  set obtained_marks = p_obtained_marks,
      total_marks = p_total_marks,
      note = p_note
  where id = p_marks_id;

  return found;
end;
$$;

create or replace function public.admin_get_feedback(p_token uuid)
returns setof public.student_feedback
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.require_app_admin(p_token);
  return query
    select * from public.student_feedback
    order by feedback_date desc, id desc;
end;
$$;

create or replace function public.teacher_get_feedback(p_token uuid)
returns setof public.student_feedback
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_teacher_id bigint;
begin
  v_teacher_id := public.require_teacher_session(p_token);
  return query
    select * from public.student_feedback
    where teacher_id = v_teacher_id
    order by feedback_date desc, id desc;
end;
$$;

create or replace function public.homework_get_submissions(
  p_token uuid,
  p_homework_id bigint
) returns setof public."HomeworkSubmissions"
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_session jsonb;
  v_role text;
  v_teacher_id bigint;
begin
  v_session := public.app_session_validate(p_token);
  if coalesce((v_session->>'valid')::boolean, false) is not true then
    raise exception 'Invalid or expired session';
  end if;

  v_role := lower(coalesce(v_session->>'role',''));

  if v_role = 'admin' then
    return query
      select hs.*
      from public."HomeworkSubmissions" hs
      where hs.homework_id = p_homework_id
      order by hs.submitted_at desc;
  elsif v_role = 'teacher' then
    v_teacher_id := public.require_teacher_session(p_token);
    return query
      select hs.*
      from public."HomeworkSubmissions" hs
      join public."Homework" h on h.id = hs.homework_id
      where hs.homework_id = p_homework_id
        and h.teacher_id = v_teacher_id
      order by hs.submitted_at desc;
  else
    raise exception 'Not authorized';
  end if;
end;
$$;

grant execute on function public.admin_update_student(uuid,bigint,jsonb) to anon, authenticated;
grant execute on function public.admin_update_teacher(uuid,bigint,jsonb) to anon, authenticated;
grant execute on function public.admin_update_attendance(uuid,bigint,text,text) to anon, authenticated;
grant execute on function public.admin_update_marks(uuid,bigint,numeric,numeric,text) to anon, authenticated;
grant execute on function public.admin_get_feedback(uuid) to anon, authenticated;
grant execute on function public.teacher_get_feedback(uuid) to anon, authenticated;
grant execute on function public.homework_get_submissions(uuid,bigint) to anon, authenticated;

commit;
