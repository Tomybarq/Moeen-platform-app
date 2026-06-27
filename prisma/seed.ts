import { PrismaClient, RoleType } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

// Arrays for generating realistic Arabic mock names
const firstNames = [
  "أحمد", "محمد", "عبدالرحمن", "خالد", "عبدالله", "سعد", "سلطان", "فيصل", "فهد", "بندر",
  "ماجد", "سلمان", "ياسر", "عادل", "صالح", "إبراهيم", "يوسف", "سليمان", "علي", "عمر",
  "نواف", "تركي", "مشاري", "سعود", "عبدالملك", "عبدالمجيد", "ريان", "حاتم", "طارق", "مشعل"
];

const fatherNames = [
  "بن محمد", "بن عبدالله", "بن أحمد", "بن علي", "بن صالح", "بن خالد", "بن سعد",
  "بن فهد", "بن عبدالرحمن", "بن إبراهيم", "بن سليمان", "بن يوسف", "بن عمر", "بن سلطان"
];

const familyNames = [
  "العتيبي", "القحطاني", "الحربي", "المطيري", "الشمري", "الدوسري", "العنزي", "الغامدي",
  "الزهراني", "العسيري", "الشهري", "المالكي", "الخالدي", "التميمي", "السبيعي", "السهلي",
  "البقمي", "الرشيدي", "المري", "العجمي"
];

function getRandomName() {
  const f = firstNames[Math.floor(Math.random() * firstNames.length)];
  const fa = fatherNames[Math.floor(Math.random() * fatherNames.length)];
  const fam = familyNames[Math.floor(Math.random() * familyNames.length)];
  return `${f} ${fa} ${fam}`;
}

