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
  // Section 1: Metadata & Core Information
  fileNumber: z.string().min(1, { message: "رقم الملف مطلوب" }),
  visitDate: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  researcherName: z.string().min(3, { message: "اسم الباحث مطلوب" }),
  applicationStatus: z.enum(["NEW", "UPDATE", "REFERRED"]),
  lastUpdateDate: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  fullName: z.string().min(3, { message: "الاسم الرباعي مطلوب" }),
  nationalId: z.string().min(10, { message: "رقم الهوية الوطنية يجب أن يتكون من 10 أرقام" }),
  birthYear: z.string().min(4, { message: "سنة الميلاد مطلوبة" }),
  maritalStatus: z.enum(["MARRIED", "WIDOW", "DIVORCED", "ABANDONED", "SINGLE"]),
  educationLevel: z.string().optional().nullable(),
  healthStatus: z.enum(["HEALTHY", "DISABLED", "SICK"]),
  healthDetails: z.string().optional().nullable(),
  phoneNumber: z.string().min(10, { message: "رقم الجوال مطلوب" }),
  alternativePhone: z.string().optional().nullable(),
  totalFamilyMembers: z.coerce.number().min(0).default(0),
  nationalAddress: z.string().min(3, { message: "العنوان الوطني مطلوب" }),
  researcherOpinionSection1: z.string().optional().nullable(),

  // Section 2: Dependents
  dependents: z.array(z.object({
    name: z.string().min(1, { message: "اسم التابع مطلوب" }),
    relationship: z.string().min(1, { message: "صلة القرابة مطلوبة" }),
    birthYear: z.string().min(4, { message: "سنة الميلاد مطلوبة" }),
    educationLevel: z.string().optional().nullable(),
    healthStatus: z.string().optional().nullable(),
    socialStatus: z.string().optional().nullable(),
    employmentStatus: z.string().optional().nullable(),
    researcherOpinionSection2: z.string().optional().nullable(),
  })).default([]),

  // Section 3: Financial Matrix
  jobIncome: z.coerce.number().min(0).default(0),
  socialSecurity: z.coerce.number().min(0).default(0),
  citizenAccount: z.coerce.number().min(0).default(0),
  disabilitySupport: z.coerce.number().min(0).default(0),
  otherCharitySupport: z.coerce.number().min(0).default(0),
  otherAssetsIncome: z.any().optional().nullable(),
  totalIncome: z.coerce.number().min(0).default(0),

  houseRent: z.coerce.number().min(0).default(0),
  electricityBill: z.coerce.number().min(0).default(0),
  waterBill: z.coerce.number().min(0).default(0),
  internetBill: z.coerce.number().min(0).default(0),
  medicalExpenses: z.coerce.number().min(0).default(0),
  transportExpenses: z.coerce.number().min(0).default(0),
  foodExpenses: z.coerce.number().min(0).default(0),
  scheduledDebts: z.coerce.number().min(0).default(0),
  debtReason: z.string().optional().nullable(),
  debtRepaymentPeriod: z.string().optional().nullable(),
  totalExpenses: z.coerce.number().min(0).default(0),
  netRemainingIncome: z.coerce.number().default(0),
  researcherOpinionSection3: z.string().optional().nullable(),

  // Section 4: Environment & Housing
  environmentType: z.enum(["HIGRAH", "BADIAH", "VILLAGE", "GOVERNORATE", "CITY"]),
  housingType: z.enum(["POPULAR", "APARTMENT", "VILLA_FLOOR", "ANNEX"]),
  housingOwnership: z.enum(["RENT", "OWNED", "INHERITED", "ENDOWMENT"]),
  researcherOpinionSection4: z.string().optional().nullable(),

  // Section 5 & 6: Needs
  financialSponsorshipAmount: z.coerce.number().min(0).default(0),
  financialSponsorshipJustification: z.string().optional().nullable(),
  foodBasketSize: z.string().optional().nullable(),
  foodBasketFrequency: z.string().optional().nullable(),
  babyMilk: z.boolean().default(false),
  sanitaryTools: z.boolean().default(false),
  unpaidElectricity: z.coerce.number().min(0).default(0),
  unpaidWater: z.coerce.number().min(0).default(0),
  rentReliefAmount: z.coerce.number().min(0).default(0),
  medicalDiseaseType: z.string().optional().nullable(),
  medicalNeedType: z.string().optional().nullable(),
  estimatedMedicalCost: z.coerce.number().min(0).default(0),
  basicNeedsJson: z.any().optional().nullable(),
  developmentalNeedsJson: z.any().optional().nullable(),
  researcherOpinionSection5: z.string().optional().nullable(),
  researcherOpinionSection6: z.string().optional().nullable(),

  // Section 7 & 8: Allocation, Media & Approvals
  proposedDonationPrograms: z.any().optional().nullable(),
  buildingOuterImage: z.string().optional().nullable(),
  livingRoomImage: z.string().optional().nullable(),
  kitchenImage: z.string().optional().nullable(),
  roofRepairImage: z.string().optional().nullable(),
  finalRecommendation: z.string().optional().nullable(),
  caseCategory: z.enum(["URGENT_PRIORITY", "MEDIUM_PRIORITY", "NOT_ELIGIBLE"]),
  approvals: z.any().optional().nullable(),
});

