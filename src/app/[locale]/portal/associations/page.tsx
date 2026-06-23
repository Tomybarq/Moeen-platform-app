import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import AssociationsClient from "@/components/portal/AssociationsClient";

export default async function AssociationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("associations");

  const associations = await prisma.association.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Date objects to ISO strings for the client component
  const serializedAssociations = associations.map((assoc) => ({
    id: assoc.id,
    name: assoc.name,
    createdAt: assoc.createdAt.toISOString(),
  }));

  return (
    <AssociationsClient
      initialAssociations={serializedAssociations}
      title={t("title")}
      emptyMessage={t("empty")}
      nameLabel={t("name")}
      createdAtLabel={t("createdAt")}
      locale={locale}
    />
  );
}
