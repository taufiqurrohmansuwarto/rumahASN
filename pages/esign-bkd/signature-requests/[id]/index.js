import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentDetail } from "@/components/EsignBKD";
import Head from "next/head";

const SignatureRequestDetailPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Permintaan Tanda Tangan E-Sign BKD</title>
      </Head>
      <DocumentDetail />
    </>
  );
};

SignatureRequestDetailPage.Auth = {
  action: "manage",
  subject: "tickets",
};

SignatureRequestDetailPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/signature-requests">{page}</EsignBKDLayout>;
};

export default SignatureRequestDetailPage;