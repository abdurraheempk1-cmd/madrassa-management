-- Madrassa Management System
-- Secure Account Recovery correction (2026-09-30)
-- Use this ONLY if the earlier recovery SQL was already run.
-- If you have not run the update yet, run database-fixes.sql instead.

begin;

create extension if not exists pgcrypto;


-- Student/Teacher: verified request -> Admin approval.
-- Admin: recovery-code verification -> immediate self-recovery.
-- =========================================================

create table if not exists public.account_recovery_requests (
    id bigserial primary key,
    request_no text not null unique,
    role text not null check (role in ('admin','teacher','student')),
    request_type text not null check (request_type in ('username','password')),
    account_id text not null,
    reference_value text,
    recovery_pin_hash text not null,
    new_password_hash text,
    status text not null default 'pending' check (status in ('pending','approved','rejected','cancelled')),
    admin_note text,
    created_at timestamptz not null default now(),
    reviewed_at timestamptz,
    reviewed_by text
);

create index if not exists account_recovery_requests_status_idx
    on public.account_recovery_requests(status, created_at desc);

create index if not exists account_recovery_requests_account_idx
    on public.account_recovery_requests(role, account_id, request_type);

create table if not exists public.admin_recovery_secrets (
    account_id text primary key,
    recovery_code_hash text not null,
    updated_at timestamptz not null default now()
);

create table if not exists public.account_recovery_audit (
    id bigserial primary key,
    recovery_request_id bigint references public.account_recovery_requests(id) on delete set null,
    action text not null,
    role text,
    account_id text,
    performed_by text,
    note text,
    created_at timestamptz not null default now()
);

alter table public.account_recovery_requests enable row level security;
alter table public.admin_recovery_secrets enable row level security;
alter table public.account_recovery_audit enable row level security;

revoke all on table public.account_recovery_requests from public, anon, authenticated;
revoke all on table public.admin_recovery_secrets from public, anon, authenticated;
revoke all on table public.account_recovery_audit from public, anon, authenticated;

-- =========================================================
-- D. INTERNAL ACCOUNT LOOKUP HELPERS
-- IMPORTANT: these are SECURITY DEFINER helpers and are NOT
-- callable directly by website roles.
-- =========================================================

create or replace function public.recovery_get_username(
    p_role text,
    p_account_id text
) returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_username text;
begin
    if p_role = 'student' and to_regclass('public.student_accounts') is not null then
        execute 'select username from public.student_accounts where id::text = $1 limit 1'
            into v_username using p_account_id;
    elsif p_role = 'teacher' and to_regclass('public.teacher_accounts') is not null then
        execute 'select username from public.teacher_accounts where id::text = $1 limit 1'
            into v_username using p_account_id;
    elsif p_role = 'admin' and to_regclass('public.admin_accounts') is not null then
        execute 'select username from public.admin_accounts where id::text = $1 limit 1'
            into v_username using p_account_id;
    elsif to_regclass('public.accounts') is not null then
        execute 'select username from public.accounts where id::text = $1 and lower(role) = $2 limit 1'
            into v_username using p_account_id, p_role;
    end if;

    return v_username;
end;
$$;

