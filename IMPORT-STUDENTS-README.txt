MULTIPLE STUDENT IMPORT

1. First run sql-parts/06-bulk-student-import.sql in Supabase if Parts 01-05 are already complete.
2. Upload the updated website project to GitHub.
3. Login as Admin.
4. Open Accounts & Approvals.
5. Open "ایکسل سے طالبات درآمد کریں".
6. Choose your Excel/CSV file.
7. Press Preview and review warnings/errors.
8. Press Import.
9. Imported applications stay Pending.
10. Select one or multiple pending applications and approve them as Admin.

Expected Excel columns:
رقم التسجیل | رجسٹریشن | نام | ولدیت | درجہ | تاريخ پیدائش | شناختی کارڈ | رابطہ نمبر | موجودہ پتہ

Class normalization:
خاصہ سال اول -> ثانویہ خاصہ سال اول
خاصہ سال دوم -> ثانویہ خاصہ سال دوم
اعدادیہ is valid.

Admission number behavior:
- If رقم التسجیل / Wifaq number exists, it becomes the official admission number at approval.
- If it is blank, the system creates a temporary admission number.
- Admin can later replace the temporary number with the official Wifaq number.
- Admission/Wifaq numbers must remain unique.
