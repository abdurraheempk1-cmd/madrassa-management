-- =========================================================
-- 13 - ATTENDANCE SAVE VALIDATION FIX
-- Keeps the database status constraint, but removes the older
-- attendance_save RPC's hard-coded status rejection so the
-- database constraint becomes the single source of truth.
-- Safe to run more than once.
-- =========================================================

begin;

do $$
declare
    r record;
    v_definition text;
    v_patched text;
    v_found boolean := false;
begin
    for r in
        select p.oid
        from pg_proc p
        join pg_namespace n
          on n.oid = p.pronamespace
        where n.nspname = 'public'
          and p.proname = 'attendance_save'
    loop
        v_found := true;

        v_definition :=
            pg_get_functiondef(
                r.oid
            );

        v_patched :=
            regexp_replace(
                v_definition,
                'raise\s+exception\s+''Invalid attendance status''\s*;',
                'null;',
                'gi'
            );

        if v_patched = v_definition then
            raise notice
                'attendance_save found, but old status validation text was not present in this overload.';
        else
            execute v_patched;
        end if;
    end loop;

    if not v_found then
        raise exception
            'public.attendance_save function not found';
    end if;
end;
$$;

alter table public."Attendance"
    drop constraint if exists "Attendance_status_check";

alter table public."Attendance"
    add constraint "Attendance_status_check"
    check (
        lower(
            btrim(
                coalesce(
                    status,
                    ''
                )
            )
        ) in (
            'present',
            'absent',
            'leave',
            'late',
            'حاضر',
            'غیر حاضر',
            'غیرحاضر',
            'رخصت',
            'تاخیر'
        )
    ) not valid;

commit;
