# خطة تنفيذ المرحلة الثانية (Implementation Plan — Phase 2 Execution)

بصفتي كبير مهندسي البرمجيات والمسؤول التقني، قمت بإعداد خطة تفصيلية متوافقة بالكامل مع هيكل مشروع منصة "معين الرقمية" لتنفيذ المهام المطلوبة.

---

## 🖥️ تحليل المستودع (Repository Analysis)

تم فحص بنية المجلدات وقاعدة البيانات وتحديد المكونات الحالية:
1. **نظام الجلسات والصلاحيات (Auth & Session):** يرتكز على ملف `src/lib/auth.ts` ويستخدم JWT مع تشفير `jose` لتسجيل الجلسة وتخزين حقول `role` (اسم الدور) و `roleType` (نوع الصلاحية العام).
2. **الـ APIs الحالية:** توجد طبقة للـ CRUD في `src/app/api/beneficiaries` و `src/app/api/associations` و `src/app/api/marketers`.
3. **نظام التنبيهات الحالي:** مبني على مكتبة الـ Upload ونقطة وصول الـ API ونظام الإرسال المباشر للـ Mock notifications في `src/lib/notifications.ts`.
4. **هيكل قاعدة البيانات:** يقع في `prisma/schema.prisma` ويستخدم محرك PostgreSQL.

---

## ⚡ تحليل الأثر (Impact Analysis)

الملفات التي ستتأثر مباشرة بالتغييرات هي:
1. **`prisma/schema.prisma`:** لإضافة النماذج الجديدة (`SystemEvent` وحقول البيانات الشخصية لـ `Beneficiary`).
2. **`src/lib/zodSchemas.ts`:** لتحديث التحقق من بيانات المستفيدين وإضافة حقول الهوية والجوال.
3. **`src/app/api/beneficiaries/route.ts` و `[id]/route.ts`:** لدمج الحقول الجديدة وتطبيق طبقة حماية البيانات الشخصية (PDPL) وتتبع الأحداث وإطلاق التنبيهات عبر الأحداث.
4. **`src/app/api/associations/route.ts` و `[id]/route.ts`:** لتتبع الأحداث وإطلاق تنبيهات تسجيل وتحديث الجمعيات.
5. **`src/components/portal/Header.tsx`:** لتطبيق الجرس والتحديث التلقائي للتنبيهات.

---

## 🔷 خطة التنفيذ التفصيلية (Implementation Plan)

### Task 1 — Advanced Event Tracking (تتبع الأحداث المتقدم)
1. **قاعدة البيانات:** إضافة نموذج `SystemEvent` إلى `prisma/schema.prisma` مع تحديد الفهارس (Indexes) اللازمة لضمان سرعة الاستعلام.
2. **التهجير البرمجي:** إنشاء وتطبيق ملف التهجير عبر Prisma.
3. **مكتبة التسجيل (`src/lib/eventLogger.ts`):** بناء الدالة `logEvent` لتسجيل الأحداث في الخلفية دون تعطيل عمل الـ APIs مع استخراج عنوان الـ IP ديناميكياً من طلبات الخادم.
4. **التكامل:** دمج الدالة في عمليات إنشاء وتعديل وحذف المستفيدين والجمعيات والمسوقين.

### Task 2 — Streaming CSV Export (تصدير البيانات المتدفق)
1. **نقطة الوصول (`src/app/api/export/route.ts`):** بناء API تدعم استعلام `type=beneficiaries` للتحقق من الصلاحيات وتصدير البيانات تدفقياً عبر `ReadableStream`.
2. **تقسيم البيانات:** جلب البيانات على دفعات (Batch size = 100) باستخدام المؤشر (Cursor-based pagination) لتفادي استهلاك الذاكرة.
3. **التوافقية:** إضافة UTF-8 BOM (`\uFEFF`) لضمان فتح الملف بشكل سليم في برنامج Excel وتوافقه مع الأحرف العربية.

### Task 3 — PDPL Data Protection Layer (حماية البيانات الشخصية)
1. **إضافة الحقول لقاعدة البيانات:** إضافة حقول `nationalId` و `phone` إلى جدول `Beneficiary` في `prisma/schema.prisma` لتخزينها في قاعدة البيانات بشكل خام.
2. **التحقق من البيانات:** تحديث `beneficiarySchema` في `src/lib/zodSchemas.ts` للسماح ببيانات الهاتف والهوية الوطنية.
3. **مكتبة الحجب ومراقبة الصلاحيات (`src/lib/dataMasking.ts`):** 
   - كتابة دالة `maskSensitiveData(data, roleName)` لحجب الأرقام المتوسطة للهوية الوطنية والجوال (مثل `12*******45` و `05*****89`).
   - التحقق من صلاحيات الدور (Admin, Super Admin) والسماح بالبيانات الخام لهم فقط.
4. **التكامل مع الـ API:** تطبيق الحجب ديناميكياً في `GET /api/beneficiaries` قبل إرجاع الاستجابة.

### Task 4 — Event-Driven Notifications (التنبيهات الموجهة بالأحداث)
1. **محرك التنبيهات التفاعلي (`src/lib/notificationEngine.ts`):** 
   - تعريف `notificationDispatcher` باستخدام `EventEmitter` من Node.js.
   - الاستماع لأحداث: `beneficiary.created`, `beneficiary.updated`, `association.created`, `association.updated`.
2. **التكامل غير المتزامن:** استبدال الاستدعاء المباشر في الـ APIs بنظام إطلاق الأحداث (`.emit`) لإرجاع الاستجابة فوراً للمستخدم، وتولي المعالجة والرفع في الخلفية.

---

## 🔒 المراجعة الأمنية والسرعة (Security & Performance Review)

* **الأمان:** لن تصل البيانات الشخصية الحساسة (الهوية والجوال) إلى متصفح المستخدم غير المصرح له أبداً، حيث يتم حجبها في جانب الخادم (Server-Side) قبل الإرسال.
* **السرعة وقابلية التوسع:**
  - يتم تتبع الأحداث وحفظها في قاعدة البيانات بشكل غير معطل (Non-blocking) ومغلف بـ `Promise`.
  - عملية تصدير الـ CSV لا تحمل كامل السجلات في الذاكرة (Memory-efficient), بل تصدرها كتيار متدفق (Chunks), مما يحافظ على استقرار السيرفر عند وجود ملايين السجلات.

---

## 🛠️ خطة التحقق الفني (Validation Commands)
سنقوم بتشغيل الأوامر التالية للتأكد من خلو المشروع من أخطاء التجميع والنوع:
```bash
npx prisma migrate dev --name add_system_event_and_pdpl_fields
npm run build
```
