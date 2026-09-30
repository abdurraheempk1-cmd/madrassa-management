-- =========================================================
-- 09 - PROMOTION / CLASS UPGRADE CONSTRAINT FIX
--
-- IMPORTANT:
-- "students_new_admission_class_check" is an ADMISSION-stage rule.
-- It must not remain on the permanent Students table because a student
-- admitted as "نیا داخلہ" must still be able to progress to higher classes.
--
-- The admission restriction remains on student_applications.
-- The Students table keeps only the valid-class rule.
-- Safe to run more than once.
-- =========================================================

begin;

alter table public."Students"
    drop constraint if exists students_new_admission_class_check;

-- Keep / rebuild the permanent valid-class constraint.
alter table public."Students"
    drop constraint if exists students_class_rule_check;

alter table public."Students"
    add constraint students_class_rule_check
    check (
        student_class in (
            'قاعدہ',
            'ناظرہ',
            'ترجمہ',
            'حفظ',
            'تجوید',
            'اعدادیہ',
            'متوسطہ',
            'ثانویہ خاصہ سال اول',
            'ثانویہ خاصہ سال دوم',
            'عالیہ سال اول',
            'عالیہ سال دوم',
            'عالمیہ سال اول',
            'عالمیہ سال دوم / دورۂ حدیث'
        )
    ) not valid;

-- Admission-stage rule remains only on pending/new applications.
alter table public.student_applications
    drop constraint if exists student_applications_new_admission_class_check;

alter table public.student_applications
    add constraint student_applications_new_admission_class_check
    check (
        admission_type <> 'نیا داخلہ'
        or student_class in (
            'قاعدہ',
            'ناظرہ',
            'ترجمہ',
            'حفظ',
            'تجوید',
            'اعدادیہ',
            'متوسطہ',
            'ثانویہ خاصہ سال اول'
        )
    ) not valid;

commit;
