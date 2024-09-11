import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";
import UsulanFormasiFasilitatorDetail from "@/components/Perencanaan/UsulanFormasiFasilitatorDetail";

function UsulanFormasiDetail() {
  const router = useRouter();

  return (
    <PageContainer
      onBack={() => router.back()}
      title="Usulan Formasi Detail"
      subTitle="Detail Usulan Formasi"
    >
      <UsulanFormasiFasilitatorDetail />
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
