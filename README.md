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
