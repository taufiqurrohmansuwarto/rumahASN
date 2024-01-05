import LayoutAsnConnect from "@/components/LayoutASNConnect";
import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnUpdateAllActivities = () => {
  useScrollRestoration();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update - All Activities</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        title="ASN Updates"
        content="Semua Aktifitas"
      >
        <p>test all my activities</p>
      </PageContainer>
    </>
  );
};

AsnUpdateAllActivities.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnUpdateAllActivities.getLayout = (page) => {
  return (
    <LayoutAsnConnect active="/asn-connect/asn-updates">
      {page}
    </LayoutAsnConnect>
  );
};

export default AsnUpdateAllActivities;
