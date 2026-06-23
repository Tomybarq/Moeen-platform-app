/**
 * حجب الهوية الوطنية (Example: 12*******45)
 */
function maskNationalId(id: string): string {
  if (!id || id.length < 4) return id;
  return id.substring(0, 2) + "*".repeat(id.length - 4) + id.substring(id.length - 2);
}

/**
 * حجب رقم الجوال (Example: 05*****89)
 */
function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone;
  return phone.substring(0, 2) + "*".repeat(phone.length - 4) + phone.substring(phone.length - 2);
}

/**
 * دالة حماية البيانات الشخصية وفقاً للائحة نظام حماية البيانات الشخصية (PDPL)
 * @param data البيانات المراد فحصها وحجبها
 * @param roleName اسم دور المستخدم الحالي (مثال: SUPER_ADMIN, ADMIN)
 */
export function maskSensitiveData(data: unknown, roleName: string): unknown {
  if (!roleName) return data;

  const normalizedRole = roleName.toLowerCase();
  const isAuthorized =
    normalizedRole === "superadmin" ||
    normalizedRole === "admin" ||
    normalizedRole === "super_admin";

  // إذا كان المستخدم إداري أو مدير نظام، لا يتم حجب البيانات الشخصية
  if (isAuthorized) {
    return data;
  }

  // دالة الاستدعاء الذاتي لتغطية المصفوفات والكائنات المتداخلة
  const mask = (val: any): any => {
    if (val === null || val === undefined) return val;

    if (Array.isArray(val)) {
      return val.map(mask);
    }

    if (typeof val === "object") {
      const maskedObj: any = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          if (key === "nationalId" && typeof val[key] === "string") {
            maskedObj[key] = maskNationalId(val[key]);
          } else if (key === "phone" && typeof val[key] === "string") {
            maskedObj[key] = maskPhone(val[key]);
          } else {
            maskedObj[key] = mask(val[key]);
          }
        }
      }
      return maskedObj;
    }

    return val;
  };

  return mask(data);
}
