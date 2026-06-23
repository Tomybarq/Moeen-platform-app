import { getTranslations } from "next-intl/server";
import prisma from "@/lib/prisma";
import MarketersClient from "@/components/portal/MarketersClient";

export default async function MarketersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("marketers");

  const marketers = await prisma.marketer.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Date objects to ISO strings for the client component
  const serializedMarketers = marketers.map((marketer) => ({
    id: marketer.id,
    name: marketer.name,
    createdAt: marketer.createdAt.toISOString(),
  }));

  return (
    <MarketersClient
      initialMarketers={serializedMarketers}
      title={t("title")}
      emptyMessage={t("empty")}
      nameLabel={t("name")}
      createdAtLabel={t("createdAt")}
      locale={locale}
    />
  );
}
