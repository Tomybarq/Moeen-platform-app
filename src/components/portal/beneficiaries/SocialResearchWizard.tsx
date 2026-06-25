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
  AlertCircle,
  Users,
  Plus,
  Home,
  HeartHandshake,
  Check,
  TrendingUp,
  FileCheck
} from "lucide-react";
import { useToast } from "@/lib/ToastContext";

interface SocialResearchWizardProps {
  beneficiaryId: number;
  onComplete?: () => void;
  onCancel?: () => void;
  locale: string;
}

export default function SocialResearchWizard({
  beneficiaryId,
  onComplete,
  onCancel,
  locale
}: SocialResearchWizardProps) {
  const { showToast } = useToast();
  const isAr = locale === "ar";

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ── Unified Form State ──────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    // Section 1: Core Metadata
    fileNumber: "",
    visitDate: new Date().toISOString().split('T')[0],
    researcherName: "",
    applicationStatus: "NEW" as "NEW" | "UPDATE" | "REFERRED",
    lastUpdateDate: "",
    fullName: "",
    nationalId: "",
    birthYear: "",
    maritalStatus: "SINGLE" as "MARRIED" | "WIDOW" | "DIVORCED" | "ABANDONED" | "SINGLE",
    educationLevel: "",
    healthStatus: "HEALTHY" as "HEALTHY" | "DISABLED" | "SICK",
    healthDetails: "",
    phoneNumber: "",
    alternativePhone: "",
    totalFamilyMembers: 0,
    nationalAddress: "",
    researcherOpinionSection1: "",

    // Section 2: Dependents
    dependents: [] as Array<{
      name: string;
      relationship: string;
      birthYear: string;
      educationLevel: string;
      healthStatus: string;
      socialStatus: string;
      employmentStatus: string;
      researcherOpinionSection2: string;
    }>,

    // Section 3: Financial Matrix
    jobIncome: 0,
    socialSecurity: 0,
    citizenAccount: 0,
    disabilitySupport: 0,
    otherCharitySupport: 0,
    otherAssetsIncome: {
      livestockCount: 0,
      farm: false,
      taxi: false,
      other: ""
    },

    houseRent: 0,
    electricityBill: 0,
    waterBill: 0,
    internetBill: 0,
    medicalExpenses: 0,
    transportExpenses: 0,
    foodExpenses: 0,
    scheduledDebts: 0,
    debtReason: "",
    debtRepaymentPeriod: "",
    researcherOpinionSection3: "",

    // Section 4: Environment & Housing
    environmentType: "CITY" as "HIGRAH" | "BADIAH" | "VILLAGE" | "GOVERNORATE" | "CITY",
    housingType: "APARTMENT" as "POPULAR" | "APARTMENT" | "VILLA_FLOOR" | "ANNEX",
    housingOwnership: "RENT" as "RENT" | "OWNED" | "INHERITED" | "ENDOWMENT",
    researcherOpinionSection4: "",

    // Section 5 & 6: Needs (Basic & Developmental)
    financialSponsorshipAmount: 0,
    financialSponsorshipJustification: "",
    foodBasketSize: "MEDIUM",
    foodBasketFrequency: "MONTHLY",
    babyMilk: false,
    sanitaryTools: false,
    unpaidElectricity: 0,
    unpaidWater: 0,
    rentReliefAmount: 0,
    medicalDiseaseType: "",
    medicalNeedType: "",
    estimatedMedicalCost: 0,
    basicNeedsJson: {
      renovation: {
        columnsAndBases: false,
        fullRenovation: false,
        waterHeatIsolation: false,
        slantingConcrete: false,
        plumbingGeneral: false,
        mixers: false,
        pipeLeaks: false,
        electricityGeneral: false,
        wiresAndMeters: false,
        plugsAndLighting: false,
        indoorPaint: false,
        outdoorPaint: false,
        furnitureSpace: false,
      },
      appliances: {
        refrigerator: 0,
        washingMachine: 0,
        ac: 0,
        oven: 0,
        waterHeater: 0,
        waterDesalination: 0
      },
      transport: {
        hasVehicle: false,
        vehicleTypeAndCondition: "",
        recommendation: ""
      }
    },
    developmentalNeedsJson: {
      techDevices: {
        computer: 0,
        laptop: 0,
        ipad: 0,
        internetPackage: 0
      },
      training: {
        trainingGoal: "SKILL",
        trainingGender: "",
        trainingAgeGroup: "",
        proposedProgramName: ""
      },
      skills: {
        craftsMastered: "",
        toolsOwned: "",
        toolsNeeded: ""
      }
    },
    researcherOpinionSection5: "",
    researcherOpinionSection6: "",

    // Section 7 & 8: Allocation, Media & Approvals
    proposedDonationPrograms: [
      { programName: "", cost: 0 },
      { programName: "", cost: 0 },
      { programName: "", cost: 0 }
    ],
    buildingOuterImage: "",
    livingRoomImage: "",
    kitchenImage: "",
    roofRepairImage: "",
    finalRecommendation: "",
    caseCategory: "MEDIUM_PRIORITY" as "URGENT_PRIORITY" | "MEDIUM_PRIORITY" | "NOT_ELIGIBLE",
    approvals: {
      researcherSigned: false,
      researcherDate: "",
      careManagerSigned: false,
      careManagerDate: "",
      finalApprovalSigned: false,
      finalApprovalDate: ""
    }
  });

  const [newDep, setNewDep] = useState({
    name: "",
    relationship: "",
    birthYear: "",
    educationLevel: "",
    healthStatus: "",
    socialStatus: "",
    employmentStatus: "",
    researcherOpinionSection2: ""
  });

  const [hasLocalDraft, setHasLocalDraft] = useState(false);

  // ── Real-time Calculations ──────────────────────────────────────────────────
  const totalIncome =
    formData.jobIncome +
    formData.socialSecurity +
    formData.citizenAccount +
    formData.disabilitySupport +
    formData.otherCharitySupport;

  const totalExpenses =
    formData.houseRent +
    formData.electricityBill +
    formData.waterBill +
    formData.internetBill +
    formData.medicalExpenses +
    formData.transportExpenses +
    formData.foodExpenses +
    formData.scheduledDebts;

  const netRemainingIncome = totalIncome - totalExpenses;

  // ── Load Data (Mount) ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchResearch = async () => {
      try {
        // أولاً: فحص وجود مسودة محلية للمستفيد في LocalStorage لاستعادتها
        const draftKey = `moeen_research_draft_${beneficiaryId}`;
        const localDraft = localStorage.getItem(draftKey);
        
        if (localDraft) {
          try {
            const parsedDraft = JSON.parse(localDraft);
            if (parsedDraft && typeof parsedDraft === "object") {
              setFormData(parsedDraft);
              setHasLocalDraft(true);
              setFetching(false);
              showToast(
                isAr 
                  ? "تم استعادة مسودة البحث الاجتماعي المحفوظة تلقائياً في جهازك" 
                  : "Restored draft automatically from local storage", 
                "info"
              );
              return; // التوقف عن الاستدعاء الخارجي في حال استعادة المسودة بنجاح
            }
          } catch (e) {
            console.error("Failed to parse local draft JSON", e);
          }
        }

        // ثانياً: في حال عدم وجود مسودة محلية، استرجاع البيانات من السيرفر
        const res = await fetch(`/api/beneficiaries/${beneficiaryId}/research`);
        if (!res.ok) throw new Error("Failed to fetch research data");
        const json = await res.json();
        
        if (json.success && json.researchData) {
          const rd = json.researchData;
          setFormData((prev) => ({
            ...prev,
            fileNumber: rd.fileNumber || "",
            visitDate: rd.visitDate ? new Date(rd.visitDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            researcherName: rd.researcherName || "",
            applicationStatus: rd.applicationStatus || "NEW",
            lastUpdateDate: rd.lastUpdateDate ? new Date(rd.lastUpdateDate).toISOString().split('T')[0] : "",
            fullName: rd.fullName || rd.name || "",
            nationalId: rd.nationalId || "",
            birthYear: rd.birthYear || "",
            maritalStatus: rd.maritalStatus || "SINGLE",
            educationLevel: rd.educationLevel || "",
            healthStatus: rd.healthStatus || "HEALTHY",
            healthDetails: rd.healthDetails || "",
            phoneNumber: rd.phoneNumber || rd.phone || "",
            alternativePhone: rd.alternativePhone || "",
            totalFamilyMembers: rd.totalFamilyMembers || 0,
            nationalAddress: rd.nationalAddress || "",
            researcherOpinionSection1: rd.researcherOpinionSection1 || "",

            dependents: rd.dependents || [],

            jobIncome: rd.jobIncome || 0,
            socialSecurity: rd.socialSecurity || 0,
            citizenAccount: rd.citizenAccount || 0,
            disabilitySupport: rd.disabilitySupport || 0,
            otherCharitySupport: rd.otherCharitySupport || 0,
            otherAssetsIncome: rd.otherAssetsIncome || prev.otherAssetsIncome,

            houseRent: rd.houseRent || 0,
            electricityBill: rd.electricityBill || 0,
            waterBill: rd.waterBill || 0,
            internetBill: rd.internetBill || 0,
            medicalExpenses: rd.medicalExpenses || 0,
            transportExpenses: rd.transportExpenses || 0,
            foodExpenses: rd.foodExpenses || 0,
            scheduledDebts: rd.scheduledDebts || 0,
            debtReason: rd.debtReason || "",
            debtRepaymentPeriod: rd.debtRepaymentPeriod || "",
            researcherOpinionSection3: rd.researcherOpinionSection3 || "",

            environmentType: rd.environmentType || "CITY",
            housingType: rd.housingType || "APARTMENT",
            housingOwnership: rd.housingOwnership || "RENT",
            researcherOpinionSection4: rd.researcherOpinionSection4 || "",

            financialSponsorshipAmount: rd.financialSponsorshipAmount || 0,
            financialSponsorshipJustification: rd.financialSponsorshipJustification || "",
            foodBasketSize: rd.foodBasketSize || "MEDIUM",
            foodBasketFrequency: rd.foodBasketFrequency || "MONTHLY",
            babyMilk: rd.babyMilk || false,
            sanitaryTools: rd.sanitaryTools || false,
            unpaidElectricity: rd.unpaidElectricity || 0,
            unpaidWater: rd.unpaidWater || 0,
            rentReliefAmount: rd.rentReliefAmount || 0,
            medicalDiseaseType: rd.medicalDiseaseType || "",
            medicalNeedType: rd.medicalNeedType || "",
            estimatedMedicalCost: rd.estimatedMedicalCost || 0,
            basicNeedsJson: rd.basicNeedsJson || prev.basicNeedsJson,
            developmentalNeedsJson: rd.developmentalNeedsJson || prev.developmentalNeedsJson,
            researcherOpinionSection5: rd.researcherOpinionSection5 || "",
            researcherOpinionSection6: rd.researcherOpinionSection6 || "",

            proposedDonationPrograms: rd.proposedDonationPrograms || prev.proposedDonationPrograms,
            buildingOuterImage: rd.buildingOuterImage || "",
            livingRoomImage: rd.livingRoomImage || "",
            kitchenImage: rd.kitchenImage || "",
            roofRepairImage: rd.roofRepairImage || "",
            finalRecommendation: rd.finalRecommendation || "",
            caseCategory: rd.caseCategory || "MEDIUM_PRIORITY",
            approvals: rd.approvals || prev.approvals
          }));
        }
      } catch (err: any) {
        console.error("Load research data error:", err);
        showToast(isAr ? "فشل تحميل بيانات الاستمارة من الخادم" : "Failed to load research data", "error");
      } finally {
        setFetching(false);
      }
    };
    fetchResearch();
  }, [beneficiaryId]);

  // ── Auto-save Draft to LocalStorage with 1000ms Debounce ──────────────────
  useEffect(() => {
    if (fetching) return;

    const timer = setTimeout(() => {
      try {
        const draftKey = `moeen_research_draft_${beneficiaryId}`;
        localStorage.setItem(draftKey, JSON.stringify(formData));
        setHasLocalDraft(true);
      } catch (e) {
        console.error("Failed to auto-save draft to localStorage", e);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, beneficiaryId, fetching]);

  // دالة لحذف مسودة الحفظ التلقائي وإعادة استيراد بيانات السيرفر الأصلية
  const handleDiscardDraft = async () => {
    if (window.confirm(isAr ? "هل أنت متأكد من رغبتك في حذف المسودة المحلية والتحميل من السيرفر؟" : "Discard local draft and reload?")) {
      try {
        setFetching(true);
        const draftKey = `moeen_research_draft_${beneficiaryId}`;
        localStorage.removeItem(draftKey);
        setHasLocalDraft(false);
        
        const res = await fetch(`/api/beneficiaries/${beneficiaryId}/research`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        if (json.success && json.researchData) {
          setFormData(json.researchData);
        }
        showToast(isAr ? "تم إهمال المسودة واستعادة بيانات السيرفر" : "Discarded draft and reloaded server data", "success");
      } catch (err) {
        showToast(isAr ? "خطأ في استعادة البيانات" : "Reload error", "error");
      } finally {
        setFetching(false);
      }
    }
  };

  // ── Helper Setters ──────────────────────────────────────────────────────────
  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateNestedField = (
    parentKey: "basicNeedsJson" | "developmentalNeedsJson" | "otherAssetsIncome" | "approvals",
    childGroup: string,
    childKey?: string,
    value?: any
  ) => {
    setFormData((prev) => {
      const parent = prev[parentKey] as any;
      if (childKey !== undefined) {
        return {
          ...prev,
          [parentKey]: {
            ...parent,
            [childGroup]: {
              ...(parent[childGroup] || {}),
              [childKey]: value
            }
          }
        };
      } else {
        return {
          ...prev,
          [parentKey]: {
            ...parent,
            [childGroup]: value
          }
        };
      }
    });
  };

  // Add dependent
  const handleAddDependent = () => {
    if (!newDep.name || !newDep.relationship || !newDep.birthYear) {
      showToast(isAr ? "يرجى تعبئة الحقول الأساسية للتابع (الاسم، صلة القرابة، سنة الميلاد)" : "Fill required dependent fields", "error");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      dependents: [...prev.dependents, newDep],
      totalFamilyMembers: prev.totalFamilyMembers + 1
    }));
    setNewDep({
      name: "",
      relationship: "",
      birthYear: "",
      educationLevel: "",
      healthStatus: "",
      socialStatus: "",
      employmentStatus: "",
      researcherOpinionSection2: ""
    });
  };

  // Remove dependent
  const handleRemoveDependent = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      dependents: prev.dependents.filter((_, i) => i !== idx),
      totalFamilyMembers: Math.max(0, prev.totalFamilyMembers - 1)
    }));
  };

  // ── Submit Wizard ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.fileNumber || !formData.researcherName || !formData.fullName || !formData.nationalId) {
      showToast(isAr ? "يرجى تعبئة الحقول الإلزامية في الخطوة الأولى (رقم الملف، اسم الباحث، الاسم، الهوية)" : "Complete required core fields", "error");
      setStep(0);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        jobIncome: Number(formData.jobIncome),
        socialSecurity: Number(formData.socialSecurity),
        citizenAccount: Number(formData.citizenAccount),
        disabilitySupport: Number(formData.disabilitySupport),
        otherCharitySupport: Number(formData.otherCharitySupport),
        houseRent: Number(formData.houseRent),
        electricityBill: Number(formData.electricityBill),
        waterBill: Number(formData.waterBill),
        internetBill: Number(formData.internetBill),
        medicalExpenses: Number(formData.medicalExpenses),
        transportExpenses: Number(formData.transportExpenses),
        foodExpenses: Number(formData.foodExpenses),
        scheduledDebts: Number(formData.scheduledDebts),
        financialSponsorshipAmount: Number(formData.financialSponsorshipAmount),
        unpaidElectricity: Number(formData.unpaidElectricity),
        unpaidWater: Number(formData.unpaidWater),
        rentReliefAmount: Number(formData.rentReliefAmount),
        estimatedMedicalCost: Number(formData.estimatedMedicalCost),
        totalIncome,
        totalExpenses,
        netRemainingIncome
      };

      const response = await fetch(`/api/beneficiaries/${beneficiaryId}/research`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (isAr ? "فشل في حفظ بيانات استمارة البحث" : "Failed to save research form"));
      }

      // إزالة مسودة الحفظ التلقائي فوراً بعد النجاح في السيرفر
      const draftKey = `moeen_research_draft_${beneficiaryId}`;
      localStorage.removeItem(draftKey);
      setHasLocalDraft(false);

      showToast(isAr ? "تم اعتماد وحفظ استمارة البحث الاجتماعي بنجاح" : "Social research form saved successfully", "success");
      if (onComplete) onComplete();
    } catch (error: any) {
      console.error("Submit research error:", error);
      showToast(error.message || (isAr ? "فشل حفظ الاستمارة" : "Failed to save"), "error");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: isAr ? "بيانات رب الأسرة" : "Core & Metadata", icon: User },
    { title: isAr ? "جدول التابعين" : "Dependents", icon: Users },
    { title: isAr ? "الوضع المالي والسكن" : "Financials & Housing", icon: DollarSign },
    { title: isAr ? "حصر الاحتياجات" : "Needs Assessment", icon: HeartHandshake },
    { title: isAr ? "الاعتماد النهائي" : "Approvals & Media", icon: FileCheck },
  ];

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3">
        <Loader2 className="animate-spin text-primary dark:text-tertiary" size={40} />
        <p className="text-xs font-bold text-slate-500">{isAr ? "جاري تحميل بيانات استمارة البحث الميداني..." : "Loading social research wizard..."}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-all duration-300">
      
      {/* ── Wizard Stepper Header ──────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/10 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-850 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary dark:bg-tertiary animate-pulse" />
              {isAr ? "دراسة حالة وبحث اجتماعي ميداني" : "Field Social Research Wizard"}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1">
              {isAr ? `المستفيد: ${formData.fullName || "..."}` : `Beneficiary: ${formData.fullName || "..."}`}
            </p>
          </div>
          
          {/* زر حذف مسودة الحفظ التلقائي للاستعادة */}
          {hasLocalDraft && (
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="text-[10px] px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold rounded-xl border border-amber-500/20 transition-all cursor-pointer"
            >
              {isAr ? "إهمال المسودة وتحميل الأصلي" : "Discard Draft & Reload"}
            </button>
          )}
        </div>
        
        {/* Step dots */}
        <div className="flex items-center gap-2">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === step;
            const isCompleted = index < step;
            return (
              <div key={index} className="flex items-center">
                <button
                  type="button"
                  onClick={() => index <= step && setStep(index)}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-300 ${
                    isActive
                      ? "border-primary bg-primary text-white shadow-lg shadow-primary/25 dark:border-tertiary dark:bg-tertiary"
                      : isCompleted
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-950"
                  }`}
                  title={s.title}
                >
                  <Icon size={16} />
                </button>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-3 sm:w-6 h-0.5 mx-1 transition-colors duration-300 ${
                      isCompleted ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Wizard Content ────────────────────────────────────────────────────── */}
      <div className="p-8">
        
        {/* ── STEP 0: Metadata & Core Information ── */}
        {step === 0 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2.5">
              {isAr ? "القسم 1: معلومات الملف الأساسية لرب الأسرة" : "Section 1: Core Metadata & Householder Info"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رقم الملف *" : "File Number *"}</label>
                <input
                  type="text"
                  value={formData.fileNumber}
                  onChange={(e) => updateField("fileNumber", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "تاريخ الزيارة/البحث *" : "Visit/Research Date *"}</label>
                <input
                  type="date"
                  value={formData.visitDate ? String(formData.visitDate).split('T')[0] : ""}
                  onChange={(e) => updateField("visitDate", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "اسم الباحث الاجتماعي *" : "Researcher Name *"}</label>
                <input
                  type="text"
                  value={formData.researcherName}
                  onChange={(e) => updateField("researcherName", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "حالة الطلب" : "Application Status"}</label>
                <select
                  value={formData.applicationStatus}
                  onChange={(e) => updateField("applicationStatus", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="NEW">{isAr ? "جديد" : "New"}</option>
                  <option value="UPDATE">{isAr ? "تحديث بيانات" : "Data Update"}</option>
                  <option value="REFERRED">{isAr ? "مرسل من جهة أخرى" : "Referred from Else"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "تاريخ آخر تحديث" : "Last Update Date"}</label>
                <input
                  type="date"
                  value={formData.lastUpdateDate ? String(formData.lastUpdateDate).split('T')[0] : ""}
                  onChange={(e) => updateField("lastUpdateDate", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "الاسم الرباعي للمستفيد *" : "Full Name *"}</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رقم الهوية الوطنية/الإقامة *" : "National ID/Iqama *"}</label>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => updateField("nationalId", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  maxLength={10}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "سنة الميلاد" : "Birth Year"}</label>
                <input
                  type="text"
                  placeholder="1410 / 1990"
                  value={formData.birthYear}
                  onChange={(e) => updateField("birthYear", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "الحالة الاجتماعية" : "Marital Status"}</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => updateField("maritalStatus", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="SINGLE">{isAr ? "أعزب" : "Single"}</option>
                  <option value="MARRIED">{isAr ? "متزوج" : "Married"}</option>
                  <option value="DIVORCED">{isAr ? "مطلق" : "Divorced"}</option>
                  <option value="WIDOW">{isAr ? "أرمل" : "Widow"}</option>
                  <option value="ABANDONED">{isAr ? "مهجور / معلق" : "Abandoned"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "المستوى التعليمي" : "Education Level"}</label>
                <input
                  type="text"
                  placeholder="ابتدائي، ثانوي، بكالوريوس"
                  value={formData.educationLevel}
                  onChange={(e) => updateField("educationLevel", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "الحالة الصحية" : "Health Status"}</label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => updateField("healthStatus", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="HEALTHY">{isAr ? "سليم" : "Healthy"}</option>
                  <option value="DISABLED">{isAr ? "من ذوي الإعاقة" : "Disabled"}</option>
                  <option value="SICK">{isAr ? "مريض" : "Sick"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "تفاصيل المرض أو الإعاقة" : "Health Details"}</label>
                <input
                  type="text"
                  placeholder={isAr ? "مرض السكري، إعاقة حركية، إلخ..." : "Diabetes, physical disability..."}
                  value={formData.healthDetails}
                  onChange={(e) => updateField("healthDetails", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رقم الجوال للتواصل" : "Phone Number"}</label>
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => updateField("phoneNumber", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رقم جوال بديل" : "Alternative Phone"}</label>
                <input
                  type="text"
                  value={formData.alternativePhone}
                  onChange={(e) => updateField("alternativePhone", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "عدد أفراد الأسرة" : "Total Family Members"}</label>
                <input
                  type="number"
                  value={formData.totalFamilyMembers}
                  onChange={(e) => updateField("totalFamilyMembers", parseInt(e.target.value) || 0)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "العنوان الوطني التفصيلي (المدينة / الحي / الشارع)" : "Detailed National Address"}</label>
                <input
                  type="text"
                  value={formData.nationalAddress}
                  onChange={(e) => updateField("nationalAddress", e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={isAr ? "المنطقة / المدينة / الحي / الشارع / الرمز البريدي" : "Riyadh, Al-Arid Dist, 12345"}
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رأي الباحث الاجتماعي حول البيانات الأساسية" : "Social Researcher Opinion on Core Data"}</label>
                <textarea
                  rows={3}
                  value={formData.researcherOpinionSection1}
                  onChange={(e) => updateField("researcherOpinionSection1", e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={isAr ? "ملاحظات حول هوية رب الأسرة، مدى التجاوب والمصداقية الأولية..." : "Notes on householder profile, responsiveness..."}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: Dependents ── */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2.5">
              {isAr ? "القسم 2: بيانات التابعين تحت الإعالة" : "Section 2: Dependents Table Relation"}
            </h3>

            {/* List Table */}
            <div className="bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 overflow-x-auto">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="p-3 text-start">#</th>
                    <th className="p-3 text-start">{isAr ? "الاسم" : "Name"}</th>
                    <th className="p-3 text-start">{isAr ? "صلة القرابة" : "Relationship"}</th>
                    <th className="p-3 text-start">{isAr ? "سنة الميلاد" : "Birth Year"}</th>
                    <th className="p-3 text-start">{isAr ? "المستوى التعليمي" : "Education"}</th>
                    <th className="p-3 text-start">{isAr ? "الحالة الصحية" : "Health"}</th>
                    <th className="p-3 text-start">{isAr ? "الحالة الاجتماعية" : "Social"}</th>
                    <th className="p-3 text-start">{isAr ? "العملية" : "Work"}</th>
                    <th className="p-3 text-end w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                  {formData.dependents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-400 font-medium">
                        {isAr ? "لا يوجد تابعين مضافين حالياً. استخدم النموذج أدناه للإضافة." : "No dependents added. Add them below."}
                      </td>
                    </tr>
                  ) : (
                    formData.dependents.map((dep, index) => (
                      <tr key={index} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20 text-slate-700 dark:text-slate-350">
                        <td className="p-3 font-semibold text-slate-400">{index + 1}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{dep.name}</td>
                        <td className="p-3">{dep.relationship}</td>
                        <td className="p-3 font-medium">{dep.birthYear}</td>
                        <td className="p-3">{dep.educationLevel || "-"}</td>
                        <td className="p-3">{dep.healthStatus || "-"}</td>
                        <td className="p-3">{dep.socialStatus || "-"}</td>
                        <td className="p-3">{dep.employmentStatus || "-"}</td>
                        <td className="p-3 text-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveDependent(index)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title={isAr ? "حذف" : "Remove"}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add form */}
            <div className="bg-slate-50/20 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Plus size={14} className="text-primary dark:text-tertiary" />
                {isAr ? "إضافة تابع جديد للإعالة" : "Add New Dependent"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "الاسم الكامل *" : "Full Name *"}</label>
                  <input
                    type="text"
                    value={newDep.name}
                    onChange={(e) => setNewDep({ ...newDep, name: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "صلة القرابة *" : "Relationship *"}</label>
                  <input
                    type="text"
                    placeholder={isAr ? "ابن، ابنة، زوجة..." : "Son, Daughter, Wife..."}
                    value={newDep.relationship}
                    onChange={(e) => setNewDep({ ...newDep, relationship: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "سنة الميلاد *" : "Birth Year *"}</label>
                  <input
                    type="text"
                    placeholder="1425"
                    value={newDep.birthYear}
                    onChange={(e) => setNewDep({ ...newDep, birthYear: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "المستوى التعليمي" : "Education Level"}</label>
                  <input
                    type="text"
                    placeholder={isAr ? "طالب ابتدائي، عاطل" : "Elementary, Secondary"}
                    value={newDep.educationLevel}
                    onChange={(e) => setNewDep({ ...newDep, educationLevel: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "الحالة الصحية" : "Health Status"}</label>
                  <input
                    type="text"
                    placeholder={isAr ? "سليم، مريض ربو..." : "Healthy, Diabetic"}
                    value={newDep.healthStatus}
                    onChange={(e) => setNewDep({ ...newDep, healthStatus: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "الحالة الاجتماعية" : "Social Status"}</label>
                  <input
                    type="text"
                    placeholder={isAr ? "يتيم، أعزب..." : "Orphan, Single"}
                    value={newDep.socialStatus}
                    onChange={(e) => setNewDep({ ...newDep, socialStatus: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "الحالة العملية" : "Employment Status"}</label>
                  <input
                    type="text"
                    placeholder={isAr ? "طالب، لا يعمل، موظف" : "Student, Unemployed"}
                    value={newDep.employmentStatus}
                    onChange={(e) => setNewDep({ ...newDep, employmentStatus: e.target.value })}
                    className="w-full h-9 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddDependent}
                    className="w-full h-9 bg-primary hover:opacity-90 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md shadow-primary/20 dark:bg-tertiary"
                  >
                    <Plus size={14} />
                    {isAr ? "إضافة للقائمة" : "Add Dependent"}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رأي الباحث حول التابعين ومدى تأثيرهم ومسؤولياتهم" : "Researcher Opinion on Dependents & Impact"}</label>
              <textarea
                rows={3}
                value={formData.dependents[0]?.researcherOpinionSection2 || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    dependents: prev.dependents.map((dep, idx) => 
                      idx === 0 ? { ...dep, researcherOpinionSection2: val } : dep
                    )
                  }));
                }}
                className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder={isAr ? "ملاحظات حول أثر الإعالة، عدد الطلاب، وجود عاطلين عن العمل في المنزل..." : "Notes on dependency burden, students count, unemployment..."}
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Financial Matrix & Housing ── */}
        {step === 2 && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Real-time Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-gradient-to-r from-primary/5 via-slate-50 to-emerald-500/5 dark:from-[#1E293B]/20 dark:via-[#0F172A] dark:to-emerald-950/10 border border-slate-200 dark:border-slate-850 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold">{isAr ? "إجمالي الدخل الشهري" : "Total Income"}</span>
                  <span className="text-xs font-black text-emerald-500">{totalIncome.toLocaleString()} {isAr ? "ريال" : "SAR"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <TrendingUp size={16} className="rotate-180" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold">{isAr ? "إجمالي الالتزامات" : "Total Expenses"}</span>
                  <span className="text-xs font-black text-rose-500">{totalExpenses.toLocaleString()} {isAr ? "ريال" : "SAR"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${netRemainingIncome >= 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"}`}>
                  <CheckCircle size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold">{isAr ? "صافي الدخل المتبقي" : "Net Remaining"}</span>
                  <span className={`text-xs font-black ${netRemainingIncome >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {netRemainingIncome.toLocaleString()} {isAr ? "ريال" : "SAR"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Financial - Incomes */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 dark:text-white border-r-3 border-emerald-500 pr-2 flex items-center gap-2">
                  {isAr ? "أ. الدخل الشهري المستقر والآخر (ريال)" : "A. Monthly Incomes (SAR)"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "الراتب الوظيفي / التقاعدي" : "Job/Pension Income"}</label>
                    <input
                      type="number"
                      value={formData.jobIncome || ""}
                      onChange={(e) => updateField("jobIncome", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "الضمان الاجتماعي المطور" : "Social Security"}</label>
                    <input
                      type="number"
                      value={formData.socialSecurity || ""}
                      onChange={(e) => updateField("socialSecurity", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "حساب المواطن" : "Citizen Account"}</label>
                    <input
                      type="number"
                      value={formData.citizenAccount || ""}
                      onChange={(e) => updateField("citizenAccount", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "التأهيل الشامل (مخصص الإعاقة)" : "Comprehensive Rehabilitation"}</label>
                    <input
                      type="number"
                      value={formData.disabilitySupport || ""}
                      onChange={(e) => updateField("disabilitySupport", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "دعم جمعيات خيرية أخرى" : "Support from Other Charities"}</label>
                    <input
                      type="number"
                      value={formData.otherCharitySupport || ""}
                      onChange={(e) => updateField("otherCharitySupport", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2 bg-slate-50/40 dark:bg-slate-955/20 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 space-y-3">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-350">{isAr ? "أصول ومصادر دخل أخرى:" : "Other Income Assets:"}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">{isAr ? "عدد المواشي" : "Livestock Count"}</label>
                        <input
                          type="number"
                          value={formData.otherAssetsIncome?.livestockCount || ""}
                          onChange={(e) => updateNestedField("otherAssetsIncome", "livestockCount", undefined, parseInt(e.target.value) || 0)}
                          className="w-full h-8 px-2 border border-slate-200 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-950 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-2">{isAr ? "امتلاك أصول" : "Assets Ownership"}</label>
                        <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 select-none">
                            <input
                              type="checkbox"
                              checked={formData.otherAssetsIncome?.farm || false}
                              onChange={(e) => updateNestedField("otherAssetsIncome", "farm", undefined, e.target.checked)}
                              className="rounded border-slate-300 text-primary focus:ring-primary/20"
                            />
                            {isAr ? "مزرعة" : "Farm"}
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 select-none">
                            <input
                              type="checkbox"
                              checked={formData.otherAssetsIncome?.taxi || false}
                              onChange={(e) => updateNestedField("otherAssetsIncome", "taxi", undefined, e.target.checked)}
                              className="rounded border-slate-300 text-primary focus:ring-primary/20"
                            />
                            {isAr ? "سيارة أجرة (تاكسي)" : "Taxi Driver"}
                          </label>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">{isAr ? "أي مصادر دخل أخرى مع تفاصيلها" : "Other sources details"}</label>
                        <input
                          type="text"
                          value={formData.otherAssetsIncome?.other || ""}
                          onChange={(e) => updateNestedField("otherAssetsIncome", "other", undefined, e.target.value)}
                          placeholder={isAr ? "سيارة خاصة للإيجار، عمل حر، أقارب..." : "Relief, freelance work..."}
                          className="w-full h-8 px-2.5 border border-slate-200 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-950 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial - Expenses & Obligations */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-800 dark:text-white border-r-3 border-rose-500 pr-2 flex items-center gap-2">
                  {isAr ? "ب. الالتزامات والمصروفات الشهرية (ريال)" : "B. Monthly Expenses & Liabilities (SAR)"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "إيجار السكن" : "House Rent"}</label>
                    <input
                      type="number"
                      value={formData.houseRent || ""}
                      onChange={(e) => updateField("houseRent", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "فاتورة الكهرباء" : "Electricity Bill"}</label>
                    <input
                      type="number"
                      value={formData.electricityBill || ""}
                      onChange={(e) => updateField("electricityBill", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "فاتورة المياه" : "Water Bill"}</label>
                    <input
                      type="number"
                      value={formData.waterBill || ""}
                      onChange={(e) => updateField("waterBill", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "فاتورة الإنترنت" : "Internet Bill"}</label>
                    <input
                      type="number"
                      value={formData.internetBill || ""}
                      onChange={(e) => updateField("internetBill", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "المصاريف الطبية والعلاجات" : "Medical Expenses"}</label>
                    <input
                      type="number"
                      value={formData.medicalExpenses || ""}
                      onChange={(e) => updateField("medicalExpenses", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "المواصلات والنقل العام والبنزين" : "Transportation"}</label>
                    <input
                      type="number"
                      value={formData.transportExpenses || ""}
                      onChange={(e) => updateField("transportExpenses", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "مصاريف الغذاء والعيش" : "Food / Living Expenses"}</label>
                    <input
                      type="number"
                      value={formData.foodExpenses || ""}
                      onChange={(e) => updateField("foodExpenses", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "ديون مجدولة (القسط الشهري)" : "Scheduled Monthly Debts"}</label>
                    <input
                      type="number"
                      value={formData.scheduledDebts || ""}
                      onChange={(e) => updateField("scheduledDebts", parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "سبب تراكم الدين" : "Debt Reason"}</label>
                    <input
                      type="text"
                      value={formData.debtReason}
                      onChange={(e) => updateField("debtReason", e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                      placeholder={isAr ? "زواج، ترميم مسكن، سيارة..." : "Marriage, house renovation..."}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "فترة سداد الدين المتبقية" : "Debt Repayment Period"}</label>
                    <input
                      type="text"
                      value={formData.debtRepaymentPeriod}
                      onChange={(e) => updateField("debtRepaymentPeriod", e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs"
                      placeholder={isAr ? "سنتين، 15 شهر، إلخ..." : "e.g. 2 years, 15 months"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رأي الباحث في الوضع المالي ومصداقية الديون" : "Researcher Opinion on Financials & Debts"}</label>
              <textarea
                rows={3}
                value={formData.researcherOpinionSection3}
                onChange={(e) => updateField("researcherOpinionSection3", e.target.value)}
                className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder={isAr ? "ملاحظات حول مستوى الاستحقاق، تطابق الدخل مع المظهر العام للأسرة، مستندات الدين..." : "Notes on authenticity of debts, general welfare matching income..."}
              />
            </div>

            {/* Section 4: Environment & Housing */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-5">
              <h4 className="text-xs font-black text-slate-800 dark:text-white border-r-3 border-primary dark:border-tertiary pr-2.5">
                {isAr ? "القسم 4: تفاصيل البيئة الجغرافية وملاءمة السكن" : "Section 4: Environment & Housing Details"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "نوع البيئة" : "Environment Type"}</label>
                  <select
                    value={formData.environmentType}
                    onChange={(e) => updateField("environmentType", e.target.value)}
                    className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="HIGRAH">{isAr ? "هجرة" : "Higrah (Rural Settlement)"}</option>
                    <option value="BADIAH">{isAr ? "بادية" : "Badiah (Desert)"}</option>
                    <option value="VILLAGE">{isAr ? "قرية" : "Village"}</option>
                    <option value="GOVERNORATE">{isAr ? "محافظة" : "Governorate"}</option>
                    <option value="CITY">{isAr ? "مدينة" : "City"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "نوع السكن" : "Housing Type"}</label>
                  <select
                    value={formData.housingType}
                    onChange={(e) => updateField("housingType", e.target.value)}
                    className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="POPULAR">{isAr ? "شعبي" : "Popular House"}</option>
                    <option value="APARTMENT">{isAr ? "شقة" : "Apartment"}</option>
                    <option value="VILLA_FLOOR">{isAr ? "فيلا / دور" : "Villa / Floor"}</option>
                    <option value="ANNEX">{isAr ? "ملحق" : "Annex"}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "حيازة السكن" : "Housing Ownership"}</label>
                  <select
                    value={formData.housingOwnership}
                    onChange={(e) => updateField("housingOwnership", e.target.value)}
                    className="w-full h-10 px-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="RENT">{isAr ? "إيجار" : "Rent"}</option>
                    <option value="OWNED">{isAr ? "ملك" : "Owned"}</option>
                    <option value="INHERITED">{isAr ? "ورثة" : "Inherited"}</option>
                    <option value="ENDOWMENT">{isAr ? "وقف خيري" : "Endowment (Waqf)"}</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رأي الباحث في البيئة والملاءمة السكنية وصلاحية البيت للمعيشة" : "Researcher Opinion on Housing Condition"}</label>
                  <textarea
                    rows={3}
                    value={formData.researcherOpinionSection4}
                    onChange={(e) => updateField("researcherOpinionSection4", e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder={isAr ? "ملاحظات حول صلاحية جدران المبنى، التهوية، تواجد مياه وكهرباء صالحة، حاجة المنزل لأعمال الصيانة..." : "Notes on wall structures, ventilation, utility connections, restoration requirements..."}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Needs Assessment ── */}
        {step === 3 && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Section 5: Basic Needs */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2.5">
                {isAr ? "القسم 5: الاحتياجات المادية والأساسية الضرورية للأسرة" : "Section 5: Basic Material Needs of the Family"}
              </h3>

              {/* A. Housing Renovation Checkboxes */}
              <div className="bg-slate-50/30 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 space-y-4">
                <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "أ. احتياجات أعمال الترميم والإصلاح الهيكلي للمنزل:" : "A. Restoration & Structural Repair Checklist:"}</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: "columnsAndBases", labelAr: "تدعيم الأعمدة والقواعد", labelEn: "Columns & Bases Reinforcement" },
                    { key: "fullRenovation", labelAr: "ترميم كامل للمنزل", labelEn: "Full House Restoration" },
                    { key: "waterHeatIsolation", labelAr: "عزل مائي/حراري للأسقف", labelEn: "Water & Heat Insulation" },
                    { key: "slantingConcrete", labelAr: "صبة ميلان السطح لمنع التسريب", labelEn: "Slanting Concrete for Roof" },
                    { key: "plumbingGeneral", labelAr: "صيانة السباكة العامة", labelEn: "General Plumbing Maintenance" },
                    { key: "mixers", labelAr: "تغيير خلاطات وصنابير المياه", labelEn: "Water Mixers Replacement" },
                    { key: "pipeLeaks", labelAr: "علاج تسريبات مواسير الجدران", labelEn: "Pipe Leakage Fixing" },
                    { key: "electricityGeneral", labelAr: "صيانة الكهرباء العامة", labelEn: "General Electricity Fixing" },
                    { key: "wiresAndMeters", labelAr: "تركيب أسلاك وعدادات معتمدة", labelEn: "Approved Wires & Meters" },
                    { key: "plugsAndLighting", labelAr: "تأمين الأفياش والإضاءات التالفة", labelEn: "Plugs & Lightings Repair" },
                    { key: "indoorPaint", labelAr: "دهانات داخلية للجدران", labelEn: "Indoor Paints" },
                    { key: "outdoorPaint", labelAr: "دهانات خارجية للمبنى", labelEn: "Outdoor Paints" },
                    { key: "furnitureSpace", labelAr: "توفير الأثاث والفرش وغرف النوم والدواليب", labelEn: "Furniture, Bedrooms & Carpets" }
                  ].map((chk) => (
                    <label key={chk.key} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-355 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(formData.basicNeedsJson?.renovation as any)?.[chk.key] || false}
                        onChange={(e) => updateNestedField("basicNeedsJson", "renovation", chk.key, e.target.checked)}
                        className="rounded border-slate-300 text-primary focus:ring-primary/20 mt-0.5"
                      />
                      <span>{isAr ? chk.labelAr : chk.labelEn}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* B. Financial Sponsorship & Food */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/20 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-850 rounded-2xl p-5">
                <div className="space-y-4">
                  <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "ب. كفالة الأسرة الشهرية المقترحة:" : "B. Proposed Monthly Family Sponsorship:"}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "مبلغ الكفالة المقترح (ريال)" : "Proposed Amount (SAR)"}</label>
                      <input
                        type="number"
                        value={formData.financialSponsorshipAmount || ""}
                        onChange={(e) => updateField("financialSponsorshipAmount", parseFloat(e.target.value) || 0)}
                        className="w-full h-10 px-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-955 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "مبررات ودواعي الكفالة" : "Sponsorship Justification"}</label>
                      <input
                        type="text"
                        value={formData.financialSponsorshipJustification || ""}
                        onChange={(e) => updateField("financialSponsorshipJustification", e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-xs"
                        placeholder={isAr ? "وجود أيتام، غياب المعيل الكامل..." : "Orphans presence, no income source..."}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "ج. السلال الغذائية ودعم الأطفال:" : "C. Food Basket & Children Support:"}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "حجم السلة المقترحة" : "Food Basket Size"}</label>
                      <select
                        value={formData.foodBasketSize || "MEDIUM"}
                        onChange={(e) => updateField("foodBasketSize", e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-xs"
                      >
                        <option value="SMALL">{isAr ? "صغيرة" : "Small Size"}</option>
                        <option value="MEDIUM">{isAr ? "متوسطة" : "Medium Size"}</option>
                        <option value="LARGE">{isAr ? "كبيرة" : "Large Size"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "وتيرة ودورة التوزيع" : "Distribution Frequency"}</label>
                      <select
                        value={formData.foodBasketFrequency || "MONTHLY"}
                        onChange={(e) => updateField("foodBasketFrequency", e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-xs"
                      >
                        <option value="MONTHLY">{isAr ? "شهري مستمر" : "Monthly"}</option>
                        <option value="ONE_TIME">{isAr ? "مرة واحدة طارئ" : "One-time Urgent"}</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 flex gap-6 mt-1">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.babyMilk}
                          onChange={(e) => updateField("babyMilk", e.target.checked)}
                          className="rounded border-slate-300 text-primary"
                        />
                        {isAr ? "تأمين حليب أطفال وحفائض للرضع" : "Baby Milk & Diapers Required"}
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-355 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.sanitaryTools}
                          onChange={(e) => updateField("sanitaryTools", e.target.checked)}
                          className="rounded border-slate-300 text-primary"
                        />
                        {isAr ? "أدوات ومستلزمات نظافة وتعقيم" : "Sanitary/Cleaning tools"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* C. Outstanding Bills & Rent Relief */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50/30 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-855 rounded-2xl p-5">
                <div>
                  <label className="block text-xs font-bold text-slate-750 dark:text-slate-300 mb-1">{isAr ? "تسديد فواتير الكهرباء المتراكمة" : "Unpaid Electricity Bill (SAR)"}</label>
                  <input
                    type="number"
                    value={formData.unpaidElectricity || ""}
                    onChange={(e) => updateField("unpaidElectricity", parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 border border-slate-250 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-755 dark:text-slate-300 mb-1">{isAr ? "تسديد فواتير المياه المتراكمة" : "Unpaid Water Bill (SAR)"}</label>
                  <input
                    type="number"
                    value={formData.unpaidWater || ""}
                    onChange={(e) => updateField("unpaidWater", parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 border border-slate-255 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-755 dark:text-slate-300 mb-1">{isAr ? "تفريج كربة الإيجار (المبلغ المطلوب)" : "Rent Relief Required (SAR)"}</label>
                  <input
                    type="number"
                    value={formData.rentReliefAmount || ""}
                    onChange={(e) => updateField("rentReliefAmount", parseFloat(e.target.value) || 0)}
                    className="w-full h-10 px-3 border border-slate-255 dark:border-slate-855 rounded-xl bg-white dark:bg-slate-955 text-xs"
                  />
                </div>
              </div>

              {/* D. Electrical Appliances counts */}
              <div className="bg-slate-50/20 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-855 rounded-2xl p-5 space-y-4">
                <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "د. الأجهزة الكهربائية المنزلية التالفة/المطلوبة (أدخل الأعداد):" : "D. Household Appliances Required (Enter count):"}</span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                  {[
                    { key: "refrigerator", label: "ثلاجة" },
                    { key: "washingMachine", label: "غسالة" },
                    { key: "ac", label: "مكيفات" },
                    { key: "oven", label: "فرن طهي" },
                    { key: "waterHeater", label: "سخان مياه" },
                    { key: "waterDesalination", label: "جهاز تحلية" }
                  ].map((app) => (
                    <div key={app.key}>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">{app.label}</label>
                      <input
                        type="number"
                        min="0"
                        value={(formData.basicNeedsJson?.appliances as any)?.[app.key] || ""}
                        onChange={(e) => updateNestedField("basicNeedsJson", "appliances", app.key, parseInt(e.target.value) || 0)}
                        className="w-full h-8 px-2 border border-slate-200 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-center text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* E. Transport & Medical support */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/30 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-855 rounded-2xl p-5">
                <div className="space-y-3">
                  <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "هـ. وسيلة النقل الحالية والتوصية:" : "E. Transportation Status & Recommendation:"}</span>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.basicNeedsJson?.transport?.hasVehicle || false}
                      onChange={(e) => updateNestedField("basicNeedsJson", "transport", "hasVehicle", e.target.checked)}
                      className="rounded border-slate-350 text-primary"
                    />
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">{isAr ? "تمتلك الأسرة وسيلة نقل حالياً" : "Family owns a vehicle"}</label>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "نوع المركبة وحالتها الفنية" : "Vehicle Type & Condition"}</label>
                    <input
                      type="text"
                      value={formData.basicNeedsJson?.transport?.vehicleTypeAndCondition || ""}
                      onChange={(e) => updateNestedField("basicNeedsJson", "transport", "vehicleTypeAndCondition", e.target.value)}
                      placeholder={isAr ? "سيارة قديمة، غير صالحة للاستعمال..." : "e.g. Old sedan, broken..."}
                      className="w-full h-9 px-3 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "التوصية المقترحة للمركبة" : "Transportation Recommendation"}</label>
                    <select
                      value={formData.basicNeedsJson?.transport?.recommendation || ""}
                      onChange={(e) => updateNestedField("basicNeedsJson", "transport", "recommendation", e.target.value)}
                      className="w-full h-9 px-3 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                    >
                      <option value="">{isAr ? "-- لا توجد توصية --" : "-- No Recommendation --"}</option>
                      <option value="سيارة صغيرة">{isAr ? "سيارة صغيرة للعمل أو المشاوير" : "Small car"}</option>
                      <option value="سيارة عائلية">{isAr ? "سيارة عائلية كبيرة" : "Family Van"}</option>
                      <option value="نقل مدرسي">{isAr ? "تأمين وسيلة نقل مدرسي للأبناء" : "School bus subscription"}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "و. الدعم والاحتياج الطبي للأفراد:" : "F. Medical Support & Special Needs:"}</span>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "نوع المرض أو الإعاقة للشخص المحتاج" : "Disease/Disability Type"}</label>
                    <input
                      type="text"
                      value={formData.medicalDiseaseType || ""}
                      onChange={(e) => updateField("medicalDiseaseType", e.target.value)}
                      placeholder={isAr ? "فشل كلوي، مستلزمات إعاقة..." : "Kidney failure, physical therapy..."}
                      className="w-full h-9 px-3 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "نوع الاحتياج الطبي المطلوب" : "Medical Need Type"}</label>
                    <select
                      value={formData.medicalNeedType || ""}
                      onChange={(e) => updateField("medicalNeedType", e.target.value)}
                      className="w-full h-9 px-3 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                    >
                      <option value="">{isAr ? "-- اختر نوع الدعم --" : "-- Select Medical Support --"}</option>
                      <option value="MEDICINE">{isAr ? "دواء شهري مستمر" : "Monthly Medicine"}</option>
                      <option value="DEVICES">{isAr ? "تأمين أجهزة طبية (سرير، كرسي متحرك)" : "Medical Devices"}</option>
                      <option value="SURGERY">{isAr ? "عملية جراحية مستعجلة" : "Urgent Surgery"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "التكلفة المالية التقديرية (ريال)" : "Estimated Medical Cost (SAR)"}</label>
                    <input
                      type="number"
                      value={formData.estimatedMedicalCost || ""}
                      onChange={(e) => updateField("estimatedMedicalCost", parseFloat(e.target.value) || 0)}
                      className="w-full h-9 px-3 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رأي الباحث حول أولويات الاحتياجات الأساسية للأسرة" : "Researcher Opinion on Priorities of Basic Needs"}</label>
                <textarea
                  rows={2}
                  value={formData.researcherOpinionSection5}
                  onChange={(e) => updateField("researcherOpinionSection5", e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={isAr ? "كتابة أولويات الصرف ومساعدة الأسرة (الكهرباء أولاً ثم الإيجار ثم السلة)..." : "Write down priority of support..."}
                />
              </div>
            </div>

            {/* Section 6: Developmental Needs */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
              <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2.5">
                {isAr ? "القسم 6: الاحتياجات التنموية والتأهيل والتمكين المهني" : "Section 6: Developmental & Empowerment Needs"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/20 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-850 rounded-2xl p-5">
                
                {/* Tech Devices for Students */}
                <div className="space-y-4">
                  <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "أ. احتياجات الأجهزة التقنية للطلاب والدارسين:" : "A. Technology Devices for Students (Count):"}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: "computer", label: "حاسب آلي" },
                      { key: "laptop", label: "كمبيوتر محمول" },
                      { key: "ipad", label: "آيباد/تابلت" },
                      { key: "internetPackage", label: "باقة إنترنت" }
                    ].map((tech) => (
                      <div key={tech.key}>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">{tech.label}</label>
                        <input
                          type="number"
                          value={(formData.developmentalNeedsJson?.techDevices as any)?.[tech.key] || ""}
                          onChange={(e) => updateNestedField("developmentalNeedsJson", "techDevices", tech.key, parseInt(e.target.value) || 0)}
                          className="w-full h-8 px-2 border border-slate-200 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-center text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Training programs */}
                <div className="space-y-3">
                  <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "ب. البرامج والدورات التدريبية المقترحة:" : "B. Proposed Training Programs:"}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-1">{isAr ? "هدف التدريب" : "Training Goal"}</label>
                      <select
                        value={formData.developmentalNeedsJson?.training?.trainingGoal || "SKILL"}
                        onChange={(e) => updateNestedField("developmentalNeedsJson", "training", "trainingGoal", e.target.value)}
                        className="w-full h-9 px-2 border border-slate-250 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-955 text-xs"
                      >
                        <option value="LABOR_MARKET">{isAr ? "تأهيل لسوق العمل" : "Labor Market Job prep"}</option>
                        <option value="SKILL">{isAr ? "تطوير مهارة وهواية" : "Skill & Hobby"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 mb-1">{isAr ? "جنس المتدربين" : "Target Gender"}</label>
                      <input
                        type="text"
                        value={formData.developmentalNeedsJson?.training?.trainingGender || ""}
                        onChange={(e) => updateNestedField("developmentalNeedsJson", "training", "trainingGender", e.target.value)}
                        placeholder={isAr ? "ذكور، إناث، كلاهما" : "Males, Females"}
                        className="w-full h-9 px-2 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-955 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-slate-500 mb-1">{isAr ? "الفئة العمرية المستهدفة وعنوان البرنامج المقترح" : "Target Age & Proposed Course Title"}</label>
                      <input
                        type="text"
                        value={formData.developmentalNeedsJson?.training?.proposedProgramName || ""}
                        onChange={(e) => updateNestedField("developmentalNeedsJson", "training", "proposedProgramName", e.target.value)}
                        placeholder={isAr ? "أبناء 15-20 سنة، دورة صيانة جوالات..." : "e.g. 15-20 years, Mobile Maintenance Course..."}
                        className="w-full h-9 px-2.5 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Family crafts & skills */}
              <div className="bg-slate-50/30 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-855 rounded-2xl p-5 space-y-4">
                <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "ج. مهارات الأسرة والمشاريع المتناهية الصغر:" : "C. Family Skills, Crafts & Micro-projects:"}</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "الحرف اليدوية التي يتقنها أفراد الأسرة" : "Crafts Mastered"}</label>
                    <input
                      type="text"
                      value={formData.developmentalNeedsJson?.skills?.craftsMastered || ""}
                      onChange={(e) => updateNestedField("developmentalNeedsJson", "skills", "craftsMastered", e.target.value)}
                      placeholder={isAr ? "خياطة وتطريز، طبخ، صناعة عطور..." : "Tailoring, Cooking, Perfume..."}
                      className="w-full h-9 px-3 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "الأدوات والمعدات المتوفرة لديهم" : "Tools Owned"}</label>
                    <input
                      type="text"
                      value={formData.developmentalNeedsJson?.skills?.toolsOwned || ""}
                      onChange={(e) => updateNestedField("developmentalNeedsJson", "skills", "toolsOwned", e.target.value)}
                      placeholder={isAr ? "ماكينة خياطة قديمة، أواني طبخ..." : "Sewing machine..."}
                      className="w-full h-9 px-3 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">{isAr ? "المعدات المطلوبة لإطلاق المشروع المنزلي" : "Tools Needed"}</label>
                    <input
                      type="text"
                      value={formData.developmentalNeedsJson?.skills?.toolsNeeded || ""}
                      onChange={(e) => updateNestedField("developmentalNeedsJson", "skills", "toolsNeeded", e.target.value)}
                      placeholder={isAr ? "ماكينة خياطة حديثة متطورة، فرن خبيز..." : "Electric oven, sewing machine..."}
                      className="w-full h-9 px-3 border border-slate-250 dark:border-slate-855 rounded-lg bg-white dark:bg-slate-955 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "رأي الباحث في إمكانيات تمكين وتدريب وتطوير مهارات الأسرة" : "Researcher Opinion on Empowerment & Crafts"}</label>
                <textarea
                  rows={2}
                  value={formData.researcherOpinionSection6}
                  onChange={(e) => updateField("researcherOpinionSection6", e.target.value)}
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-955 text-slate-855 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder={isAr ? "ملاحظات حول جدية الأسرة في العمل، فرصة نجاح المشروع، مدى التجاوب للتدريب..." : "Notes on motivation, project success chance..."}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 4: Media, Programs & Approvals ── */}
        {step === 4 && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Section 7: Proposed Programs & Media */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2.5">
                {isAr ? "القسم 7: البرامج المقترحة وشواهد البحث الميداني" : "Section 7: Proposed Donation Programs & Media Evidence"}
              </h3>

              {/* Proposed Programs Table */}
              <div className="bg-slate-50/20 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-850 rounded-2xl p-5 space-y-4">
                <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "أ. البرامج المقترحة للأسرة وتكلفة كل برنامج (أقصى حد 3 برامج):" : "A. Proposed Programs & Estimated Cost (Max 3):"}</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-855 rounded-xl space-y-2">
                      <span className="block text-[10px] font-black text-slate-400">{isAr ? `برنامج التبرع المقترح ${idx + 1}` : `Proposed Program ${idx + 1}`}</span>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">{isAr ? "اسم البرنامج" : "Program Name"}</label>
                        <input
                          type="text"
                          value={formData.proposedDonationPrograms?.[idx]?.programName || ""}
                          onChange={(e) => {
                            const newPrograms = [...(formData.proposedDonationPrograms || [])];
                            newPrograms[idx] = { ...newPrograms[idx], programName: e.target.value };
                            updateField("proposedDonationPrograms", newPrograms);
                          }}
                          placeholder={isAr ? "ترميم سكن، سداد فواتير، سلة..." : "Restoration, electricity..."}
                          className="w-full h-8 px-2.5 border border-slate-200 dark:border-slate-850 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">{isAr ? "التكلفة التقديرية (ريال)" : "Estimated Cost (SAR)"}</label>
                        <input
                          type="number"
                          value={formData.proposedDonationPrograms?.[idx]?.cost || ""}
                          onChange={(e) => {
                            const newPrograms = [...(formData.proposedDonationPrograms || [])];
                            newPrograms[idx] = { ...newPrograms[idx], cost: parseFloat(e.target.value) || 0 };
                            updateField("proposedDonationPrograms", newPrograms);
                          }}
                          className="w-full h-8 px-2.5 border border-slate-200 dark:border-slate-855 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uploads Zones (4 zones) */}
              <div className="space-y-4">
                <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "ب. شواهد البحث الميداني الفوتوغرافية للمنزل:" : "B. Photographic Evidence Documents:"}</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2">{isAr ? "صورة خارجية للمبنى" : "Building Exterior Preview"}</label>
                    <ImageUploadZone
                      value={formData.buildingOuterImage}
                      onChange={(url) => updateField("buildingOuterImage", url)}
                      isAr={isAr}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2">{isAr ? "صورة المجلس / الصالة" : "Living Room Preview"}</label>
                    <ImageUploadZone
                      value={formData.livingRoomImage}
                      onChange={(url) => updateField("livingRoomImage", url)}
                      isAr={isAr}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2">{isAr ? "صورة المطبخ" : "Kitchen Preview"}</label>
                    <ImageUploadZone
                      value={formData.kitchenImage}
                      onChange={(url) => updateField("kitchenImage", url)}
                      isAr={isAr}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-2">{isAr ? "صور الأسقف وأماكن الترميم" : "Roof/Restoration Details"}</label>
                    <ImageUploadZone
                      value={formData.roofRepairImage}
                      onChange={(url) => updateField("roofRepairImage", url)}
                      isAr={isAr}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 8: Final Recommendation & Approvals */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-6">
              <h3 className="text-sm font-bold text-primary dark:text-tertiary border-r-4 border-primary dark:border-tertiary pr-2.5">
                {isAr ? "القسم 8: التوصية النهائية وقرار لجنة الرعاية والبحث" : "Section 8: Recommendation & Approvals"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-355 mb-1.5">{isAr ? "التوصية النهائية للباحث الاجتماعي بشكل شامل" : "Researcher Final Comprehensive Recommendation"}</label>
                  <textarea
                    rows={4}
                    value={formData.finalRecommendation}
                    onChange={(e) => updateField("finalRecommendation", e.target.value)}
                    className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 text-slate-850 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder={isAr ? "التوصية بإعانات فورية، إدراج الأسرة ببرامج الترميم، تفصيل الأولوية..." : "Recommended support, priority level justification..."}
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-750 dark:text-slate-300 mb-2">{isAr ? "تصنيف وتقييم الحالة المعتمد *" : "Approved Case Category *"}</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { value: "URGENT_PRIORITY", labelAr: "أولوية قصوى (حالة حرجة)", color: "border-rose-500 text-rose-600 bg-rose-500/5" },
                      { value: "MEDIUM_PRIORITY", labelAr: "أولوية متوسطة", color: "border-amber-500 text-amber-600 bg-amber-500/5" },
                      { value: "NOT_ELIGIBLE", labelAr: "غير مستحقة (استبعاد)", color: "border-slate-300 text-slate-500 bg-slate-50" }
                    ].map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => updateField("caseCategory", cat.value)}
                        className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all duration-300 ${
                          formData.caseCategory === cat.value
                            ? `${cat.color} font-black ring-2 ring-offset-2 ring-primary/20`
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 text-slate-400 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs">{cat.labelAr}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Signatures JSON */}
                <div className="md:col-span-3 bg-slate-50/30 dark:bg-slate-955/20 border border-slate-200 dark:border-slate-855 rounded-2xl p-5 space-y-4">
                  <span className="block text-xs font-black text-slate-850 dark:text-white">{isAr ? "تواقيع ومصادقات الاعتماد المالي والإداري:" : "Approvals & Signatures Track:"}</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Researcher signature */}
                    <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-855 rounded-xl space-y-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.approvals?.researcherSigned || false}
                          onChange={(e) => updateNestedField("approvals", "researcherSigned", undefined, e.target.checked)}
                          className="rounded border-slate-350 text-primary"
                        />
                        {isAr ? "توقيع ومصادقة الباحث" : "Researcher Approval Signature"}
                      </label>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">{isAr ? "تاريخ التوقيع" : "Signature Date"}</label>
                        <input
                          type="date"
                          value={formData.approvals?.researcherDate ? String(formData.approvals.researcherDate).split('T')[0] : ""}
                          onChange={(e) => updateNestedField("approvals", "researcherDate", undefined, e.target.value)}
                          className="w-full h-8 px-2 border border-slate-200 dark:border-slate-855 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Care manager signature */}
                    <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-855 rounded-xl space-y-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.approvals?.careManagerSigned || false}
                          onChange={(e) => updateNestedField("approvals", "careManagerSigned", undefined, e.target.checked)}
                          className="rounded border-slate-350 text-primary"
                        />
                        {isAr ? "توقيع مدير الرعاية الاجتماعية" : "Care Manager Approval"}
                      </label>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">{isAr ? "تاريخ التوقيع" : "Signature Date"}</label>
                        <input
                          type="date"
                          value={formData.approvals?.careManagerDate ? String(formData.approvals.careManagerDate).split('T')[0] : ""}
                          onChange={(e) => updateNestedField("approvals", "careManagerDate", undefined, e.target.value)}
                          className="w-full h-8 px-2 border border-slate-200 dark:border-slate-855 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Final Board approval signature */}
                    <div className="bg-white dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-855 rounded-xl space-y-3">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.approvals?.finalApprovalSigned || false}
                          onChange={(e) => updateNestedField("approvals", "finalApprovalSigned", undefined, e.target.checked)}
                          className="rounded border-slate-355 text-primary"
                        />
                        {isAr ? "الاعتماد النهائي للجمعية" : "Board Final Approval"}
                      </label>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 mb-0.5">{isAr ? "تاريخ الاعتماد" : "Board Date"}</label>
                        <input
                          type="date"
                          value={formData.approvals?.finalApprovalDate ? String(formData.approvals.finalApprovalDate).split('T')[0] : ""}
                          onChange={(e) => updateNestedField("approvals", "finalApprovalDate", undefined, e.target.value)}
                          className="w-full h-8 px-2 border border-slate-200 dark:border-slate-855 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Wizard Bottom Navigation Panel ── */}
      <div className="border-t border-slate-100 dark:border-slate-855 p-6 bg-slate-50/50 dark:bg-slate-900/10 flex justify-between items-center gap-4">
        
        {/* Cancel button / Back button to table */}
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 text-xs font-bold transition-all"
        >
          {isAr ? "إلغاء والعودة للجدول" : "Cancel & Return"}
        </button>

        <div className="flex gap-2">
          {/* Previous step */}
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 0 || loading}
            className={`flex items-center gap-1.5 h-10 px-4 rounded-xl border text-xs font-bold transition-all duration-200 ${
              step === 0 
                ? "opacity-40 cursor-not-allowed border-slate-150 text-slate-300 dark:border-slate-855" 
                : "border-slate-250 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            }`}
          >
            {isAr ? <ArrowRight size={15} /> : <ArrowLeft size={15} />}
            {isAr ? "السابق" : "Previous"}
          </button>

          {/* Next step / Submit */}
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 h-10 px-5 rounded-xl bg-primary hover:opacity-90 dark:bg-tertiary text-white text-xs font-bold transition-all duration-200 shadow-md shadow-primary/10"
            >
              {isAr ? "التالي" : "Next"}
              {isAr ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all duration-200 disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  {isAr ? "جاري الحفظ والاعتماد..." : "Saving..."}
                </>
              ) : (
                <>
                  <Check size={15} />
                  {isAr ? "حفظ واعتماد استمارة البحث" : "Submit Research"}
                </>
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

interface ImageUploadZoneProps {
  value: string;
  onChange: (url: string) => void;
  isAr: boolean;
  accept?: string;
}

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
    if (file.size > 5 * 1024 * 1024) {
      showToast(isAr ? "حجم الملف كبير جداً، الحد الأقصى المسموح 5 ميجابايت" : "File is too large, max size is 5MB", "error");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      showToast(isAr ? "صيغة الملف غير مدعومة (فقط JPG, PNG, WEBP, PDF)" : "Invalid file format (only JPG, PNG, WEBP, PDF allowed)", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // استدعاء واجهة رفع البحث المحسنة بـ sharp لضغط الصور تلقائياً بالخلفية
      const response = await fetch("/api/upload/research", {
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
    if (file) handleUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPdf = value?.toLowerCase().endsWith(".pdf");

  return (
    <div className="w-full">
      {value ? (
        <div className="relative group w-full h-28 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
          {isPdf ? (
            <div className="flex flex-col items-center justify-center p-3 text-slate-500 gap-1">
              <FileText size={32} className="text-red-500" />
              <span className="text-[9px] font-bold text-center truncate max-w-full">{isAr ? "ملف PDF مرفوع" : "Uploaded PDF"}</span>
            </div>
          ) : (
            <img
              src={value}
              alt="Upload Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-300">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all"
              title={isAr ? "تعديل المرفق" : "Modify File"}
            >
              <UploadCloud size={14} />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={loading}
              className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-350 rounded-lg backdrop-blur-sm transition-all"
              title={isAr ? "حذف المرفق" : "Remove File"}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !loading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-1.5 p-3 cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5 dark:border-tertiary dark:bg-tertiary/5 animate-pulse"
              : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/20"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-1.5">
              <Loader2 className="text-primary dark:text-tertiary animate-spin" size={20} />
              <span className="text-[9px] font-bold text-slate-500">{isAr ? "جاري الرفع..." : "Uploading..."}</span>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <UploadCloud size={15} />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-bold text-slate-850 dark:text-white">{isAr ? "انقر أو اسحب هنا" : "Upload document"}</p>
                <p className="text-[8px] text-slate-400 mt-0.5">{isAr ? "حجم أقصى 5MB" : "Max 5MB"}</p>
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
