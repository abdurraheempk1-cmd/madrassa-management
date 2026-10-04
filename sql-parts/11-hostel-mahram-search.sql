-- =========================================================
-- 11 - HOSTEL / MOVEMENT MAHRAM SEARCH DATA
-- Returns students together with their approved mahram JSON.
-- Safe to run more than once.
-- =========================================================

begin;

create or replace function public.admin_get_students_with_mahrams(
    p_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
    v_result jsonb;
begin
    perform public.require_app_admin(p_token);

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'id', s.id,
                'admission_no', s.admission_no,
                'name', s.name,
                'father_name', s.father_name,
                'guardian_name', s.guardian_name,
                'phone', s.phone,
                'cnic', s.cnic,
                'student_class', s.student_class,
                'residence_type', s.residence_type,
                'address', s.address,
                'mahrams',
                    coalesce(
                        (
                            select jsonb_agg(
                                case
                                    when jsonb_typeof(m.value) = 'object'
                                    then m.value || jsonb_build_object(
                                        'mahram_index',
                                        m.ordinality
                                    )
                                    else jsonb_build_object(
                                        'name',
                                        m.value::text,
                                        'mahram_index',
                                        m.ordinality
                                    )
                                end
                                order by m.ordinality
                            )
                            from jsonb_array_elements(
                                coalesce(s.mahrams,'[]'::jsonb)
                            ) with ordinality as m(value, ordinality)
                        ),
                        '[]'::jsonb
                    )
            )
            order by s.name, s.id
        ),
        '[]'::jsonb
    )
    into v_result
    from public."Students" s;

    return v_result;
end;
$$;

revoke all
on function public.admin_get_students_with_mahrams(uuid)
from public;

grant execute
on function public.admin_get_students_with_mahrams(uuid)
to anon, authenticated;

commit;
