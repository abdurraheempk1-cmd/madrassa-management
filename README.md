# مدرسہ شہناز اختر للبنات — مینجمنٹ سسٹم

## تنصیب

1. Supabase Dashboard میں **SQL Editor** کھولیں۔
2. `database-fixes.sql` کا مکمل code Run کریں۔
3. تمام فائلیں GitHub repository کی root میں upload کریں۔
4. GitHub Pages یا اپنے hosting provider پر `index.html` کھولیں۔

## اہم بات

- `index.html` کا public introduction page اور اس کا account-selection modal محفوظ رکھا گیا ہے۔
- `database-fixes.sql` موجودہ database کو حذف نہیں کرتا؛ یہ صرف frontend کے لیے درکار secure compatibility functions شامل کرتا ہے۔
- database میں uppercase اور lowercase ناموں والی parallel tables موجود ہیں۔ موجودہ system کا custom session حصہ uppercase tables استعمال کرتا ہے؛ انہیں ابھی manually delete یا rename نہ کریں۔
- `madrassa-documents` bucket private رہنا چاہیے۔

## مکمل کیے گئے صفحات

- Admin finance
- مدرسہ میں رہائش / آمد و رفت
- سالانہ ترقی
- شناختی کارڈ
- جامع رپورٹس
- Teacher dashboard
- Student dashboard

## بنیادی جانچ

- JavaScript syntax verification
- تمام local page links verification
- duplicate HTML IDs verification
- Supabase public RPC connectivity verification
- custom session RPC اور RLS access-path alignment

## 30-09-2026 Update

- نئی جماعت: **اعدادیہ**
- طالبہ کا Admission Number خالی ہو تو temporary نمبر خود بن سکتا ہے۔
- Admin طالبہ کا Admission/Wifaq Number edit کر سکتا ہے؛ duplicate نمبر قبول نہیں ہوگا۔
- Login page پر Student, Teacher اور Admin کے لیے **صارف نام بھول گئے؟** اور **پاس ورڈ بھول گئے؟** شامل ہیں۔
- Student/Teacher recovery میں شناخت کی تصدیق کے بعد request Admin approval کے لیے جاتی ہے۔
- Admin پہلے `admin-settings.html` میں اپنا محفوظ Recovery Code مقرر کرے۔
- Recovery requests `admin-accounts.html` میں approve/reject کی جا سکتی ہیں۔
- SQL history/reference کے لیے `database_sql_history.sql` اور `SQL-README.md` شامل ہیں۔

### Database update
Supabase SQL Editor میں backup کے بعد مکمل `database-fixes.sql` Run کریں۔ اگر پرانا cumulative SQL پہلے Run ہو چکا ہو تو صرف `database-update-2026-09-30.sql` بھی Run کیا جا سکتا ہے۔
