-- =========================================================
-- 07 - PUBLIC STUDENT ID-CARD QR VERIFICATION
-- Safe public QR: random opaque token; no Admin login needed.
-- Exposes only the fields explicitly required for card verification.
-- =========================================================

begin;

create extension if not exists pgcrypto;

create table if not exists public.id_card_public_verification (
    token text primary key,
    owner_type text not null check (owner_type in ('student','teacher','admin')),
    owner_id bigint not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (owner_type, owner_id)
);

alter table public.id_card_public_verification enable row level security;
revoke all on table public.id_card_public_verification from public, anon, authenticated;

create or replace function public.admin_get_or_create_id_card_verification(
    p_token uuid,
    p_owner_type text,
    p_owner_id bigint
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_type text := lower(btrim(coalesce(p_owner_type,'')));
    v_token text;
begin
    perform public.require_app_admin(p_token);

    if v_type not in ('student','teacher','admin') then
        raise exception 'Invalid owner type';
    end if;
    if coalesce(p_owner_id,0) <= 0 then
        raise exception 'Invalid owner id';
    end if;

    if v_type = 'student' and not exists (select 1 from public."Students" where id = p_owner_id) then
        raise exception 'Student not found';
    elsif v_type = 'teacher' and not exists (select 1 from public."Teachers" where id = p_owner_id) then
        raise exception 'Teacher not found';
    end if;

    select token into v_token
      from public.id_card_public_verification
     where owner_type = v_type and owner_id = p_owner_id and is_active = true
     limit 1;

    if v_token is null then
        v_token := encode(gen_random_bytes(16),'hex');
        insert into public.id_card_public_verification(token,owner_type,owner_id,is_active,created_at,updated_at)
        values(v_token,v_type,p_owner_id,true,now(),now())
        on conflict (owner_type,owner_id)
        do update set token = excluded.token, is_active = true, updated_at = now()
        returning token into v_token;
    end if;

    return jsonb_build_object('token',v_token,'owner_type',v_type);
end;
$$;

create or replace function public.public_get_student_id_card_verification(
    p_verification_token text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_student record;
begin
    select s.* into v_student
      from public.id_card_public_verification v
      join public."Students" s on s.id = v.owner_id
     where v.token = btrim(coalesce(p_verification_token,''))
       and v.owner_type = 'student'
       and v.is_active = true
     limit 1;

    if not found then
        return null;
    end if;

    return jsonb_build_object(
        'name', v_student.name,
        'father_name', v_student.father_name,
        'wifaq_number', v_student.admission_no,
        'admission_no', v_student.admission_no,
        'cnic', v_student.cnic,
        'phone', v_student.phone,
        'student_class', v_student.student_class,
        'date_of_birth', v_student.date_of_birth,
        'address', v_student.address,
        'mahrams', coalesce(v_student.mahrams, '[]'::jsonb)
    );
end;
$$;

revoke all on function public.admin_get_or_create_id_card_verification(uuid,text,bigint) from public;
grant execute on function public.admin_get_or_create_id_card_verification(uuid,text,bigint) to anon, authenticated;

revoke all on function public.public_get_student_id_card_verification(text) from public;
grant execute on function public.public_get_student_id_card_verification(text) to anon, authenticated;

commit;
