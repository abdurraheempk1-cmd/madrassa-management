-- 07A - QR verification token generator compatibility fix
-- Run this once after 07 if QR card says verification is not active.

begin;

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

    if v_type = 'student'
       and not exists (
           select 1
           from public."Students"
           where id = p_owner_id
       )
    then
        raise exception 'Student not found';
    end if;

    select token
      into v_token
      from public.id_card_public_verification
     where owner_type = v_type
       and owner_id = p_owner_id
       and is_active = true
     limit 1;

    if v_token is null then
        -- Uses PostgreSQL's UUID generator instead of pgcrypto gen_random_bytes.
        v_token := replace(gen_random_uuid()::text, '-', '');

        insert into public.id_card_public_verification(
            token,
            owner_type,
            owner_id,
            is_active,
            created_at,
            updated_at
        )
        values(
            v_token,
            v_type,
            p_owner_id,
            true,
            now(),
            now()
        )
        on conflict (owner_type, owner_id)
        do update
           set token = excluded.token,
               is_active = true,
               updated_at = now()
        returning token into v_token;
    end if;

    return jsonb_build_object(
        'token', v_token,
        'owner_type', v_type
    );
end;
$$;

revoke all
on function public.admin_get_or_create_id_card_verification(uuid,text,bigint)
from public;

grant execute
on function public.admin_get_or_create_id_card_verification(uuid,text,bigint)
to anon, authenticated;

commit;
