import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailWebinarSeriesAdmin from "@/components/WebinarSeries/DetailWebinarSeriesAdmin";
import Head from "next/head";

const DetailWebinarSeries = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Webinar</title>
      </Head>
      <PageContainer>
        <DetailWebinarSeriesAdmin />
      </PageContainer>
    </>
  );
};

DetailWebinarSeries.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

DetailWebinarSeries.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailWebinarSeries;
