# SQL Reference — مدرسہ مینجمنٹ سسٹم

یہ فولڈر/پروجیکٹ میں موجود SQL فائلوں کی مختصر وضاحت ہے۔

## `database-fixes.sql`
یہ **current cumulative SQL** ہے۔ Supabase SQL Editor میں database backup لینے کے بعد یہی مکمل file Run کریں۔

اس میں شامل اہم چیزیں:
- Admin student/teacher update RPCs
- Attendance / marks compatibility functions
- Feedback / homework support functions
- Student class constraints
- نئی جماعت **اعدادیہ**
- طالبہ کا temporary/default Admission Number
- Admin کے ذریعے Admission/Wifaq Number edit کرنے کی سہولت
- Forgot Username / Forgot Password recovery workflow
- Student/Teacher verification + Admin approval
- Admin recovery code
- Recovery audit log

## `database-update-2026-09-30.sql`
صرف 30-09-2026 کے نئے changes ہیں۔ اگر پرانا `database-fixes.sql` پہلے run ہو چکا ہے تو صرف یہ update بھی run کیا جا سکتا ہے۔

## `database_sql_history.sql`
Knowledge/reference کے لیے cumulative history copy ہے۔ Production میں عام طور پر `database-fixes.sql` run کرنا کافی ہے۔

## Account Recovery Flow
1. Student/Teacher Login page پر **صارف نام بھول گئے؟** یا **پاس ورڈ بھول گئے؟** کھولے۔
2. Student: Admission/Wifaq Number + CNIC/B-Form + Phone سے verification۔
3. Teacher: Teacher Code + CNIC + Phone سے verification۔
4. Admin: پہلے `admin-settings.html` میں اپنا Recovery Code محفوظ کرے۔
5. Student/Teacher request `pending` بنتی ہے اور Admin `admin-accounts.html` میں approve/reject کرتا ہے۔
6. Admin recovery میں محفوظ Recovery Code خود verification ہے؛ کامیاب verification کے بعد recovery فوراً مکمل ہو جاتی ہے، دوسرے Admin کی ضرورت نہیں۔
7. Requester Request Number + PIN سے status دوبارہ دیکھ سکتا ہے۔
8. Username recovery approve/verify ہو تو username دکھتا ہے؛ password recovery approve/verify ہو تو نیا password فعال ہو جاتا ہے.

## Admission Number Rule
- اگر نئی Student row میں Admission Number خالی ہو تو system `TMP-YYYY-######` temporary number بناتا ہے۔
- وفاق المدارس کا official number ملنے کے بعد Admin Student edit میں اسے replace کر سکتا ہے۔
- duplicate Admission Number reject ہوگا۔

## Important
SQL چلانے سے پہلے Supabase backup لینا بہتر ہے۔ اگر آپ کے account table columns مختلف ہوں تو recovery RPC error واضح طور پر بتائے گا؛ ایسی صورت میں schema screenshot/column list کے مطابق migration adjust کی جا سکتی ہے۔


## Security correction — 2026-09-30
- Sensitive internal recovery helper functions سے `PUBLIC`, `anon` اور `authenticated` کا direct execute access ختم کیا گیا ہے۔
- صرف required RPC entry points website کے لیے executable ہیں۔
- Admin Recovery Code کم از کم 8 characters رکھا گیا ہے۔
- Admin self-recovery valid Recovery Code سے فوراً مکمل ہوتی ہے، اس لیے single-Admin setup میں lockout نہیں ہوگا۔
- Pending password hash approval/rejection/cancellation کے بعد صاف کر دیا جاتا ہے۔
- اگر پچھلا recovery SQL پہلے run ہو چکا ہو تو `secure-account-recovery-fix.sql` run کیا جا سکتا ہے؛ ورنہ صرف `database-fixes.sql` کافی ہے۔

## Supabase web SQL Editor size limit
If the editor shows **“Query is too large to be run via the SQL Editor”**, do not run `database-fixes.sql` as one block. Use the files in `sql-parts/` in numeric order, waiting for success after each file.
