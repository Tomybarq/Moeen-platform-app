import { Prisma } from "@prisma/client";
import prisma from "./prisma";

/**
 * واجهة تمثل مرشحات الاستعلام الخاصة بـ Row-Level Security (RLS) لكل نموذج في قاعدة البيانات.
 * تضمن هذه الواجهة تماثل أنواع البيانات وتطابقها مع مدخلات استعلام Prisma.
 */
export interface RlsFilters {
  association: Prisma.AssociationWhereInput;
  marketer: Prisma.MarketerWhereInput;
  beneficiary: Prisma.BeneficiaryWhereInput;
  user: Prisma.UserWhereInput;
  notification: Prisma.NotificationWhereInput;
  systemEvent: Prisma.SystemEventWhereInput;
}

/**
 * دالة تطبيق أمان مستوى الصف (Row-Level Security) بناءً على هوية المستخدم ودوره في النظام.
 * تقوم هذه الدالة بتحليل دور المستخدم وجلب معرفاته المرتبطة (الجمعية، المسوق، المستفيد)
 * ومن ثم إرجاع مرشحات Prisma (Filters) المناسبة لتقييد صلاحيات الاستعلام في جانب الخادم.
 * 
 * @param userId معرف المستخدم الحالي الفرعي من الجلسة
 * @param role اسم دور المستخدم الحالي (مثل SUPER_ADMIN, ADMIN, CHARITY_STAFF...)
 * @returns كائن يحتوي على مرشحات استعلام جاهزة للتمرير مباشرة إلى استعلامات Prisma
 */
export async function applyRowLevelSecurity(
  userId: number,
  role: string
): Promise<RlsFilters> {
  // الافتراض الأمني: رفض الوصول بشكل افتراضي (Default Deny)
  const denyAllFilters: RlsFilters = {
    association: { id: 0 }, // المعرف 0 لا يطابق أي سجل فعلي
    marketer: { id: 0 },
    beneficiary: { id: 0 },
    user: { id: 0 },
    notification: { id: 0 },
    systemEvent: { id: "0" },
  };

  if (!userId) {
    return denyAllFilters;
  }

  // جلب سجل المستخدم مع بيانات الدور المرتبط والتحقق من حالته
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || user.status !== "active") {
    return denyAllFilters;
  }

  const normalizedRole = role.toUpperCase();

  // 1. صلاحيات مدراء النظام (SUPER_ADMIN & ADMIN) - وصول كامل وغير مقيد
  if (normalizedRole === "SUPER_ADMIN" || normalizedRole === "ADMIN") {
    return {
      association: {}, // بدون قيود
      marketer: {},
      beneficiary: {},
      user: {},
      notification: {
        OR: [{ userId: userId }, { userId: null }],
      },
      systemEvent: {},
    };
  }

  // 2. صلاحيات مدير الجمعية (CHARITY_STAFF) - مقيد بالجمعية الخاصة به ومستفيديها
  if (normalizedRole === "CHARITY_STAFF") {
    const associationId = user.associationId;
    if (!associationId) {
      return denyAllFilters;
    }

    // جلب معرفات كافة المستخدمين المرتبطين بهذه الجمعية لتصفية سجلات الأحداث
    const associationUsers = await prisma.user.findMany({
      where: { associationId },
      select: { id: true },
    });
    const userIds = associationUsers.map((u) => u.id);

    return {
      association: { id: associationId },
      marketer: {}, // يمكنه استعراض المسوقين لكن لا يمكنه تعديلهم (يتم التحقق من التعديل عبر الصلاحيات)
      beneficiary: {
        users: {
          some: {
            associationId,
          },
        },
      },
      user: { associationId },
      notification: {
        OR: [{ userId: userId }, { userId: null }],
      },
      systemEvent: {
        userId: { in: userIds },
      },
    };
  }

  // 3. صلاحيات المسوق (MARKETER) - مقيد ببياناته الخاصة والمستفيدين المسجلين بواسطته
  if (normalizedRole === "MARKETER") {
    const marketerId = user.marketerId;
    if (!marketerId) {
      return denyAllFilters;
    }

    return {
      association: { id: 0 }, // لا يسمح للمسوق بالوصول للجمعيات
      marketer: { id: marketerId },
      beneficiary: {
        users: {
          some: {
            marketerId,
          },
        },
      },
      user: {
        OR: [{ id: userId }, { marketerId }],
      },
      notification: {
        OR: [{ userId: userId }, { userId: null }],
      },
      systemEvent: {
        userId,
      },
    };
  }

  // 4. صلاحيات الباحث الاجتماعي (SOCIAL_RESEARCHER) - مقيد بالمستفيدين والبحث الميداني
  if (normalizedRole === "SOCIAL_RESEARCHER") {
    return {
      association: { id: 0 },
      marketer: { id: 0 },
      beneficiary: user.associationId
        ? {
            users: {
              some: {
                associationId: user.associationId,
              },
            },
          }
        : {}, // باحث مستقل أو عالمي يرى الجميع
      user: { id: userId },
      notification: {
        OR: [{ userId: userId }, { userId: null }],
      },
      systemEvent: {
        userId,
      },
    };
  }

  // 5. صلاحيات مدير البيانات (DATA_MANAGER) - لوحة معلومات عامة وتصدير
  if (normalizedRole === "DATA_MANAGER") {
    return {
      association: {},
      marketer: {},
      beneficiary: {},
      user: {},
      notification: {
        OR: [{ userId: userId }, { userId: null }],
      },
      systemEvent: {},
    };
  }

  // 6. صلاحيات المستفيد نفسه (BENEFICIARY) - مقيد بملفه الشخصي وتنبيهاته
  if (normalizedRole === "BENEFICIARY") {
    const beneficiaryId = user.beneficiaryId;
    if (!beneficiaryId) {
      return denyAllFilters;
    }

    return {
      association: user.associationId ? { id: user.associationId } : { id: 0 },
      marketer: { id: 0 },
      beneficiary: { id: beneficiaryId },
      user: { id: userId },
      notification: {
        OR: [{ userId: userId }, { userId: null }],
      },
      systemEvent: {
        userId,
      },
    };
  }

  // في حال وجود أي دور غير معرف، يتم تطبيق الفلترة الأمنية لمنع تسريب البيانات
  return denyAllFilters;
}
