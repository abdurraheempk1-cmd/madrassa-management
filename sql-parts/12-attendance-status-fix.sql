-- =========================================================
-- 12 - ATTENDANCE STATUS CONSTRAINT FIX
-- Fixes "Attendance_status_check" rejecting leave / late.
-- Safe to run more than once.
-- =========================================================

begin;

alter table public."Attendance"
    drop constraint if exists "Attendance_status_check";

alter table public."Attendance"
    add constraint "Attendance_status_check"
    check (
        lower(btrim(coalesce(status,''))) in (
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
