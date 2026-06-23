# قائمة المهام للتنفيذ (Moeen Platform Task Board)

## 🔷 المرحلة 1: لوحة المعلومات التفاعلية (Dashboard) - [مكتملة]
- `[x]` إنشاء الـ API الخاص بالإحصائيات: `src/app/api/dashboard/stats/route.ts`
- `[x]` إنشاء مكونات لوحة التحكم التفاعلية:
  - `[x]` مكون بطاقة الإحصاء مع خط Sparkline: `src/components/portal/dashboard/StatsCard.tsx`
  - `[x]` مكون رسم النمو البياني الشهري (Bar Chart SVG): `src/components/portal/dashboard/GrowthChart.tsx`
  - `[x]` مكون رسم التوزيع الدائري (Donut Chart SVG): `src/components/portal/dashboard/DistributionChart.tsx`
  - `[x]` مكون النشاط الأخير (Recent Activity): `src/components/portal/dashboard/RecentActivity.tsx`
  - `[x]` مكون مؤشرات الأداء (KPI Section): `src/components/portal/dashboard/KPISection.tsx`
- `[x]` تعديل صفحة لوحة التحكم الرئيسية: `src/app/[locale]/portal/page.tsx`

## 🔷 المرحلة 2: CRUD الكامل لقاعدة البيانات (Full CRUD) - [مكتملة]
- `[x]` إنشاء واجهات برمجة التطبيقات (APIs):
  - `[x]` الـ API للجمعيات: `src/app/api/associations/route.ts` و `[id]/route.ts`
  - `[x]` الـ API للمستفيدين: `src/app/api/beneficiaries/route.ts` و `[id]/route.ts`
  - `[x]` الـ API للمسوقين: `src/app/api/marketers/route.ts` و `[id]/route.ts`
- `[x]` تحديث المكونات التفاعلية للـ CRUD لتتصل بقاعدة البيانات مباشرة:
  - `[x]` تحديث `src/components/portal/AssociationsClient.tsx`
  - `[x]` تحديث `src/components/portal/BeneficiariesClient.tsx`
  - `[x]` تحديث `src/components/portal/MarketersClient.tsx`
- `[x]` تحديث صفحات الخادم لتكون وسيطة تمرير بسيطة:
  - `[x]` تحديث `src/app/[locale]/portal/associations/page.tsx`
  - `[x]` تحديث `src/app/[locale]/portal/beneficiaries/page.tsx`
  - `[x]` تحديث `src/app/[locale]/portal/marketers/page.tsx`
- `[x]` إضافات ذكية: محرك الاستحقاق التلقائي (Eligibility Engine)
  - `[x]` إنشاء محرك احتساب نقاط الاستحقاق الذكي: `src/lib/engine/eligibility.ts`
  - `[x]` تعديل نموذج المستفيد في قاعدة البيانات: `prisma/schema.prisma`
  - `[x]` إنشاء وتطبيق التهجير البرمجي: `prisma/migrations`
  - `[x]` ربط الاحتساب التلقائي بإنشاء المستفيد في الـ API: `src/app/api/beneficiaries/route.ts`

## 🔷 المرحلة 3: إدارة الملفات والوسائط (File & Media Management) - [مكتملة]
- `[x]` تعديل هيكل قاعدة البيانات: إضافة حقل `image String?` لنماذج (Association, Beneficiary, Marketer) في `prisma/schema.prisma`
- `[x]` إنشاء وتطبيق التهجير البرمجي بقاعدة البيانات: `prisma/migrations/..._add_image_fields`
- `[x]` إنشاء مكتبة التحقق وحفظ الملفات المرفوعة: `src/lib/upload.ts` (التحقق من الحجم 5MB والنوع JPG, PNG, WEBP وتجنب الكتابة المتكررة وتسمية الملف بـ UUID)
- `[x]` إنشاء نقطة وصول موحدة لرفع الملفات: `POST /api/upload/route.ts`
- `[x]` تحديث نقاط وصول الـ APIs (الجمعيات والمستفيدين والمسوقين والمستخدمين) لحفظ وتعديل الصور.
- `[x]` بناء مكون الرفع التفاعلي (السحب والإفلات ومعاينة الصورة وحالة الرفع): `src/components/ui/ImageUpload.tsx`
- `[x]` دمج مكون الرفع في شاشات ونماذج الإضافة والتعديل للمستفيدين والمسوقين والجمعيات والملف الشخصي للمستخدم.

