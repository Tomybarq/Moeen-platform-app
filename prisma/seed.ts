import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Seeding for Moeen Platform...");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Seed Associations (الجمعيات)
  console.log("👥 Seeding Associations...");
  const assoc1 = await prisma.association.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "جمعية معين للتنمية الأهلية",
    },
  });

  await prisma.association.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "جمعية البر والخدمات الاجتماعية",
    },
  });

  // 2. Seed Marketers (المسوقين)
  console.log("📢 Seeding Marketers...");
  const marketer1 = await prisma.marketer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "مؤسسة معين التسويقية",
    },
  });

  await prisma.marketer.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "المسوق الرقمي أحمد محمد",
    },
  });

  // 3. Seed Beneficiaries (المستفيدين)
  console.log("🤝 Seeding Beneficiaries...");
  const beneficiary1 = await prisma.beneficiary.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "المستفيد محمد عبد الرحمن العتيبي",
    },
  });

  await prisma.beneficiary.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "المستفيدة نورة صالح القحطاني",
    },
  });

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

  // SUPER_ADMIN gets all screens
  const superAdminScreens = [dashboardScreen, assocScreen, benScreen, marketerScreen, settingsGenScreen, settingsUsersScreen, settingsPermsScreen];
  for (const screen of superAdminScreens) {
    await prisma.rolePermission.upsert({
      where: { roleId_screenId: { roleId: roleSuperAdmin.id, screenId: screen.id } },
      update: { actions: defaultActions },
      create: { roleId: roleSuperAdmin.id, screenId: screen.id, actions: defaultActions },
    });
  }

  // CHARITY_STAFF gets dashboard (view), associations (view), marketers (view), and beneficiaries (view, create, delete)
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

  // MARKETER gets dashboard (view) and beneficiaries (view) only
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

  // ADMIN gets dashboard, associations, beneficiaries, marketers, settings-general, settings-users
  const adminScreens = [dashboardScreen, assocScreen, benScreen, marketerScreen, settingsGenScreen, settingsUsersScreen];
  for (const screen of adminScreens) {
    await prisma.rolePermission.upsert({
      where: { roleId_screenId: { roleId: roleAdmin.id, screenId: screen.id } },
      update: { actions: defaultActions },
      create: { roleId: roleAdmin.id, screenId: screen.id, actions: defaultActions },
    });
  }

  // SOCIAL_RESEARCHER gets dashboard (view), beneficiaries (create, edit, view)
  const researcherScreens = [
    { screen: dashboardScreen, actions: ["view"] },
    { screen: benScreen, actions: ["create", "edit", "view"] },
  ];
  for (const entry of researcherScreens) {
    await prisma.rolePermission.upsert({
      where: { roleId_screenId: { roleId: roleResearcher.id, screenId: entry.screen.id } },
      update: { actions: entry.actions },
      create: { roleId: roleResearcher.id, screenId: entry.screen.id, actions: entry.actions },
    });
  }

  // DATA_MANAGER gets dashboard (view), associations (view), marketers (view), beneficiaries (view, delete)
  const dataManagerScreens = [
    { screen: dashboardScreen, actions: ["view"] },
    { screen: assocScreen, actions: ["view"] },
    { screen: marketerScreen, actions: ["view"] },
    { screen: benScreen, actions: ["view", "delete"] },
  ];
  for (const entry of dataManagerScreens) {
    await prisma.rolePermission.upsert({
      where: { roleId_screenId: { roleId: roleDataManager.id, screenId: entry.screen.id } },
      update: { actions: entry.actions },
      create: { roleId: roleDataManager.id, screenId: entry.screen.id, actions: entry.actions },
    });
  }

  // 7. Seed Users
  console.log("👤 Seeding Users...");

  // Admin User 1: إداري النظام
  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {
      password: hashedPassword,
      name: "إداري النظام",
      roleId: roleAdmin.id,
      status: "active",
    },
    create: {
      email: "admin@demo.com",
      password: hashedPassword,
      name: "إداري النظام",
      roleId: roleAdmin.id,
      status: "active",
    },
  });

  // Admin User 2: مدير المنصة
  await prisma.user.upsert({
    where: { email: "manager@demo.com" },
    update: {
      password: hashedPassword,
      name: "مدير المنصة",
      roleId: roleAdmin.id,
      status: "active",
    },
    create: {
      email: "manager@demo.com",
      password: hashedPassword,
      name: "مدير المنصة",
      roleId: roleAdmin.id,
      status: "active",
    },
  });

  // Social Researcher User
  await prisma.user.upsert({
    where: { email: "researcher@demo.com" },
    update: {
      password: hashedPassword,
      name: "الباحث الاجتماعي",
      roleId: roleResearcher.id,
      status: "active",
    },
    create: {
      email: "researcher@demo.com",
      password: hashedPassword,
      name: "الباحث الاجتماعي",
      roleId: roleResearcher.id,
      status: "active",
    },
  });

  // Data Manager User
  await prisma.user.upsert({
    where: { email: "datamanager@demo.com" },
    update: {
      password: hashedPassword,
      name: "مدير البيانات",
      roleId: roleDataManager.id,
      status: "active",
    },
    create: {
      email: "datamanager@demo.com",
      password: hashedPassword,
      name: "مدير البيانات",
      roleId: roleDataManager.id,
      status: "active",
    },
  });

  // Association Staff User
  await prisma.user.upsert({
    where: { email: "staff@demo.com" },
    update: {
      password: hashedPassword,
      name: "مدير الجمعية",
      roleId: roleStaff.id,
      status: "active",
      associationId: assoc1.id,
    },
    create: {
      email: "staff@demo.com",
      password: hashedPassword,
      name: "مدير الجمعية",
      roleId: roleStaff.id,
      status: "active",
      associationId: assoc1.id,
    },
  });

  // Marketer User
  await prisma.user.upsert({
    where: { email: "marketer@demo.com" },
    update: {
      password: hashedPassword,
      name: "المسوق معين",
      roleId: roleMarketer.id,
      status: "active",
      marketerId: marketer1.id,
    },
    create: {
      email: "marketer@demo.com",
      password: hashedPassword,
      name: "المسوق معين",
      roleId: roleMarketer.id,
      status: "active",
      marketerId: marketer1.id,
    },
  });

  console.log("🚀 Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
