import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import UsulanFormasiFasilitatorVerifier from "@/components/Perencanaan/UsulanFormasiFasilitatorVerifier";
import { Card } from "antd";
import { useRouter } from "next/router";

function UsulanFormasiDetail() {
  const router = useRouter();

  return (
    <PageContainer
      onBack={() => router.back()}
      title="Usulan Formasi Detail"
      subTitle="Detail Usulan Formasi"
    >
      <UsulanFormasiFasilitatorVerifier />
    </PageContainer>
  );
}

UsulanFormasiDetail.Auth = {
  action: "manage",
  subject: "Feeds",
};

UsulanFormasiDetail.getLayout = function getLayout(page) {
  return (
    <Layout active="/fasilitator-employees/perencanaan/usulan-formasi">
      {page}
    </Layout>
  );
};

export default UsulanFormasiDetail;
