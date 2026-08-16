# إكمال ربط Supabase Auth وStorage

نفّذ الملف التالي في **Supabase → SQL Editor** ثم اضغط **Run**:

[`20260816000000_auth_runtime_and_storage.sql`](supabase/migrations/20260816000000_auth_runtime_and_storage.sql)

بعد ظهور رسالة النجاح:

1. افتح **Authentication → Users → Add user** وأنشئ حساب الإدارة ببريدك وكلمة مرور قوية.
2. في SQL Editor نفّذ السطر التالي بعد استبدال البريد فقط:

   ```sql
   UPDATE public.profiles
   SET role = 'super_admin'
   WHERE email = 'YOUR_ADMIN_EMAIL';
   ```

3. افتح **Authentication → URL Configuration** وأضف:

   - Site URL: `https://ezidi-event.vercel.app`
   - Redirect URL: `https://ezidi-event.vercel.app/auth/callback`

4. أعد نشر Vercel بعد رفع هذا التحديث.

النتيجة:

- لوحة الإدارة تسجل الدخول عبر Supabase Auth، ولا تقبل كلمات المرور التجريبية.
- رابط الدعوة يفتح صفحة آمنة لتعيين كلمة المرور ثم يوجّه المدير إلى لوحة الإدارة.
- عند اعتماد منظمة، ينشئ النظام دعوة Supabase Auth للبريد الرسمي ويربط الحساب بالمنظمة كمالك.
- الفعاليات والتصنيفات والمدن تُحفظ في PostgreSQL، وصور الملصقات في Bucket باسم `event-posters`.

إذا لم يصل بريد الدعوة للمنظمة، تأكد من إعداد SMTP في **Authentication → SMTP Settings** أو أنشئ المستخدم يدوياً من Authentication → Users ثم أعد اعتماد المنظمة/اربطه من لوحة الإدارة.
