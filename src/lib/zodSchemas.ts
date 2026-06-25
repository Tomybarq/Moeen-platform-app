import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
});

export const registerSchema = z.object({
  name: z.string().min(3, { message: "الاسم الكامل يجب أن يكون 3 أحرف على الأقل" }),
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  password: z.string().min(8, { message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }),
  confirmPassword: z.string().min(1, { message: "يرجى تأكيد كلمة المرور" }),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) => !val || /^(05\d{8})$/.test(val),
      { message: "رقم الهاتف غير صحيح، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" }
    ),
  nationalId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      { message: "رقم الهوية الوطنية يجب أن يتكون من 10 أرقام" }
    ),
  role: z.enum(["SUPER_ADMIN", "CHARITY_STAFF", "MARKETER", "BENEFICIARY", "USER"]).default("USER"),
  associationId: z.coerce.number().optional().nullable(),
  marketerId: z.coerce.number().optional().nullable(),
  beneficiaryId: z.coerce.number().optional().nullable(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمة المرور وتأكيدها غير متطابقتين",
  path: ["confirmPassword"],
});

export const associationSchema = z.object({
  name: z.string().min(3, { message: "اسم الجمعية يجب أن يكون 3 أحرف على الأقل" }),
  image: z.string().optional().nullable(),
});

export const marketerSchema = z.object({
  name: z.string().min(3, { message: "اسم المسوق يجب أن يكون 3 أحرف على الأقل" }),
  image: z.string().optional().nullable(),
});

export const beneficiarySchema = z.object({
  name: z.string().min(3, { message: "اسم المستفيد يجب أن يكون 3 أحرف على الأقل" }),
  image: z.string().optional().nullable(),
  nationalId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      { message: "رقم الهوية الوطنية يجب أن يتكون من 10 أرقام" }
    ),
  phone: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val))
    .refine(
      (val) => !val || /^(05\d{8})$/.test(val),
      { message: "رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" }
    ),
});

export const socialResearchSchema = z.object({
  maritalStatus: z.string().optional().nullable(),
  familyMembersCount: z.coerce.number().min(0).default(0),
  nationalAddress: z.string().optional().nullable(),
  educationLevel: z.string().optional().nullable(),
  healthStatus: z.string().optional().nullable(),
  healthDetails: z.string().optional().nullable(),

  // Financial Framework - Income
  jobIncome: z.coerce.number().min(0).default(0),
  disabilityIncome: z.coerce.number().min(0).default(0),
  citizenAccount: z.coerce.number().min(0).default(0),
  socialInsurance: z.coerce.number().min(0).default(0),
  otherIncome: z.coerce.number().min(0).default(0),
  otherIncomeSource: z.string().optional().nullable(),

  // Financial Framework - Obligations
  houseRent: z.coerce.number().min(0).default(0),
  electricityBill: z.coerce.number().min(0).default(0),
  waterBill: z.coerce.number().min(0).default(0),
  internetBill: z.coerce.number().min(0).default(0),
  medicalExpenses: z.coerce.number().min(0).default(0),
  transportExpenses: z.coerce.number().min(0).default(0),
  foodExpenses: z.coerce.number().min(0).default(0),
  debtsMonthly: z.coerce.number().min(0).default(0),
  debtReason: z.string().optional().nullable(),

  // Field Evidence
  buildingImage: z.string().optional().nullable(),
  livingRoomImage: z.string().optional().nullable(),
  kitchenImage: z.string().optional().nullable(),
  rentContractFile: z.string().optional().nullable(),

  // Recommendation & Status
  finalRecommendation: z.string().optional().nullable(),
  statusCategory: z.enum(["HIGH", "MEDIUM", "REJECTED"]).optional().nullable(),
});

