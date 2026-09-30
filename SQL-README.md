# SQL Guide

## Production migration method
Supabase SQL Editor کی query-size limit کی وجہ سے production updates کے لیے `sql-parts/` استعمال کریں۔ ایک وقت میں صرف ایک file Run کریں۔

### Part 01 — Core compatibility
Admin/teacher/student frontend compatibility RPCs اور بنیادی secure helpers۔

### Part 02 — Classes + Admission Number
- Valid classes میں `اعدادیہ` شامل ہے۔
- Temporary admission number auto-generate ہوتا ہے۔
- Admin اسے official Wifaq-ul-Madaris number سے replace کر سکتا ہے۔
- Admission number unique رہتا ہے۔

### Part 03 — Recovery tables/helpers
Forgot Username / Forgot Password کے لیے recovery tables, audit اور secure helper functions۔

### Part 04 — Recovery requests
Student/Teacher verification اور recovery request submission/status workflow۔

### Part 05 — Recovery review/security
Admin review, Admin recovery-code flow, permissions اور helper lock-down۔

### Part 06 — Bulk student import
`sql-parts/06-bulk-student-import.sql` Admin Excel/CSV bulk import backend شامل کرتا ہے۔ Imported rows **pending student applications** رہتے ہیں، Wifaq registration number محفوظ ہوتا ہے، اور Admin approval کے وقت وہی official unique `Students.admission_no` بنتا ہے۔ Wifaq number نہ ہو تو temporary admission number جاری رہتا ہے جسے Admin بعد میں edit کر سکتا ہے۔ Legacy registration number بھی محفوظ کیا جاتا ہے۔

## Which SQL should I run now?
- Parts 01-05 پہلے کامیاب ہیں → صرف Part 06 Run کریں۔
- 30-09-2026 update ابھی نہیں ہوئی → 01, 02, 03, 04, 05, 06 ایک ایک کرکے Run کریں۔

## Reference files
- `database_sql_history.sql` — cumulative history/knowledge only؛ اسے sql-parts کے بعد دوبارہ Run نہ کریں۔
- `database-fixes.sql` — older cumulative compatibility file؛ web SQL Editor میں query too large آ سکتی ہے۔
- `database-update-2026-09-30.sql` — older update snapshot.
- `database-update-bulk-student-import.sql` — Part 06 کی standalone copy.
- `secure-account-recovery-fix.sql` — recovery security correction reference/update file.
