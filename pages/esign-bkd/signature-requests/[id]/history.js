import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { SignatureHistory } from "@/components/EsignBKD";
import Head from "next/head";

const SignatureHistoryPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Riwayat Tanda Tangan E-Sign BKD</title>
      </Head>
      <SignatureHistory />
    </>
  );
};

SignatureHistoryPage.Auth = {
  action: "manage",
  subject: "tickets",
};

SignatureHistoryPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/signature-requests">{page}</EsignBKDLayout>;
};

export default SignatureHistoryPage;