create or replace function public.recovery_set_password_hash(
    p_role text,
    p_account_id text,
    p_password_hash text
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_count integer := 0;
begin
    if p_role = 'student' and to_regclass('public.student_accounts') is not null then
        execute 'update public.student_accounts set password_hash = $1 where id::text = $2'
            using p_password_hash, p_account_id;
        get diagnostics v_count = row_count;
    elsif p_role = 'teacher' and to_regclass('public.teacher_accounts') is not null then
        execute 'update public.teacher_accounts set password_hash = $1 where id::text = $2'
            using p_password_hash, p_account_id;
        get diagnostics v_count = row_count;
    elsif p_role = 'admin' and to_regclass('public.admin_accounts') is not null then
        execute 'update public.admin_accounts set password_hash = $1 where id::text = $2'
            using p_password_hash, p_account_id;
        get diagnostics v_count = row_count;
    elsif to_regclass('public.accounts') is not null then
        execute 'update public.accounts set password_hash = $1 where id::text = $2 and lower(role) = $3'
            using p_password_hash, p_account_id, p_role;
        get diagnostics v_count = row_count;
    end if;

    return v_count > 0;
exception
    when undefined_column then
        raise exception 'Account password_hash column was not found. Check the account table schema.';
end;
$$;

create or replace function public.recovery_resolve_student_account(
    p_reference text,
    p_cnic text,
    p_phone text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_student_id bigint;
    v_account_id text;
    v_username text;
begin
    select s.id
      into v_student_id
    from public."Students" s
    where btrim(coalesce(s.admission_no,'')) = btrim(coalesce(p_reference,''))
      and regexp_replace(coalesce(s.cnic,''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_cnic,''), '[^0-9]', '', 'g')
      and regexp_replace(coalesce(s.phone,''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')
    limit 1;

    if v_student_id is null then
        return null;
    end if;

    if to_regclass('public.student_accounts') is not null then
        execute 'select id::text, username from public.student_accounts where student_id = $1 limit 1'
            into v_account_id, v_username using v_student_id;
    elsif to_regclass('public.accounts') is not null then
        execute 'select id::text, username from public.accounts where student_id = $1 and lower(role) = ''student'' limit 1'
            into v_account_id, v_username using v_student_id;
    end if;

    if v_account_id is null then
        return null;
    end if;

    return jsonb_build_object('account_id', v_account_id, 'username', v_username, 'person_id', v_student_id);
exception
    when undefined_column then
        return null;
end;
$$;

create or replace function public.recovery_resolve_teacher_account(
    p_reference text,
    p_cnic text,
    p_phone text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_teacher_id bigint;
    v_account_id text;
    v_username text;
begin
    select t.id
      into v_teacher_id
    from public."Teachers" t
    where btrim(coalesce(t.teacher_code,'')) = btrim(coalesce(p_reference,''))
      and regexp_replace(coalesce(t.cnic,''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_cnic,''), '[^0-9]', '', 'g')
      and regexp_replace(coalesce(t.phone,''), '[^0-9]', '', 'g') = regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')
    limit 1;

    if v_teacher_id is null then
        return null;
    end if;

    if to_regclass('public.teacher_accounts') is not null then
        execute 'select id::text, username from public.teacher_accounts where teacher_id = $1 limit 1'
            into v_account_id, v_username using v_teacher_id;
    elsif to_regclass('public.accounts') is not null then
        execute 'select id::text, username from public.accounts where teacher_id = $1 and lower(role) = ''teacher'' limit 1'
            into v_account_id, v_username using v_teacher_id;
    end if;

    if v_account_id is null then
        return null;
    end if;

    return jsonb_build_object('account_id', v_account_id, 'username', v_username, 'person_id', v_teacher_id);
exception
    when undefined_column then
        return null;
end;
$$;

create or replace function public.recovery_resolve_admin_account(
    p_recovery_code text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_account_id text;
    v_username text;
begin
    select s.account_id
      into v_account_id
    from public.admin_recovery_secrets s
    where crypt(coalesce(p_recovery_code,''), s.recovery_code_hash) = s.recovery_code_hash
    limit 1;

    if v_account_id is null then
        return null;
    end if;

    v_username := public.recovery_get_username('admin', v_account_id);
    if v_username is null then
        return null;
    end if;

    return jsonb_build_object('account_id', v_account_id, 'username', v_username);
end;
$$;

-- Remove the default PUBLIC execute privilege from every sensitive helper.
revoke all on function public.recovery_get_username(text,text) from public, anon, authenticated;
revoke all on function public.recovery_set_password_hash(text,text,text) from public, anon, authenticated;
revoke all on function public.recovery_resolve_student_account(text,text,text) from public, anon, authenticated;
revoke all on function public.recovery_resolve_teacher_account(text,text,text) from public, anon, authenticated;
revoke all on function public.recovery_resolve_admin_account(text) from public, anon, authenticated;

-- =========================================================
-- E. ADMIN CONFIGURES OWN RECOVERY CODE WHILE LOGGED IN
-- =========================================================

create or replace function public.admin_set_recovery_code(
    p_token uuid,
    p_recovery_code text
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_session jsonb;
    v_account_id text;
begin
    v_session := public.app_session_validate(p_token);
    if coalesce((v_session->>'valid')::boolean, false) is not true
       or lower(coalesce(v_session->>'role','')) <> 'admin' then
        raise exception 'Admin session required';
    end if;

    if length(coalesce(p_recovery_code,'')) < 8 then
        raise exception 'Recovery code must be at least 8 characters';
    end if;

    v_account_id := v_session->>'account_id';
    if nullif(v_account_id,'') is null then
        raise exception 'Admin account could not be identified';
    end if;

    insert into public.admin_recovery_secrets(account_id, recovery_code_hash, updated_at)
    values (v_account_id, crypt(p_recovery_code, gen_salt('bf')), now())
    on conflict (account_id)
    do update set recovery_code_hash = excluded.recovery_code_hash, updated_at = now();

    insert into public.account_recovery_audit(action, role, account_id, performed_by, note)
    values ('admin_recovery_code_updated', 'admin', v_account_id, v_account_id, 'Admin recovery code updated');

    return true;
end;
$$;

-- =========================================================
-- F. PUBLIC RECOVERY REQUEST
-- Student/Teacher stay pending for Admin review.
-- Admin recovery code acts as the verification and completes
-- recovery immediately, so a single Admin cannot lock themself out.
-- =========================================================

create or replace function public.request_account_recovery(
    p_role text,
    p_request_type text,
    p_reference text default null,
    p_cnic text default null,
    p_phone text default null,
    p_admin_recovery_code text default null,
    p_new_password text default null,
    p_recovery_pin text default null
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_role text := lower(btrim(coalesce(p_role,'')));
    v_type text := lower(btrim(coalesce(p_request_type,'')));
    v_resolved jsonb;
    v_account_id text;
    v_username text;
    v_request_no text;
    v_new_hash text;
    v_request_id bigint;
    v_ok boolean;
begin
    if v_role not in ('admin','teacher','student') then
        raise exception 'Invalid account role';
    end if;
    if v_type not in ('username','password') then
        raise exception 'Invalid recovery type';
    end if;
    if length(coalesce(p_recovery_pin,'')) < 4 then
        raise exception 'Recovery PIN must be at least 4 characters';
    end if;

    if v_role = 'student' then
        if nullif(btrim(coalesce(p_reference,'')),'') is null
           or length(regexp_replace(coalesce(p_cnic,''), '[^0-9]', '', 'g')) < 5
           or length(regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')) < 7 then
            raise exception 'Student verification information is incomplete';
        end if;
        v_resolved := public.recovery_resolve_student_account(p_reference, p_cnic, p_phone);
    elsif v_role = 'teacher' then
        if nullif(btrim(coalesce(p_reference,'')),'') is null
           or length(regexp_replace(coalesce(p_cnic,''), '[^0-9]', '', 'g')) < 5
           or length(regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')) < 7 then
            raise exception 'Teacher verification information is incomplete';
        end if;
        v_resolved := public.recovery_resolve_teacher_account(p_reference, p_cnic, p_phone);
    else
        if length(coalesce(p_admin_recovery_code,'')) < 8 then
            raise exception 'Admin recovery code is required';
        end if;
        v_resolved := public.recovery_resolve_admin_account(p_admin_recovery_code);
    end if;

    if v_resolved is null or nullif(v_resolved->>'account_id','') is null then
        raise exception 'Verification failed. Check the provided information.';
    end if;

    v_account_id := v_resolved->>'account_id';
    v_username := v_resolved->>'username';

    if v_type = 'password' then
        if length(coalesce(p_new_password,'')) < 8 then
            raise exception 'New password must be at least 8 characters';
        end if;
        v_new_hash := crypt(p_new_password, gen_salt('bf'));
    end if;

    -- Replace older pending requests of the same type.
    update public.account_recovery_requests
       set status = 'cancelled',
           reviewed_at = now(),
           admin_note = 'Replaced by a newer request',
           new_password_hash = null
     where role = v_role
       and account_id = v_account_id
       and request_type = v_type
       and status = 'pending';

    loop
        v_request_no := 'REC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
        exit when not exists (select 1 from public.account_recovery_requests where request_no = v_request_no);
    end loop;

    if v_role = 'admin' then
        -- Recovery code already verified the Admin. No second Admin is required.
        if v_type = 'password' then
            v_ok := public.recovery_set_password_hash('admin', v_account_id, v_new_hash);
            if not v_ok then
                raise exception 'Admin password could not be updated';
            end if;
        end if;

        insert into public.account_recovery_requests(
            request_no, role, request_type, account_id, reference_value,
            recovery_pin_hash, new_password_hash, status,
            admin_note, reviewed_at, reviewed_by
        ) values (
            v_request_no, 'admin', v_type, v_account_id, 'ADMIN',
            crypt(p_recovery_pin, gen_salt('bf')), null, 'approved',
            'Verified with Admin recovery code', now(), v_account_id
        ) returning id into v_request_id;

        insert into public.account_recovery_audit(
            recovery_request_id, action, role, account_id, performed_by, note
        ) values (
            v_request_id,
            case when v_type = 'password' then 'admin_password_self_recovered' else 'admin_username_self_recovered' end,
            'admin', v_account_id, v_account_id, 'Verified with Admin recovery code'
        );

        return jsonb_build_object(
            'request_no', v_request_no,
            'status', 'approved',
            'request_type', v_type,
            'username', case when v_type = 'username' then v_username else null end
        );
    end if;

    insert into public.account_recovery_requests(
        request_no, role, request_type, account_id, reference_value,
        recovery_pin_hash, new_password_hash, status
    ) values (
        v_request_no, v_role, v_type, v_account_id,
        btrim(coalesce(p_reference,'')),
        crypt(p_recovery_pin, gen_salt('bf')), v_new_hash, 'pending'
    ) returning id into v_request_id;

    insert into public.account_recovery_audit(
        recovery_request_id, action, role, account_id, note
    ) values (v_request_id, 'recovery_requested', v_role, v_account_id, v_type);

    return jsonb_build_object(
        'request_no', v_request_no,
        'status', 'pending',
        'request_type', v_type
    );
end;
$$;

-- =========================================================
-- G. ADMIN REVIEWS STUDENT / TEACHER RECOVERY REQUESTS
-- =========================================================

create or replace function public.admin_get_recovery_requests(
    p_token uuid
) returns table (
    id bigint,
    request_no text,
    role text,
    request_type text,
    reference_value text,
    status text,
    admin_note text,
    created_at timestamptz,
    reviewed_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
    perform public.require_app_admin(p_token);

    return query
    select r.id, r.request_no, r.role, r.request_type, r.reference_value,
           r.status, r.admin_note, r.created_at, r.reviewed_at
      from public.account_recovery_requests r
     order by (r.status = 'pending') desc, r.created_at desc;
end;
$$;

create or replace function public.admin_review_recovery_request(
    p_token uuid,
    p_request_id bigint,
    p_decision text,
    p_admin_note text default null
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_session jsonb;
    v_admin_id text;
    v_request public.account_recovery_requests%rowtype;
    v_decision text := lower(btrim(coalesce(p_decision,'')));
    v_ok boolean;
begin
    perform public.require_app_admin(p_token);
    v_session := public.app_session_validate(p_token);
    v_admin_id := v_session->>'account_id';

    if v_decision not in ('approved','rejected') then
        raise exception 'Invalid recovery decision';
    end if;

    select * into v_request
      from public.account_recovery_requests
     where id = p_request_id
     for update;

    if not found then
        raise exception 'Recovery request not found';
    end if;
    if v_request.status <> 'pending' then
        raise exception 'Recovery request has already been reviewed';
    end if;
    if v_request.role = 'admin' then
        raise exception 'Admin self-recovery is verified by the Admin recovery code and does not use manual approval';
    end if;

    if v_decision = 'approved' and v_request.request_type = 'password' then
        if v_request.new_password_hash is null then
            raise exception 'New password is missing';
        end if;
        v_ok := public.recovery_set_password_hash(v_request.role, v_request.account_id, v_request.new_password_hash);
        if not v_ok then
            raise exception 'Account password could not be updated';
        end if;
    end if;

    update public.account_recovery_requests
       set status = v_decision,
           admin_note = p_admin_note,
           reviewed_at = now(),
           reviewed_by = v_admin_id,
           new_password_hash = null
     where id = p_request_id;

    insert into public.account_recovery_audit(
        recovery_request_id, action, role, account_id, performed_by, note
    ) values (
        p_request_id,
        case when v_decision = 'approved' then 'recovery_approved' else 'recovery_rejected' end,
        v_request.role,
        v_request.account_id,
        v_admin_id,
        p_admin_note
    );

    return true;
end;
$$;

-- =========================================================
-- H. REQUESTER CHECKS STATUS USING REQUEST NUMBER + PIN
-- =========================================================

create or replace function public.get_account_recovery_status(
    p_request_no text,
    p_recovery_pin text
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_request public.account_recovery_requests%rowtype;
    v_username text;
begin
    select * into v_request
      from public.account_recovery_requests
     where upper(request_no) = upper(btrim(coalesce(p_request_no,'')))
     limit 1;

    if not found
       or crypt(coalesce(p_recovery_pin,''), v_request.recovery_pin_hash) <> v_request.recovery_pin_hash then
        raise exception 'Request number or PIN is incorrect';
    end if;

    if v_request.status = 'approved' and v_request.request_type = 'username' then
        v_username := public.recovery_get_username(v_request.role, v_request.account_id);
    end if;

    return jsonb_build_object(
        'request_no', v_request.request_no,
        'role', v_request.role,
        'request_type', v_request.request_type,
        'status', v_request.status,
        'username', v_username,
        'admin_note', v_request.admin_note,
        'created_at', v_request.created_at,
        'reviewed_at', v_request.reviewed_at
    );
end;
$$;

-- =========================================================
-- I. FUNCTION PERMISSIONS
-- Revoke default PUBLIC execute first, then grant only the
-- entry-point RPCs required by the website.
-- =========================================================

revoke all on function public.request_account_recovery(text,text,text,text,text,text,text,text) from public, anon, authenticated;
revoke all on function public.get_account_recovery_status(text,text) from public, anon, authenticated;
revoke all on function public.admin_get_recovery_requests(uuid) from public, anon, authenticated;
revoke all on function public.admin_review_recovery_request(uuid,bigint,text,text) from public, anon, authenticated;
revoke all on function public.admin_set_recovery_code(uuid,text) from public, anon, authenticated;

grant execute on function public.request_account_recovery(text,text,text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.get_account_recovery_status(text,text) to anon, authenticated;
grant execute on function public.admin_get_recovery_requests(uuid) to anon, authenticated;
grant execute on function public.admin_review_recovery_request(uuid,bigint,text,text) to anon, authenticated;
grant execute on function public.admin_set_recovery_code(uuid,text) to anon, authenticated;


commit;
