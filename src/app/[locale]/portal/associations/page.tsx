import AssociationsClient from "@/components/portal/AssociationsClient";

export default async function AssociationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AssociationsClient locale={locale} />;
}
