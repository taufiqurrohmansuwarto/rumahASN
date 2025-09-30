import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { PendingRequestsList } from "@/components/EsignBKD";
import Head from "next/head";

const PendingActionsPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - E-Sign BKD - Menunggu Tindakan</title>
      </Head>
      <PendingRequestsList />
    </>
  );
};

PendingActionsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

PendingActionsPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/pending">{page}</EsignBKDLayout>;
};

export default PendingActionsPage;
