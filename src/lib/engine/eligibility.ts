export interface EligibilityMetrics {
  familySize: number;
  monthlyIncome: number;
  medicalStatus: string;
  rent: number;
}

export interface EligibilityResult {
  score: number;
  status: "ELIGIBLE" | "PENDING" | "INELIGIBLE";
  notes: string;
}

/**
 * يحسب نقاط الاستحقاق لمستفيد بناءً على عدة عوامل اجتماعية ومادية.
 * @param metrics العوامل المدخلة للمستفيد
 * @returns النتيجة الإجمالية والوضع وتفاصيل التحليل باللغة العربية
 */
export function calculateLocalEligibility(metrics: EligibilityMetrics): EligibilityResult {
  const { familySize, monthlyIncome, medicalStatus, rent } = metrics;
  
  let incomeScore = 0;
  let familyScore = 0;
  let medicalScore = 0;
  let rentScore = 0;

  // 1. حساب نقاط الدخل الشهري (الوزن الأقصى: 40 نقطة)
  if (monthlyIncome <= 3000) {
    incomeScore = 40;
  } else if (monthlyIncome <= 5000) {
    incomeScore = 25;
  } else if (monthlyIncome <= 7000) {
    incomeScore = 10;
  } else {
    incomeScore = 0;
  }

  // 2. حساب نقاط حجم العائلة (الوزن الأقصى: 30 نقطة)
  if (familySize >= 7) {
    familyScore = 30;
  } else if (familySize >= 5) {
    familyScore = 20;
  } else if (familySize >= 3) {
    familyScore = 10;
  } else {
    familyScore = 0;
  }

  // 3. حساب نقاط الحالة الصحية (الوزن الأقصى: 20 نقطة)
  const normalizedMedical = medicalStatus.trim().toLowerCase();
  if (
    normalizedMedical === "disabled" ||
    normalizedMedical === "عاجز" ||
    normalizedMedical === "إعاقة" ||
    normalizedMedical.includes("disabled") ||
    normalizedMedical.includes("إعاقة")
  ) {
    medicalScore = 20;
  } else if (
    normalizedMedical === "chronic" ||
    normalizedMedical === "مزمن" ||
    normalizedMedical.includes("chronic") ||
    normalizedMedical.includes("مزمن")
  ) {
    medicalScore = 10;
  } else {
    medicalScore = 0;
  }

  // 4. حساب نقاط الإيجار الشهري (الوزن الأقصى: 10 نقاط)
  if (rent > 2000) {
    rentScore = 10;
  } else if (rent >= 1000) {
    rentScore = 5;
  } else {
    rentScore = 0;
  }

  const totalScore = incomeScore + familyScore + medicalScore + rentScore;
  
  // تحديد حالة الاستحقاق بناءً على النقاط الكلية
  let status: "ELIGIBLE" | "PENDING" | "INELIGIBLE" = "INELIGIBLE";
  let statusTextAr = "غير مستحق";
  
  if (totalScore >= 60) {
    status = "ELIGIBLE";
    statusTextAr = "مستحق";
  } else if (totalScore >= 35) {
    status = "PENDING";
    statusTextAr = "قيد الدراسة";
  }

  // توليد تقرير التحليل باللغة العربية
  const notes = `تحليل الاستحقاق التلقائي: النتيجة الإجمالية ${totalScore}/100. الحالة: ${statusTextAr}.\n` +
    `تفاصيل الاحتساب:\n` +
    `- الدخل الشهري (${monthlyIncome} ريال): ${incomeScore} نقطة.\n` +
    `- حجم العائلة (${familySize} أفراد): ${familyScore} نقطة.\n` +
    `- الحالة الصحية (${medicalStatus}): ${medicalScore} نقطة.\n` +
    `- قيمة الإيجار (${rent} ريال): ${rentScore} نقطة.`;

  return {
    score: totalScore,
    status,
    notes,
  };
}
