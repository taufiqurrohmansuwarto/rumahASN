import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { SignatureRequestDetail } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

const SignatureRequestDetailPage = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Permintaan Tanda Tangan E-Sign BKD</title>
      </Head>
      <PageContainer
        content="Detail permintaan tanda tangan elektronik"
        title="Detail TTE"
        onBack={() => router.back()}
      >
        <SignatureRequestDetail />
      </PageContainer>
    </>
  );
};

SignatureRequestDetailPage.Auth = {
  action: "manage",
  subject: "tickets",
};

SignatureRequestDetailPage.getLayout = (page) => {
  return (
    <EsignBKDLayout active="/esign-bkd/signature-requests">
      {page}
    </EsignBKDLayout>
  );
};

export default SignatureRequestDetailPage;
