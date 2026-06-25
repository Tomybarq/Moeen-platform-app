"use client";

import React, { useState, useEffect, useRef, DragEvent } from "react";
import { 
  User, 
  DollarSign, 
  Image as ImageIcon, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { useToast } from "@/lib/ToastContext";

interface SocialResearchWizardProps {
  beneficiaryId: number;
  initialData?: any;
  onComplete?: () => void;
  locale: string;
}

export default function SocialResearchWizard({
  beneficiaryId,
  initialData,
  onComplete,
  locale
}: SocialResearchWizardProps) {
  const { showToast } = useToast();
  const isAr = locale === "ar";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // 1. البيانات الديموغرافية والاجتماعية (Social & Demographic Data)
  const [maritalStatus, setMaritalStatus] = useState(initialData?.maritalStatus || "");
  const [familyMembersCount, setFamilyMembersCount] = useState<number>(initialData?.familyMembersCount || 0);
  const [nationalAddress, setNationalAddress] = useState(initialData?.nationalAddress || "");
  const [educationLevel, setEducationLevel] = useState(initialData?.educationLevel || "");
  const [healthStatus, setHealthStatus] = useState(initialData?.healthStatus || "");
  const [healthDetails, setHealthDetails] = useState(initialData?.healthDetails || "");

  // 2. الإطار المالي - مصادر الدخل (Financial Framework - Income)
  const [jobIncome, setJobIncome] = useState<number>(initialData?.jobIncome || 0);
  const [disabilityIncome, setDisabilityIncome] = useState<number>(initialData?.disabilityIncome || 0);
  const [citizenAccount, setCitizenAccount] = useState<number>(initialData?.citizenAccount || 0);
  const [socialInsurance, setSocialInsurance] = useState<number>(initialData?.socialInsurance || 0);
  const [otherIncome, setOtherIncome] = useState<number>(initialData?.otherIncome || 0);
  const [otherIncomeSource, setOtherIncomeSource] = useState(initialData?.otherIncomeSource || "");

  // 3. الإطار المالي - الالتزامات الشهرية (Financial Framework - Obligations)
  const [houseRent, setHouseRent] = useState<number>(initialData?.houseRent || 0);
  const [electricityBill, setElectricityBill] = useState<number>(initialData?.electricityBill || 0);
  const [waterBill, setWaterBill] = useState<number>(initialData?.waterBill || 0);
  const [internetBill, setInternetBill] = useState<number>(initialData?.internetBill || 0);
  const [medicalExpenses, setMedicalExpenses] = useState<number>(initialData?.medicalExpenses || 0);
  const [transportExpenses, setTransportExpenses] = useState<number>(initialData?.transportExpenses || 0);
  const [foodExpenses, setFoodExpenses] = useState<number>(initialData?.foodExpenses || 0);
  const [debtsMonthly, setDebtsMonthly] = useState<number>(initialData?.debtsMonthly || 0);
  const [debtReason, setDebtReason] = useState(initialData?.debtReason || "");

  // 4. شواهد البحث الميداني (Field Evidence Documents)
  const [buildingImage, setBuildingImage] = useState<string | null>(initialData?.buildingImage || null);
  const [livingRoomImage, setLivingRoomImage] = useState<string | null>(initialData?.livingRoomImage || null);
  const [kitchenImage, setKitchenImage] = useState<string | null>(initialData?.kitchenImage || null);
  const [rentContractFile, setRentContractFile] = useState<string | null>(initialData?.rentContractFile || null);

  // 5. توصية الباحث والتقييم النهائي (Recommendation & Status)
  const [finalRecommendation, setFinalRecommendation] = useState(initialData?.finalRecommendation || "");
  const [statusCategory, setStatusCategory] = useState<"HIGH" | "MEDIUM" | "REJECTED" | "">(
    initialData?.statusCategory || ""
  );

  // احتساب العمليات الحسابية المالية في الوقت الفعلي (Real-time Calculations)
  const totalIncome = jobIncome + disabilityIncome + citizenAccount + socialInsurance + otherIncome;
  const totalObligations = houseRent + electricityBill + waterBill + internetBill + medicalExpenses + transportExpenses + foodExpenses + debtsMonthly;
  const netIncome = totalIncome - totalObligations;

  const steps = [
    { title: isAr ? "البيانات الاجتماعية" : "Social Data", icon: User },
    { title: isAr ? "الوضع المالي" : "Financials", icon: DollarSign },
    { title: isAr ? "الشواهد والملفات" : "Field Evidence", icon: ImageIcon },
    { title: isAr ? "التوصية والاعتماد" : "Recommendation", icon: CheckCircle },
  ];

  // دالة تقديم الاستمارة للسريرفر وحفظها بقاعدة البيانات
  const handleSubmit = async () => {
    if (!statusCategory) {
      showToast(
        isAr ? "يرجى تحديد درجة أولوية الحالة قبل الحفظ" : "Please select priority status before saving",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        maritalStatus,
        familyMembersCount,
        nationalAddress,
        educationLevel,
        healthStatus,
        healthDetails,
        jobIncome,
        disabilityIncome,
        citizenAccount,
        socialInsurance,
        otherIncome,
        otherIncomeSource,
        houseRent,
        electricityBill,
        waterBill,
        internetBill,
        medicalExpenses,
        transportExpenses,
        foodExpenses,
        debtsMonthly,
        debtReason,
        buildingImage,
        livingRoomImage,
        kitchenImage,
        rentContractFile,
        finalRecommendation,
        statusCategory: statusCategory || null,
      };

      const response = await fetch(`/api/beneficiaries/${beneficiaryId}/research`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isAr ? "فشل حفظ الاستمارة" : "Failed to save research form"));
      }

      showToast(
        isAr ? "تم حفظ استمارة البحث الاجتماعي بنجاح" : "Social research form saved successfully",
        "success"
      );

      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error("Submit research error:", error);
      showToast(error.message || (isAr ? "فشل حفظ استمارة البحث" : "Failed to save research"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
      {/* مؤشر خطوات المعالج (Wizard Stepper) */}
      <div className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            {isAr ? "استمارة البحث الميداني الرقمية" : "Digital Social Research Form"}
          </h2>
          {/* شريط التقدم */}
          <div className="flex items-center gap-2.5">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = index === step;
              const isCompleted = index < step;
              return (
                <div key={index} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => index <= step && setStep(index)}
                    className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
                      isActive
                        ? "border-primary bg-primary text-white shadow-sm shadow-primary/20 dark:border-tertiary dark:bg-tertiary"
                        : isCompleted
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                    title={s.title}
                  >
                    <Icon size={14} />
                  </button>
                  {index < steps.length - 1 && (
                    <div 
                      className={`w-4 sm:w-8 h-0.5 mx-1 transition-colors duration-300 ${
                        isCompleted ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* محتوى خطوات المعالج (Step Forms) */}
      <div className="p-6">
        {step === 0 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2">
              {isAr ? "1. البيانات الاجتماعية والديموغرافية للمستفيد" : "1. Social & Demographic Details"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "الحالة الاجتماعية" : "Marital Status"}
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-1 focus:ring-primary dark:focus:ring-tertiary transition-all"
                >
                  <option value="">{isAr ? "-- اختر الحالة --" : "-- Select Status --"}</option>
                  <option value="SINGLE">{isAr ? "اعزب / عزباء" : "Single"}</option>
                  <option value="MARRIED">{isAr ? "متزوج / متزوجة" : "Married"}</option>
                  <option value="DIVORCED">{isAr ? "مطلق / مطلقة" : "Divorced"}</option>
                  <option value="WIDOWED">{isAr ? "أرمل / أرملة" : "Widowed"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "عدد أفراد الأسرة" : "Family Members Count"}
                </label>
                <input
                  type="number"
                  min="0"
                  value={familyMembersCount}
                  onChange={(e) => setFamilyMembersCount(parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-1 focus:ring-primary dark:focus:ring-tertiary transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "العنوان الوطني الكامل" : "National Address"}
                </label>
                <input
                  type="text"
                  value={nationalAddress}
                  onChange={(e) => setNationalAddress(e.target.value)}
                  placeholder={isAr ? "مثال: الرياض، حي الملقا، شارع الملك فهد" : "e.g. Riyadh, Malqa, King Fahd St"}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-1 focus:ring-primary dark:focus:ring-tertiary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "المستوى التعليمي" : "Education Level"}
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-1 focus:ring-primary dark:focus:ring-tertiary transition-all"
                >
                  <option value="">{isAr ? "-- اختر المستوى --" : "-- Select Level --"}</option>
                  <option value="NONE">{isAr ? "أمي" : "Illiterate"}</option>
                  <option value="PRIMARY">{isAr ? "ابتدائي" : "Primary School"}</option>
                  <option value="INTERMEDIATE">{isAr ? "متوسط" : "Intermediate School"}</option>
                  <option value="SECONDARY">{isAr ? "ثانوي" : "High School"}</option>
                  <option value="DIPLOMA">{isAr ? "دبلوم" : "Diploma"}</option>
                  <option value="BACHELOR">{isAr ? "بكالوريوس" : "Bachelor's Degree"}</option>
                  <option value="POSTGRADUATE">{isAr ? "دراسات عليا" : "Postgraduate"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "الحالة الصحية العامة" : "Health Status"}
                </label>
                <select
                  value={healthStatus}
                  onChange={(e) => setHealthStatus(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-1 focus:ring-primary dark:focus:ring-tertiary transition-all"
                >
                  <option value="">{isAr ? "-- اختر الحالة الصحية --" : "-- Select Health --"}</option>
                  <option value="EXCELLENT">{isAr ? "ممتازة (سليم)" : "Healthy / Excellent"}</option>
                  <option value="CHRONIC_DISEASE">{isAr ? "مرض مزمن" : "Chronic Disease"}</option>
                  <option value="DISABILITY">{isAr ? "إعاقة جسدية/عقلية" : "Disability"}</option>
                  <option value="OTHER">{isAr ? "أخرى" : "Other"}</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "تفاصيل الحالة الصحية والأدوية المستمرة (إن وجدت)" : "Health Details & Ongoing Medication"}
                </label>
                <textarea
                  value={healthDetails}
                  onChange={(e) => setHealthDetails(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-1 focus:ring-primary dark:focus:ring-tertiary transition-all"
                  placeholder={isAr ? "اكتب تفاصيل المرض أو الإعاقة والمستلزمات الطبية اللازمة..." : "Describe any medical condition or requirements..."}
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2">
                {isAr ? "2. الإطار المالي والالتزامات الشهرية" : "2. Financial Status & Commitments"}
              </h3>
              {/* ملخص احتساب صافي الدخل الفوري */}
              <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {isAr ? "صافي الدخل الشهري:" : "Net Monthly Income:"}
                </span>
                <span className={`text-xs font-extrabold ${netIncome >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {netIncome.toLocaleString()} {isAr ? "ريال" : "SAR"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* مصادر الدخل */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isAr ? "مصادر الدخل الشهري للأسرة (ريال)" : "Monthly Incomes (SAR)"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "الدخل الوظيفي / التقاعد" : "Job / Pension Income"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={jobIncome || ""}
                      onChange={(e) => setJobIncome(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "مخصص الإعاقة (التأهيل)" : "Disability Support"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={disabilityIncome || ""}
                      onChange={(e) => setDisabilityIncome(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "حساب المواطن" : "Citizen Account"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={citizenAccount || ""}
                      onChange={(e) => setCitizenAccount(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "الضمان الاجتماعي المطور" : "Social Insurance"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={socialInsurance || ""}
                      onChange={(e) => setSocialInsurance(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "دخل آخر" : "Other Income"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={otherIncome || ""}
                      onChange={(e) => setOtherIncome(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "مصدر الدخل الآخر" : "Other Income Source"}
                    </label>
                    <input
                      type="text"
                      value={otherIncomeSource}
                      onChange={(e) => setOtherIncomeSource(e.target.value)}
                      placeholder={isAr ? "جمعية أخرى، أقارب، أوقاف..." : "e.g. Relatives, local charity..."}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* الالتزامات الشهرية */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {isAr ? "الالتزامات والمصروفات الشهرية (ريال)" : "Monthly Commitments (SAR)"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "إيجار السكن الشهري" : "Monthly Rent"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={houseRent || ""}
                      onChange={(e) => setHouseRent(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "فاتورة الكهرباء" : "Electricity Bill"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={electricityBill || ""}
                      onChange={(e) => setElectricityBill(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "فاتورة المياه" : "Water Bill"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={waterBill || ""}
                      onChange={(e) => setWaterBill(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "فاتورة الإنترنت" : "Internet Bill"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={internetBill || ""}
                      onChange={(e) => setInternetBill(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "المصاريف الطبية والعلاجية" : "Medical Expenses"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={medicalExpenses || ""}
                      onChange={(e) => setMedicalExpenses(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "مصاريف المواصلات / البنزين" : "Transportation"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={transportExpenses || ""}
                      onChange={(e) => setTransportExpenses(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "مصاريف المعيشة والغذاء" : "Food / Living Costs"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={foodExpenses || ""}
                      onChange={(e) => setFoodExpenses(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "أقساط الديون والالتزامات" : "Monthly Debts"}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={debtsMonthly || ""}
                      onChange={(e) => setDebtsMonthly(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "سبب تراكم الديون" : "Debt Reason"}
                    </label>
                    <input
                      type="text"
                      value={debtReason}
                      onChange={(e) => setDebtReason(e.target.value)}
                      placeholder={isAr ? "قرض ترميم سكن، شراء سيارة، ظرف صحي طارئ..." : "Describe the reason of debts..."}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2">
              {isAr ? "3. شواهد البحث الميداني والمرفقات الثبوتية" : "3. Field Evidence & Media Uploads"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? "واجهة المبنى / السكن" : "Building Exterior"}
                </label>
                <ImageUploadZone
                  value={buildingImage}
                  onChange={setBuildingImage}
                  isAr={isAr}
                  accept="image/*"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? "مجلس السكن / الصالة" : "Living Room Image"}
                </label>
                <ImageUploadZone
                  value={livingRoomImage}
                  onChange={setLivingRoomImage}
                  isAr={isAr}
                  accept="image/*"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? "المطبخ" : "Kitchen Image"}
                </label>
                <ImageUploadZone
                  value={kitchenImage}
                  onChange={setKitchenImage}
                  isAr={isAr}
                  accept="image/*"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {isAr ? "عقد الإيجار (PDF / صورة)" : "Rent Contract File (PDF / Image)"}
                </label>
                <ImageUploadZone
                  value={rentContractFile}
                  onChange={setRentContractFile}
                  isAr={isAr}
                  accept="image/*,application/pdf"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2">
              {isAr ? "4. التوصية النهائية للباحث الاجتماعي" : "4. Final Recommendation & Decision"}
            </h3>

            {/* ملخص مالي في شاشة الاعتماد */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-2xl">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold">{isAr ? "إجمالي الدخل الشهري" : "Total Monthly Income"}</span>
                <span className="text-sm font-extrabold text-emerald-500">{totalIncome.toLocaleString()} {isAr ? "ريال" : "SAR"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold">{isAr ? "إجمالي الالتزامات" : "Total Commitments"}</span>
                <span className="text-sm font-extrabold text-rose-500">{totalObligations.toLocaleString()} {isAr ? "ريال" : "SAR"}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-bold">{isAr ? "صافي الدخل المتبقي" : "Net Remaining Income"}</span>
                <span className={`text-sm font-extrabold ${netIncome >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {netIncome.toLocaleString()} {isAr ? "ريال" : "SAR"}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "درجة أولوية الاحتياج والتقييم" : "Priority & Severity Category"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setStatusCategory("HIGH")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-300 ${
                      statusCategory === "HIGH"
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-black">{isAr ? "احتياج شديد (أولوية قصوى)" : "HIGH (Top Priority)"}</span>
                    <span className="text-[10px] mt-1 opacity-70">
                      {isAr ? "حالات حرجة، عجز مالي شديد" : "Critical support required"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusCategory("MEDIUM")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-300 ${
                      statusCategory === "MEDIUM"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-black">{isAr ? "احتياج متوسط" : "MEDIUM (Standard Support)"}</span>
                    <span className="text-[10px] mt-1 opacity-70">
                      {isAr ? "حالات متوسطة الصعوبة" : "Standard assistance required"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusCategory("REJECTED")}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-300 ${
                      statusCategory === "REJECTED"
                        ? "border-slate-400 bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-black">{isAr ? "استبعاد الطلب (غير مستحق)" : "REJECTED (Ineligible)"}</span>
                    <span className="text-[10px] mt-1 opacity-70">
                      {isAr ? "الدخل كافٍ، لا يستحق الدعم" : "Sufficient income, no support"}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? "التوصيات النهائية والتقرير الشامل للباحث الميداني" : "Researcher Final Recommendations"}
                </label>
                <textarea
                  value={finalRecommendation}
                  onChange={(e) => setFinalRecommendation(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-1 focus:ring-primary dark:focus:ring-tertiary transition-all"
                  placeholder={isAr ? "اكتب توصياتك بخصوص نوعية المساعدات الملائمة (عينية، مالية، ترميم سكن)..." : "Write down the final recommendations for assistance..."}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* شريط الأزرار والتنقل السفلي */}
      <div className="border-t border-slate-100 dark:border-slate-850 p-5 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center">
        <button
          type="button"
          onClick={handlePrev}
          disabled={step === 0 || loading}
          className={`flex items-center gap-1.5 h-10 px-4 rounded-xl border text-xs font-bold transition-all duration-200 ${
            step === 0 
              ? "opacity-50 cursor-not-allowed border-slate-100 text-slate-300 dark:border-slate-850" 
              : "border-slate-250 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          }`}
        >
          {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          {isAr ? "السابق" : "Previous"}
        </button>

        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 h-10 px-5 rounded-xl bg-primary hover:bg-primary/95 dark:bg-tertiary dark:hover:bg-tertiary/95 text-white text-xs font-bold transition-all duration-200"
          >
            {isAr ? "التالي" : "Next"}
            {isAr ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-1.5 h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isAr ? "جاري الحفظ..." : "Saving..."}
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                {isAr ? "اعتماد وحفظ استمارة البحث" : "Submit Research"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

interface ImageUploadZoneProps {
  value: string | null;
  onChange: (url: string | null) => void;
  isAr: boolean;
  accept?: string;
}

/**
 * مكون فرعي تفاعلي ومحمي لرفع الملفات والوثائق الفردية وصور الغرف في الخادم.
 */
function ImageUploadZone({
  value,
  onChange,
  isAr,
  accept = "image/*"
}: ImageUploadZoneProps) {
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleUpload = async (file: File) => {
    // 1. التحقق من الحجم (الحد الأقصى 5 ميجابايت)
    if (file.size > 5 * 1024 * 1024) {
      showToast(
        isAr ? "حجم الملف كبير جداً، الحد الأقصى المسموح 5 ميجابايت" : "File is too large, max size is 5MB",
        "error"
      );
      return;
    }

    // 2. التحقق من النوع
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      showToast(
        isAr ? "صيغة الملف غير مدعومة (فقط JPG, PNG, WEBP, PDF)" : "Invalid file format (only JPG, PNG, WEBP, PDF allowed)",
        "error"
      );
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // استدعاء واجهة الرفع الآمنة للمستفيدين
      const response = await fetch("/api/upload/beneficiary", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isAr ? "فشل رفع الملف" : "Failed to upload file"));
      }

      onChange(data.filePath);
      showToast(isAr ? "تم رفع الملف بنجاح" : "File uploaded successfully", "success");
    } catch (error: any) {
      console.error("Upload zone error:", error);
      showToast(error.message || (isAr ? "فشل في رفع الملف" : "File upload failed"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full">
      {value ? (
        <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          {isPdf ? (
            <div className="flex flex-col items-center justify-center p-4 text-slate-500 dark:text-slate-400 gap-1">
              <FileText size={40} className="text-red-500" />
              <span className="text-[10px] font-bold text-center truncate max-w-full">
                {isAr ? "ملف PDF مرفوع" : "Uploaded PDF Document"}
              </span>
            </div>
          ) : (
            <img
              src={value}
              alt="Upload Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {/* طبقة الخيارات عند التحويم */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-300">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
              title={isAr ? "تعديل المرفق" : "Modify File"}
            >
              <UploadCloud size={16} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="p-2 bg-rose-500/20 hover:bg-rose-500/35 text-rose-350 rounded-lg backdrop-blur-sm transition-all"
              title={isAr ? "حذف المرفق" : "Remove File"}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !loading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 p-3 cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5 dark:border-tertiary dark:bg-tertiary/5"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="text-primary dark:text-tertiary animate-spin" size={24} />
              <span className="text-[10px] font-bold text-slate-500">
                {isAr ? "جاري الرفع..." : "Uploading..."}
              </span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <UploadCloud size={16} />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-850 dark:text-white">
                  {isAr ? "انقر أو اسحب وثيقة هنا" : "Click or drag file"}
                </p>
                <p className="text-[8px] text-slate-400 mt-0.5">
                  {accept.includes("pdf") 
                    ? (isAr ? "PDF أو صور حتى 5MB" : "PDF or Images up to 5MB")
                    : (isAr ? "صور JPG, PNG حتى 5MB" : "Images up to 5MB")}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
        disabled={loading}
      />
    </div>
  );
}
