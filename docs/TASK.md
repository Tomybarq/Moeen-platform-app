# قائمة المهام للتنفيذ (Phase 1 & Phase 2)

## 🔷 المرحلة 1: لوحة المعلومات التفاعلية (Dashboard)
- `[x]` إنشاء الـ API الخاص بالإحصائيات: `src/app/api/dashboard/stats/route.ts`
- `[x]` إنشاء مكونات لوحة التحكم التفاعلية:
  - `[x]` مكون بطاقة الإحصاء مع خط Sparkline: `src/components/portal/dashboard/StatsCard.tsx`
  - `[x]` مكون رسم النمو البياني الشهري (Bar Chart SVG): `src/components/portal/dashboard/GrowthChart.tsx`
  - `[x]` مكون رسم التوزيع الدائري (Donut Chart SVG): `src/components/portal/dashboard/DistributionChart.tsx`
  - `[x]` مكون النشاط الأخير (Recent Activity): `src/components/portal/dashboard/RecentActivity.tsx`
  - `[x]` مكون مؤشرات الأداء (KPI Section): `src/components/portal/dashboard/KPISection.tsx`
- `[x]` تعديل صفحة لوحة التحكم الرئيسية: `src/app/[locale]/portal/page.tsx`

## 🔷 المرحلة 2: CRUD الكامل لقاعدة البيانات (Full CRUD APIs & Client Components)
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

## 🔷 إضافات ذكية: محرك الاستحقاق التلقائي (Eligibility Engine)
- `[x]` إنشاء محرك احتساب نقاط الاستحقاق الذكي: `src/lib/engine/eligibility.ts`
- `[x]` تعديل نموذج المستفيد في قاعدة البيانات: `prisma/schema.prisma`
- `[x]` إنشاء وتطبيق التهجير البرمجي: `prisma/migrations`
- `[x]` ربط الاحتساب التلقائي بإنشاء المستفيد في الـ API: `src/app/api/beneficiaries/route.ts`

## 🔷 التحقق والاختبار (Verification & Validation)
- `[x]` تشغيل `npm run build` للتحقق من صحة جميع أنواع البيانات والتجميع.
- `[x]` اختبار التشغيل المحلي للتأكد من المزامنة الكاملة.