async function main() {
  console.log("🌱 [STRESS TEST SEED] Starting High-Performance Seeding for Moeen Platform...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Clean existing transactional and core data safely and reset sequences in PostgreSQL
  console.log("🧹 Cleaning old tables & resetting identities...");
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Dependent", "SocialResearch", "Beneficiary", "Association", "Marketer" RESTART IDENTITY CASCADE;'
  );

  // 2. Seed Associations
  console.log("👥 Seeding 3 Associations...");
  const assoc1 = await prisma.association.create({
    data: {
      id: 1,
      name: "جمعية البر بالرياض",
    },
  });

  const assoc2 = await prisma.association.create({
    data: {
      id: 2,
      name: "جمعية رعاية الأيتام بجدة",
    },
  });

  const assoc3 = await prisma.association.create({
    data: {
      id: 3,
      name: "جمعية الأجفر الخيرية",
    },
  });

  const assocIds = [assoc1.id, assoc2.id, assoc3.id];
  console.log(`[STRESS TEST SEED] Successfully deployed 3 Associations.`);

  // 3. Seed 30 Marketers
  console.log("📢 Seeding 30 Marketers...");
  const marketersData = Array.from({ length: 30 }).map((_, i) => {
    const names = [
      "مؤسسة معين التسويقية", "المسوق الرقمي أحمد محمد", "مكتب آفاق التسويقي",
      "مؤسسة العطاء الرقمي", "مكتب الخير للدعاية", "مؤسسة تمكين للتسويق الخيري",
      "شبكة المسوقين المحترفين", "مكتب نماء للتسويق", "مؤسسة التنمية للتطوير",
      "مكتب الوسيط الخيري"
    ];
    const name = i < names.length ? names[i] : `وكالة تسويق معين رقم ${i + 1}`;
    return {
      id: i + 1,
      name,
    };
  });

  await prisma.marketer.createMany({ data: marketersData });
  console.log(`[STRESS TEST SEED] Successfully deployed 30 Marketers.`);

  // 4. Seed Screens
  console.log("🖥️ Seeding Screens...");
  const dashboardScreen = await prisma.screen.upsert({
    where: { name: "dashboard" },
    update: { nameAr: "لوحة المعلومات" },
    create: { name: "dashboard", nameAr: "لوحة المعلومات", path: "/portal" },
  });

  const assocScreen = await prisma.screen.upsert({
    where: { name: "associations" },
    update: { nameAr: "الجمعيات" },
    create: { name: "associations", nameAr: "الجمعيات", path: "/portal/associations" },
  });

  const benScreen = await prisma.screen.upsert({
    where: { name: "beneficiaries" },
    update: { nameAr: "المستفيدين" },
    create: { name: "beneficiaries", nameAr: "المستفيدين", path: "/portal/beneficiaries" },
  });

  const marketerScreen = await prisma.screen.upsert({
    where: { name: "marketers" },
    update: { nameAr: "المسوقين" },
    create: { name: "marketers", nameAr: "المسوقين", path: "/portal/marketers" },
  });

  const settingsGenScreen = await prisma.screen.upsert({
    where: { name: "settings-general" },
    update: { nameAr: "الإعدادات العامة" },
    create: { name: "settings-general", nameAr: "الإعدادات العامة", path: "/portal/settings/general" },
  });

  const settingsUsersScreen = await prisma.screen.upsert({
    where: { name: "settings-users" },
    update: { nameAr: "إدارة المستخدمين" },
    create: { name: "settings-users", nameAr: "إدارة المستخدمين", path: "/portal/settings/users" },
  });

  const settingsPermsScreen = await prisma.screen.upsert({
    where: { name: "settings-permissions" },
    update: { nameAr: "إدارة الصلاحيات" },
    create: { name: "settings-permissions", nameAr: "إدارة الصلاحيات", path: "/portal/settings/permissions" },
  });

  // 5. Seed Roles
  console.log("🔑 Seeding Roles...");
  const roleSuperAdmin = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: { nameAr: "مدير النظام", type: "superadmin" },
    create: { name: "SUPER_ADMIN", nameAr: "مدير النظام", type: "superadmin" },
  });

  const roleAdmin = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: { nameAr: "إداري النظام", type: "admin" },
    create: { name: "ADMIN", nameAr: "إداري النظام", type: "admin" },
  });

  const roleStaff = await prisma.role.upsert({
    where: { name: "CHARITY_STAFF" },
    update: { nameAr: "مدير الجمعية", type: "user" },
    create: { name: "CHARITY_STAFF", nameAr: "مدير الجمعية", type: "user" },
  });

  const roleMarketer = await prisma.role.upsert({
    where: { name: "MARKETER" },
    update: { nameAr: "مسوق", type: "user" },
    create: { name: "MARKETER", nameAr: "مسوق", type: "user" },
  });

  const roleResearcher = await prisma.role.upsert({
    where: { name: "SOCIAL_RESEARCHER" },
    update: { nameAr: "باحث اجتماعي", type: "user" },
    create: { name: "SOCIAL_RESEARCHER", nameAr: "باحث اجتماعي", type: "user" },
  });

  const roleDataManager = await prisma.role.upsert({
    where: { name: "DATA_MANAGER" },
    update: { nameAr: "مدير البيانات", type: "user" },
    create: { name: "DATA_MANAGER", nameAr: "مدير البيانات", type: "user" },
  });

  // 6. Seed Role Permissions
  console.log("🛡️ Seeding Role Permissions...");
  const defaultActions = ["create", "edit", "delete", "archive", "view"];

  const superAdminScreens = [dashboardScreen, assocScreen, benScreen, marketerScreen, settingsGenScreen, settingsUsersScreen, settingsPermsScreen];
  for (const screen of superAdminScreens) {
    await prisma.rolePermission.upsert({
      where: { roleId_screenId: { roleId: roleSuperAdmin.id, screenId: screen.id } },
      update: { actions: defaultActions },
      create: { roleId: roleSuperAdmin.id, screenId: screen.id, actions: defaultActions },
    });
  }

  const charityScreens = [
    { screen: dashboardScreen, actions: ["view"] },
    { screen: assocScreen, actions: ["view"] },
    { screen: marketerScreen, actions: ["view"] },
    { screen: benScreen, actions: ["view", "create", "delete"] },
  ];
  for (const entry of charityScreens) {
    await prisma.rolePermission.upsert({
      where: { roleId_screenId: { roleId: roleStaff.id, screenId: entry.screen.id } },
      update: { actions: entry.actions },
      create: { roleId: roleStaff.id, screenId: entry.screen.id, actions: entry.actions },
    });
  }

  const marketerScreens = [
    { screen: dashboardScreen, actions: ["view"] },
    { screen: benScreen, actions: ["view"] },
  ];
  for (const entry of marketerScreens) {
    await prisma.rolePermission.upsert({
      where: { roleId_screenId: { roleId: roleMarketer.id, screenId: entry.screen.id } },
      update: { actions: entry.actions },
      create: { roleId: roleMarketer.id, screenId: entry.screen.id, actions: entry.actions },
    });
  }

  const adminScreens = [dashboardScreen, assocScreen, benScreen, marketerScreen, settingsGenScreen, settingsUsersScreen];
  for (const screen of adminScreens) {
    await prisma.rolePermission.upsert({
      where: { roleId_screenId: { roleId: roleAdmin.id, screenId: screen.id } },
      update: { actions: defaultActions },
      create: { roleId: roleAdmin.id, screenId: screen.id, actions: defaultActions },
    });
  }

  // 7. Seed Staff Users for Associations to enable RLS checks
  console.log("👤 Seeding Users & Charity Staff...");
  
  // Admin User: إداري النظام
  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: { password: hashedPassword, roleId: roleAdmin.id },
    create: { email: "admin@demo.com", password: hashedPassword, name: "إداري النظام", roleId: roleAdmin.id },
  });

  // Charity Staff Users
  const staff1 = await prisma.user.upsert({
    where: { email: "staff@demo.com" },
    update: { password: hashedPassword, roleId: roleStaff.id, associationId: assoc1.id },
    create: { email: "staff@demo.com", password: hashedPassword, name: "مدير جمعية البر بالرياض", roleId: roleStaff.id, associationId: assoc1.id },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: "staff2@demo.com" },
    update: { password: hashedPassword, roleId: roleStaff.id, associationId: assoc2.id },
    create: { email: "staff2@demo.com", password: hashedPassword, name: "مدير جمعية رعاية الأيتام بجدة", roleId: roleStaff.id, associationId: assoc2.id },
  });

  const staff3 = await prisma.user.upsert({
    where: { email: "staff3@demo.com" },
    update: { password: hashedPassword, roleId: roleStaff.id, associationId: assoc3.id },
    create: { email: "staff3@demo.com", password: hashedPassword, name: "مدير جمعية الأجفر الخيرية", roleId: roleStaff.id, associationId: assoc3.id },
  });

  // Social Researcher User
  await prisma.user.upsert({
    where: { email: "researcher@demo.com" },
    update: { password: hashedPassword, roleId: roleResearcher.id, associationId: assoc1.id },
    create: { email: "researcher@demo.com", password: hashedPassword, name: "الباحث الاجتماعي", roleId: roleResearcher.id, associationId: assoc1.id },
  });

  // Data Manager User
  await prisma.user.upsert({
    where: { email: "datamanager@demo.com" },
    update: { password: hashedPassword, roleId: roleDataManager.id },
    create: { email: "datamanager@demo.com", password: hashedPassword, name: "مدير البيانات", roleId: roleDataManager.id },
  });

  // Marketer User
  await prisma.user.upsert({
    where: { email: "marketer@demo.com" },
    update: { password: hashedPassword, roleId: roleMarketer.id, marketerId: 1 },
    create: { email: "marketer@demo.com", password: hashedPassword, name: "المسوق الرئيسي", roleId: roleMarketer.id, marketerId: 1 },
  });

  const staffMap: Record<number, number> = {
    [assoc1.id]: staff1.id,
    [assoc2.id]: staff2.id,
    [assoc3.id]: staff3.id,
  };

  // 8. Seed 3,000 Beneficiaries and their corresponding SocialResearch + Dependents
  console.log("🤝 Generating 3,000 Beneficiaries & Social Research records (High Performance)...");

  const beneficiariesToCreate = [];
  const socialResearchesToCreate = [];
  const dependentsToCreate = [];

  const medicalStatuses = ["سليم", "عاجز", "مزمن", "إعاقة"];
  const housingTypes = ["POPULAR", "APARTMENT", "VILLA_FLOOR", "ANNEX"];
  const housingOwnerships = ["RENT", "OWNED", "INHERITED", "ENDOWMENT"];
  const environmentTypes = ["HIGRAH", "BADIAH", "VILLAGE", "GOVERNORATE", "CITY"];

  const now = new Date();

  for (let i = 1; i <= 3000; i++) {
    // Systematic distribution: 1,000 beneficiaries per association
    const assocId = assocIds[(i - 1) % 3];
    const researcherId = staffMap[assocId];

    // Realistic Mock Parameters for calculating points
    const familySize = Math.floor(Math.random() * 8) + 1; // 1 to 8 members
    const monthlyIncome = Math.floor(Math.random() * 10) * 1000 + 2000; // 2000 to 11000 SAR
    const medicalStatus = medicalStatuses[Math.floor(Math.random() * medicalStatuses.length)];
    const rent = Math.random() > 0.4 ? Math.floor(Math.random() * 3) * 1000 + 1000 : 0; // 0, 1000, 2000, 3000 SAR

    // Eligibility Points Formula replica
    let incomeScore = 0;
    if (monthlyIncome <= 3000) incomeScore = 40;
    else if (monthlyIncome <= 5000) incomeScore = 25;
    else if (monthlyIncome <= 7000) incomeScore = 10;

    let familyScore = 0;
    if (familySize >= 7) familyScore = 30;
    else if (familySize >= 5) familyScore = 20;
    else if (familySize >= 3) familyScore = 10;

    let medicalScore = 0;
    if (medicalStatus === "عاجز" || medicalStatus === "إعاقة") medicalScore = 20;
    else if (medicalStatus === "مزمن") medicalScore = 10;

    let rentScore = 0;
    if (rent > 2000) rentScore = 10;
    else if (rent >= 1000) rentScore = 5;

    const totalScore = incomeScore + familyScore + medicalScore + rentScore;

    // Map to specific categories
    let status = "INELIGIBLE";
    let tierName = "Non-Eligible (غير مستحقة)";
    let caseCategory = "NOT_ELIGIBLE";

    if (totalScore >= 60) {
      status = "ELIGIBLE";
      tierName = "High Priority (أولوية قصوى)";
      caseCategory = "URGENT_PRIORITY";
    } else if (totalScore >= 35) {
      status = "PENDING";
      tierName = "Medium Priority (أولوية متوسطة)";
      caseCategory = "MEDIUM_PRIORITY";
    }

    const beneficiaryName = getRandomName();
    const nationalId = `${(i % 2 === 0 ? 1 : 2)}${String(i).padStart(9, "0")}`; // 10-digit unique KSA ID
    const phone = `+9665${String(i).padStart(8, "0")}`;
    const notes = `تحليل الاستحقاق التلقائي: النتيجة الكلية ${totalScore}/100. الفئة: ${tierName}.\n` +
      `الدخل الشهري: ${monthlyIncome} ريال (${incomeScore} نقاط) | ` +
      `أفراد العائلة: ${familySize} أفراد (${familyScore} نقاط) | ` +
      `الحالة الصحية: ${medicalStatus} (${medicalScore} نقاط) | ` +
      `الإيجار: ${rent} ريال (${rentScore} نقاط).`;

    const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 150) * 24 * 60 * 60 * 1000); // within last 150 days

    // Beneficiary node
    beneficiariesToCreate.push({
      id: i,
      name: beneficiaryName,
      status,
      notes,
      nationalId,
      phone,
      researcherId,
      createdAt,
      updatedAt: now,
    });

    // Social Research node (UUID-based ID)
    const researchId = crypto.randomUUID();
    socialResearchesToCreate.push({
      id: researchId,
      beneficiaryId: i,
      fileNumber: `F-${String(i).padStart(6, "0")}`,
      visitDate: createdAt,
      researcherName: "الباحث الاجتماعي الميداني",
      applicationStatus: "NEW",
      totalIncome: monthlyIncome,
      totalExpenses: rent + 1200.0,
      netRemainingIncome: monthlyIncome - (rent + 1200.0),
      environmentType: environmentTypes[Math.floor(Math.random() * environmentTypes.length)],
      housingType: housingTypes[Math.floor(Math.random() * housingTypes.length)],
      housingOwnership: housingOwnerships[Math.floor(Math.random() * housingOwnerships.length)],
      researcherOpinions: {
        caseCategory,
        finalRecommendation: `يوصى بتقديم الدعم اللازم لهذه الحالة وتدفق كفالة مالية أو رعاية عينية نظراً لوقوعها في فئة ${tierName}.`
      },
      needsAssessment: {
        basicNeedsJson: ["سلة غذائية شهرية", "سداد فواتير"],
        developmentalNeedsJson: ["تأهيل للعمل"],
        medical: medicalStatus !== "سليم"
      },
      proposedPrograms: [
        { name: "برنامج السلال الغذائية", amount: 350.0 }
      ],
      images: {
        outer: "/uploads/placeholder-building.jpg",
        livingRoom: "/uploads/placeholder-room.jpg"
      },
      createdAt,
      updatedAt: now,
    });

    // Dependents nodes for familySize > 1 (up to 3 dependents)
    if (familySize > 1) {
      const numDeps = Math.min(familySize - 1, 3);
      const depFirstNames = ["نوف", "سارة", "عبدالله", "فهد", "ريم", "ريان", "مريم", "يزيد"];
      const relationships = ["ابن", "ابنة", "زوجة"];

      for (let j = 0; j < numDeps; j++) {
        dependentsToCreate.push({
          id: crypto.randomUUID(),
          socialResearchId: researchId,
          name: `${depFirstNames[(i + j) % depFirstNames.length]} بن ${beneficiaryName.split(" ")[0]}`,
          relationship: j === 0 && familySize > 2 ? "زوجة" : relationships[(i + j) % relationships.length],
          birthYear: String(now.getFullYear() - (Math.floor(Math.random() * 18) + 1)), // age 1 to 18
          educationLevel: "ابتدائي",
          healthStatus: "سليم",
          socialStatus: "أعزب",
          employmentStatus: "غير موظف",
          createdAt,
          updatedAt: now,
        });
      }
    }
  }

  // Batch insert into database using high-speed transactions
  console.log("⚡ Executing high-speed database transaction insertions...");
  
  // We chunk beneficiary inserts in batches of 1,000 for safety and speed
  const chunkSize = 1000;
  for (let offset = 0; offset < beneficiariesToCreate.length; offset += chunkSize) {
    const chunk = beneficiariesToCreate.slice(offset, offset + chunkSize);
    await prisma.beneficiary.createMany({ data: chunk });
    console.log(`   [STRESS TEST SEED] Inserted Beneficiary chunk [${offset + chunk.length}/3000]`);
  }

  // Chunk social research inserts
  for (let offset = 0; offset < socialResearchesToCreate.length; offset += chunkSize) {
    const chunk = socialResearchesToCreate.slice(offset, offset + chunkSize);
    await prisma.socialResearch.createMany({ data: chunk });
    console.log(`   [STRESS TEST SEED] Inserted SocialResearch chunk [${offset + chunk.length}/3000]`);
  }

  // Chunk dependents inserts
  for (let offset = 0; offset < dependentsToCreate.length; offset += chunkSize) {
    const chunk = dependentsToCreate.slice(offset, offset + chunkSize);
    await prisma.dependent.createMany({ data: chunk });
    console.log(`   [STRESS TEST SEED] Inserted Dependents chunk [${offset + chunk.length}/${dependentsToCreate.length}]`);
  }

  console.log("⚙️ Syncing identity sequences in PostgreSQL...");
  await prisma.$executeRawUnsafe(
    'SELECT setval(pg_get_serial_sequence(\'"Beneficiary"\', \'id\'), coalesce(max(id), 1)) FROM "Beneficiary";'
  );

  console.log(`[STRESS TEST SEED] Batching 3,000 Beneficiaries... Done.`);
  console.log("🚀 [STRESS TEST SEED] Moeen Platform Seeding and Stress Test data deployed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
