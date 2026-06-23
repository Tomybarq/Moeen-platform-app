import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import BeneficiariesClient from "@/components/portal/BeneficiariesClient";

export default async function BeneficiariesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("beneficiaries");

  const beneficiaries = await prisma.beneficiary.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Date objects to ISO strings for the client component
  const serializedBeneficiaries = beneficiaries.map((ben) => ({
    id: ben.id,
    name: ben.name,
    createdAt: ben.createdAt.toISOString(),
  }));

  return (
    <BeneficiariesClient
      initialBeneficiaries={serializedBeneficiaries}
      title={t("title")}
      emptyMessage={t("empty")}
      nameLabel={t("name")}
      createdAtLabel={t("createdAt")}
      locale={locale}
    />
  );
}
