import React from "react";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import UsulanFormasiFasilitator from "@/components/Perencanaan/UsulanFormasiFasilitator";

function UsulanFormasi() {
  return (
    <PageContainer title="Usulan Formasi" subTitle="Usulan Formasi Perencanaan">
      <UsulanFormasiFasilitator />
    </PageContainer>
  );
}

UsulanFormasi.Auth = {
  action: "manage",
  subject: "Feeds",
};

UsulanFormasi.getLayout = function getLayout(page) {
  return (
    <Layout active="/fasilitator-employees/perencanaan/usulan-formasi">
      {page}
    </Layout>
  );
};

export default UsulanFormasi;