## 🔷 المرحلة 4: نظام التنبيهات في الوضع الافتراضي (Notification System in Mock Mode) - [مكتملة]
- `[x]` تعديل هيكل قاعدة البيانات: إضافة جدول التنبيهات `Notification` وربطه بالمستخدم في `prisma/schema.prisma`
- `[x]` إنشاء وتطبيق التهجير البرمجي بقاعدة البيانات: `prisma/migrations/..._add_notification_model`
- `[x]` إنشاء مكتبة الإرسال والمحاكاة: `src/lib/notifications.ts` (يقوم بالحفظ لقناة in-app وطباعة محاكاة واضحة للـ SMS والـ Email في الـ Console)
- `[x]` إنشاء نقاط وصول الـ APIs الخاصة بالتنبيهات:
  - `[x]` جلب التنبيهات وتعيينها كمقروءة دفعة واحدة: `src/app/api/notifications/route.ts`
  - `[x]` تعيين تنبيه محدد كمقروء: `src/app/api/notifications/[id]/route.ts`
- `[x]` ربط نظام التنبيهات بعمليات الـ CRUD الحالية (إضافة جمعية، إضافة مستفيد مع تفاصيل أهليته، إضافة مسوق).
- `[x]` بناء واجهة جرس التنبيهات وتحديث الشارة وعرض القائمة المنسدلة والتحديث التلقائي كل 30 ثانية في ترويسة الموقع `src/components/portal/Header.tsx`.

## 🔷 المرحلة الثانية المتقدمة: تتبع العمليات وحماية البيانات والتدفق (Phase 2 Advanced) - [مكتملة]
- `[x]` إنشاء نظام تتبع العمليات المتقدم (Advanced Event Tracking):
  - `[x]` إضافة نموذج `SystemEvent` مع فهارس الأداء بقاعدة البيانات.
  - `[x]` إنشاء دالة التسجيل بالخلفية `logEvent` في `src/lib/eventLogger.ts` واستخراج الـ IP ديناميكياً.
  - `[x]` ربط الـ logging بكافة واجهات الـ CRUD والـ Export.
- `[x]` إنشاء طبقة حماية الخصوصية وحجب البيانات (PDPL Protection Layer):
  - `[x]` تحديث نموذج `Beneficiary` ليشمل الهوية والجوال وقواعد التحقق في `zodSchemas.ts`.
  - `[x]` بناء دالة الحجب الذاتي `maskSensitiveData` في `src/lib/dataMasking.ts`.
  - `[x]` ربط الحجب بنقاط وصول المستفيدين والتحقق من صلاحية الأدوار غير الإدارية.
- `[x]` إنشاء نظام تصدير البيانات المتدفق (Streaming CSV Export):
  - `[x]` بناء نقطة وصول التصدير التدفقي البسيط `GET /api/export` باستخدام `ReadableStream`.
  - `[x]` استخدام المؤشر (Cursor-based pagination) على دفعات بحجم 100 سجل.
  - `[x]` إضافة ترميز UTF-8 BOM وتأمين حماية البيانات حسب الدور.
- `[x]` تفعيل التنبيهات الموجهة بالأحداث (Event-Driven Notifications):
  - `[x]` بناء موزع الأحداث `notificationDispatcher` في `src/lib/notificationEngine.ts` باستخدام `EventEmitter`.
  - `[x]` تسجيل مستمعي الأحداث لعمليات الإنشاء والتعديل.
  - `[x]` إلغاء الـ APIs للحظر المباشر واستخدام إطلاق الأحداث غير المتزامن بالخلفية.

## 🔷 التحقق والاختبار (Verification & Validation)
- `[x]` تشغيل `npm run build` للتحقق من صحة جميع أنواع البيانات والتجميع.
- `[x]` اختبار التشغيل المحلي للتأكد من المزامنة الكاملة.
