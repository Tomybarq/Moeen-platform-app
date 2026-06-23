import BeneficiariesClient from "@/components/portal/BeneficiariesClient";

export default async function BeneficiariesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <BeneficiariesClient locale={locale} />;
}
