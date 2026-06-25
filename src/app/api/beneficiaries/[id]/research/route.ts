import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { socialResearchSchema } from "@/lib/zodSchemas";
import { logEvent } from "@/lib/eventLogger";

/**
 * جلب بيانات البحث الاجتماعي والميداني لمستفيد محدد.
 * يتم تسطيح العلاقات الفرعية (SocialResearch & Dependents) تلقائياً لتوافق واجهة العميل.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 });
    }

    const isAuthorized =
      session.role === "SUPER_ADMIN" ||
      session.role === "SOCIAL_RESEARCHER" ||
      session.role === "CHARITY_STAFF";
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "عذراً، لا تمتلك الصلاحيات الكافية لعرض بيانات البحث الاجتماعي" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const beneficiaryId = parseInt(id);
    if (isNaN(beneficiaryId)) {
      return NextResponse.json({ error: "معرف المستفيد غير صحيح" }, { status: 400 });
    }

    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
      include: {
        socialResearch: {
          include: {
            dependents: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

    if (!beneficiary) {
      return NextResponse.json({ error: "المستفيد غير موجود بالنظام" }, { status: 404 });
    }

    const research = beneficiary.socialResearch;
    
    // الهيكل الافتراضي لضمان تماسك البيانات بالواجهة الأمامية
    let flatResearchData = {
      id: beneficiary.id,
      name: beneficiary.name,
      phone: beneficiary.phone,
      nationalId: beneficiary.nationalId,
      fileNumber: "",
      visitDate: new Date() as Date | null,
      researcherName: "",
      applicationStatus: "NEW",
      lastUpdateDate: null as Date | null,
      fullName: beneficiary.name,
      birthYear: "",
      maritalStatus: "SINGLE",
      educationLevel: "",
      healthStatus: "HEALTHY",
      healthDetails: "",
      phoneNumber: beneficiary.phone || "",
      alternativePhone: "",
      totalFamilyMembers: 0,
      nationalAddress: "",
      dependents: [] as any[],

      jobIncome: 0,
      socialSecurity: 0,
      citizenAccount: 0,
      disabilitySupport: 0,
      otherCharitySupport: 0,
      otherAssetsIncome: { livestockCount: 0, farm: false, taxi: false, other: "" },
      totalIncome: 0,

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
      totalExpenses: 0,
      netRemainingIncome: 0,
      
      environmentType: "CITY",
      housingType: "APARTMENT",
      housingOwnership: "RENT",
      
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
      caseCategory: "MEDIUM_PRIORITY",
      approvals: {
        researcherSigned: false,
        researcherDate: "",
        careManagerSigned: false,
        careManagerDate: "",
        finalApprovalSigned: false,
        finalApprovalDate: ""
      },
      
      researcherOpinionSection1: "",
      researcherOpinionSection2: "",
      researcherOpinionSection3: "",
      researcherOpinionSection4: "",
      researcherOpinionSection5: "",
      researcherOpinionSection6: "",
    };

    if (research) {
      const ops = (research.researcherOpinions || {}) as any;
      const na = (research.needsAssessment || {}) as any;
      const img = (research.images || {}) as any;
      const pp = (research.proposedPrograms || []) as any;
      const app = (research.approvals || {}) as any;

      flatResearchData = {
        ...flatResearchData,
        fileNumber: research.fileNumber,
        visitDate: research.visitDate,
        researcherName: research.researcherName,
        applicationStatus: research.applicationStatus as any,
        lastUpdateDate: research.lastUpdateDate,
        totalIncome: research.totalIncome,
        totalExpenses: research.totalExpenses,
        netRemainingIncome: research.netRemainingIncome,
        environmentType: research.environmentType as any,
        housingType: research.housingType as any,
        housingOwnership: research.housingOwnership as any,
        
        // الآراء والتقييمات
        researcherOpinionSection1: ops.researcherOpinionSection1 || "",
        researcherOpinionSection2: ops.researcherOpinionSection2 || "",
        researcherOpinionSection3: ops.researcherOpinionSection3 || "",
        researcherOpinionSection4: ops.researcherOpinionSection4 || "",
        researcherOpinionSection5: ops.researcherOpinionSection5 || "",
        researcherOpinionSection6: ops.researcherOpinionSection6 || "",
        finalRecommendation: ops.finalRecommendation || "",
        caseCategory: ops.caseCategory || "MEDIUM_PRIORITY",

        // حصر الاحتياجات
        financialSponsorshipAmount: na.financialSponsorshipAmount || 0,
        financialSponsorshipJustification: na.financialSponsorshipJustification || "",
        foodBasketSize: na.foodBasketSize || "MEDIUM",
        foodBasketFrequency: na.foodBasketFrequency || "MONTHLY",
        babyMilk: na.babyMilk || false,
        sanitaryTools: na.sanitaryTools || false,
        unpaidElectricity: na.unpaidElectricity || 0,
        unpaidWater: na.unpaidWater || 0,
        rentReliefAmount: na.rentReliefAmount || 0,
        medicalDiseaseType: na.medicalDiseaseType || "",
        medicalNeedType: na.medicalNeedType || "",
        estimatedMedicalCost: na.estimatedMedicalCost || 0,
        basicNeedsJson: na.basicNeedsJson || flatResearchData.basicNeedsJson,
        developmentalNeedsJson: na.developmentalNeedsJson || flatResearchData.developmentalNeedsJson,
        
        // المالي
        jobIncome: na.jobIncome || 0,
        socialSecurity: na.socialSecurity || 0,
        citizenAccount: na.citizenAccount || 0,
        disabilitySupport: na.disabilitySupport || 0,
        otherCharitySupport: na.otherCharitySupport || 0,
        otherAssetsIncome: na.otherAssetsIncome || flatResearchData.otherAssetsIncome,

        houseRent: na.houseRent || 0,
        electricityBill: na.electricityBill || 0,
        waterBill: na.waterBill || 0,
        internetBill: na.internetBill || 0,
        medicalExpenses: na.medicalExpenses || 0,
        transportExpenses: na.transportExpenses || 0,
        foodExpenses: na.foodExpenses || 0,
        scheduledDebts: na.scheduledDebts || 0,
        debtReason: na.debtReason || "",
        debtRepaymentPeriod: na.debtRepaymentPeriod || "",

        // معلومات رب الأسرة
        fullName: na.fullName || beneficiary.name,
        birthYear: na.birthYear || "",
        maritalStatus: na.maritalStatus || "SINGLE",
        educationLevel: na.educationLevel || "",
        healthStatus: na.healthStatus || "HEALTHY",
        healthDetails: na.healthDetails || "",
        phoneNumber: na.phoneNumber || beneficiary.phone || "",
        alternativePhone: na.alternativePhone || "",
        totalFamilyMembers: na.totalFamilyMembers || 0,
        nationalAddress: na.nationalAddress || "",

        dependents: research.dependents || [],
        proposedDonationPrograms: pp,
        buildingOuterImage: img.buildingOuterImage || "",
        livingRoomImage: img.livingRoomImage || "",
        kitchenImage: img.kitchenImage || "",
        roofRepairImage: img.roofRepairImage || "",
        approvals: app
      };
    }

    return NextResponse.json({
      success: true,
      researchData: flatResearchData,
    });
  } catch (error) {
    console.error("GET /api/beneficiaries/[id]/research error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي أثناء جلب بيانات البحث الاجتماعي" },
      { status: 500 }
    );
  }
}

/**
 * تحديث أو إنشاء بيانات البحث الاجتماعي وحفظها بشكل علائقي.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "غير مصرح بالوصول" }, { status: 401 });
    }

    const isAuthorized =
      session.role === "SUPER_ADMIN" || session.role === "SOCIAL_RESEARCHER";
    if (!isAuthorized) {
      return NextResponse.json(
        { error: "عذراً، لا تمتلك الصلاحيات الكافية لتعديل بيانات البحث الاجتماعي" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const beneficiaryId = parseInt(id);
    if (isNaN(beneficiaryId)) {
      return NextResponse.json({ error: "معرف المستفيد غير صحيح" }, { status: 400 });
    }

    const body = await request.json();
    const result = socialResearchSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const existingBeneficiary = await prisma.beneficiary.findUnique({
      where: { id: beneficiaryId },
    });

    if (!existingBeneficiary) {
      return NextResponse.json({ error: "المستفيد غير موجود بالنظام" }, { status: 404 });
    }

    // حساب المجاميع المالية
    const totalIncome =
      result.data.jobIncome +
      result.data.socialSecurity +
      result.data.citizenAccount +
      result.data.disabilitySupport +
      result.data.otherCharitySupport;

    const totalExpenses =
      result.data.houseRent +
      result.data.electricityBill +
      result.data.waterBill +
      result.data.internetBill +
      result.data.medicalExpenses +
      result.data.transportExpenses +
      result.data.foodExpenses +
      result.data.scheduledDebts;

    const netRemainingIncome = totalIncome - totalExpenses;

    // هيكلة البيانات في حقول JSON لتخزينها
    const researcherOpinions = {
      researcherOpinionSection1: result.data.researcherOpinionSection1 || "",
      researcherOpinionSection2: result.data.dependents?.[0]?.researcherOpinionSection2 || "",
      researcherOpinionSection3: result.data.researcherOpinionSection3 || "",
      researcherOpinionSection4: result.data.researcherOpinionSection4 || "",
      researcherOpinionSection5: result.data.researcherOpinionSection5 || "",
      researcherOpinionSection6: result.data.researcherOpinionSection6 || "",
      finalRecommendation: result.data.finalRecommendation || "",
      caseCategory: result.data.caseCategory || "MEDIUM_PRIORITY"
    };

    const needsAssessment = {
      fullName: result.data.fullName,
      birthYear: result.data.birthYear,
      maritalStatus: result.data.maritalStatus,
      educationLevel: result.data.educationLevel,
      healthStatus: result.data.healthStatus,
      healthDetails: result.data.healthDetails,
      phoneNumber: result.data.phoneNumber,
      alternativePhone: result.data.alternativePhone,
      totalFamilyMembers: result.data.totalFamilyMembers,
      nationalAddress: result.data.nationalAddress,

      financialSponsorshipAmount: result.data.financialSponsorshipAmount,
      financialSponsorshipJustification: result.data.financialSponsorshipJustification,
      foodBasketSize: result.data.foodBasketSize,
      foodBasketFrequency: result.data.foodBasketFrequency,
      babyMilk: result.data.babyMilk,
      sanitaryTools: result.data.sanitaryTools,
      unpaidElectricity: result.data.unpaidElectricity,
      unpaidWater: result.data.unpaidWater,
      rentReliefAmount: result.data.rentReliefAmount,
      medicalDiseaseType: result.data.medicalDiseaseType,
      medicalNeedType: result.data.medicalNeedType,
      estimatedMedicalCost: result.data.estimatedMedicalCost,
      basicNeedsJson: result.data.basicNeedsJson,
      developmentalNeedsJson: result.data.developmentalNeedsJson,

      jobIncome: result.data.jobIncome,
      socialSecurity: result.data.socialSecurity,
      citizenAccount: result.data.citizenAccount,
      disabilitySupport: result.data.disabilitySupport,
      otherCharitySupport: result.data.otherCharitySupport,
      otherAssetsIncome: result.data.otherAssetsIncome,

      houseRent: result.data.houseRent,
      electricityBill: result.data.electricityBill,
      waterBill: result.data.waterBill,
      internetBill: result.data.internetBill,
      medicalExpenses: result.data.medicalExpenses,
      transportExpenses: result.data.transportExpenses,
      foodExpenses: result.data.foodExpenses,
      scheduledDebts: result.data.scheduledDebts,
      debtReason: result.data.debtReason,
      debtRepaymentPeriod: result.data.debtRepaymentPeriod
    };

    const images = {
      buildingOuterImage: result.data.buildingOuterImage || "",
      livingRoomImage: result.data.livingRoomImage || "",
      kitchenImage: result.data.kitchenImage || "",
      roofRepairImage: result.data.roofRepairImage || ""
    };

    const approvals = result.data.approvals || {};
    const proposedPrograms = result.data.proposedDonationPrograms || [];

    // الحفظ في قاعدة البيانات في معاملة واحدة (Transaction)
    const updatedResearch = await prisma.$transaction(async (tx) => {
      // 1. تحديث أو إضافة سجل البحث الاجتماعي
      const research = await tx.socialResearch.upsert({
        where: { beneficiaryId },
        create: {
          beneficiaryId,
          fileNumber: result.data.fileNumber,
          visitDate: result.data.visitDate || new Date(),
          researcherName: result.data.researcherName,
          applicationStatus: result.data.applicationStatus,
          lastUpdateDate: result.data.lastUpdateDate,
          totalIncome,
          totalExpenses,
          netRemainingIncome,
          environmentType: result.data.environmentType,
          housingType: result.data.housingType,
          housingOwnership: result.data.housingOwnership,
          researcherOpinions,
          needsAssessment,
          proposedPrograms,
          images,
          approvals
        },
        update: {
          fileNumber: result.data.fileNumber,
          visitDate: result.data.visitDate || new Date(),
          researcherName: result.data.researcherName,
          applicationStatus: result.data.applicationStatus,
          lastUpdateDate: result.data.lastUpdateDate,
          totalIncome,
          totalExpenses,
          netRemainingIncome,
          environmentType: result.data.environmentType,
          housingType: result.data.housingType,
          housingOwnership: result.data.housingOwnership,
          researcherOpinions,
          needsAssessment,
          proposedPrograms,
          images,
          approvals
        }
      });

      // 2. تنظيف وإعادة إنشاء التابعين
      await tx.dependent.deleteMany({
        where: { socialResearchId: research.id }
      });

      if (result.data.dependents && result.data.dependents.length > 0) {
        await tx.dependent.createMany({
          data: result.data.dependents.map((dep: any) => ({
            socialResearchId: research.id,
            name: dep.name,
            relationship: dep.relationship,
            birthYear: dep.birthYear,
            educationLevel: dep.educationLevel || "",
            healthStatus: dep.healthStatus || "",
            socialStatus: dep.socialStatus || "",
            employmentStatus: dep.employmentStatus || ""
          }))
        });
      }

      // 3. تحديث الفئة وحالة الاستحقاق بجدول المستفيد للتوافق
      const legacyStatus = result.data.caseCategory === "URGENT_PRIORITY" 
        ? "HIGH" 
        : result.data.caseCategory === "MEDIUM_PRIORITY" 
        ? "MEDIUM" 
        : "REJECTED";

      await tx.beneficiary.update({
        where: { id: beneficiaryId },
        data: {
          status: result.data.caseCategory
        }
      });

      return research;
    });

    logEvent("beneficiary.research.updated", updatedResearch, session.userId);

    return NextResponse.json({
      success: true,
      message: "تم حفظ واعتماد ملف البحث الاجتماعي الميداني بنجاح",
      research: updatedResearch,
    });
  } catch (error) {
    console.error("PUT /api/beneficiaries/[id]/research error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي أثناء تحديث بيانات البحث الاجتماعي" },
      { status: 500 }
    );
  }
}
