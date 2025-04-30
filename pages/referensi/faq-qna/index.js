import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DaftarFAQQna from "@/components/Ticket/DaftarFAQQna";
import { Grid } from "antd";
import Head from "next/head";

const FaqQnaPage = () => {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Kualitas Data - BUP Masih Aktif</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="FAQ Bot AI"
        content="FAQ Bot AI"
      >
        <DaftarFAQQna />
      </PageContainer>
    </>
  );
};

FaqQnaPage.getLayout = (page) => {
  return <Layout active="/referensi/faq-qna">{page}</Layout>;
};

FaqQnaPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default FaqQnaPage;
