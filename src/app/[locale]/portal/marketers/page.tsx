import MarketersClient from "@/components/portal/MarketersClient";

export default async function MarketersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <MarketersClient locale={locale} />;
}
