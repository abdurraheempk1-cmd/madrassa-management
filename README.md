# مدرسہ شہناز اختر للبنات — مکمل مینجمنٹ سسٹم

## انسٹال / اپڈیٹ

### 1) Supabase SQL
`SQL-RUN-IN-ORDER.txt` کھولیں۔

اگر Parts 01-05 پہلے کامیابی سے Run ہو چکے ہیں تو اب صرف:

`sql-parts/06-bulk-student-import.sql`

Run کریں۔

اگر 30-09-2026 کی SQL ابھی بالکل Run نہیں کی گئی تو `sql-parts` کی 01 سے 06 تک files ایک ایک کرکے numeric order میں Run کریں۔ ہر file کے بعد Success آنے کا انتظار کریں۔ پوری `database-fixes.sql` کو SQL Editor میں ایک ساتھ paste نہ کریں کیونکہ query size limit آ سکتی ہے۔

### 2) GitHub Pages
اس project folder کی تمام website files اپنے GitHub repository میں replace/upload کریں۔

### 3) Admin Recovery
Admin login کریں → Admin Settings → کم از کم 8 حروف/ہندسوں کا Recovery Code محفوظ کریں۔

### 4) Multiple Students Import
Admin → Accounts & Approvals → **ایکسل سے طالبات درآمد کریں**۔

Excel/CSV منتخب کریں → Preview → Import۔ تمام imported records Pending رہیں گے۔ Admin ایک یا متعدد pending applications منتخب کرکے approve کر سکتا ہے۔

`import-samples/` میں template اور آپ کے فراہم کردہ 42 rows کی ready CSV موجود ہے۔

### 5) Languages
ہر page پر اردو، English، العربية اور پښتو language option موجود ہے۔ منتخب language browser میں save رہتی ہے اور navigation کے ساتھ برقرار رہتی ہے۔ Print/PDF labels بھی selected language follow کرتے ہیں، جبکہ طالبات/اساتذہ کے اصل saved names, numbers, phone, CNIC اور addresses جیسے data کو اصل شکل میں رکھا جاتا ہے۔

### 6) Professional Print / PDF
Complete Profile report اب official document style میں بنتی ہے: madrassa header, identity summary, structured sections, financial/attendance/result sections, clean tables, signature/stamp area۔ Internal technical database fields print report میں نہیں دکھائے جاتے۔

## اہم SQL files
- `sql-parts/01-core-compatibility.sql`
- `sql-parts/02-classes-admission-number.sql`
- `sql-parts/03-recovery-tables-helpers.sql`
- `sql-parts/04-recovery-request.sql`
- `sql-parts/05-recovery-review-permissions.sql`
- `sql-parts/06-bulk-student-import.sql`
- `database_sql_history.sql` — صرف knowledge/reference کے لیے cumulative SQL history

مزید ہدایات کے لیے `RUN-FIRST.txt`, `SQL-RUN-IN-ORDER.txt`, `SQL-README.md` اور `IMPORT-STUDENTS-README.txt` دیکھیں۔
