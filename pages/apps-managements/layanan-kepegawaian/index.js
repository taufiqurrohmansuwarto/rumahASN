import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";

const LayananKepegawaian = () => {
  return (
    <>
      <PageContainer title="Daftar Layanan Kepegawaian" content="Admin">
        Ini adalah layanan kepegawaian
      </PageContainer>
    </>
  );
};

LayananKepegawaian.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

LayananKepegawaian.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananKepegawaian;
