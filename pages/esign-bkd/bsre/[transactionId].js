import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { BsreTransactionDetail } from "@/components/EsignBKD";
import Head from "next/head";

const BsreTransactionDetailPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Transaksi BSrE E-Sign BKD</title>
      </Head>
      <BsreTransactionDetail />
    </>
  );
};

BsreTransactionDetailPage.Auth = {
  action: "manage",
  subject: "tickets",
};

BsreTransactionDetailPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/bsre">{page}</EsignBKDLayout>;
};

export default BsreTransactionDetailPage;