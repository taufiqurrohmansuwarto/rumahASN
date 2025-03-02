import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import DaftarPegawai from "@/components/Rekon/DaftarPegawai";
import Head from "next/head";
import { Breadcrumb } from "antd";
const Pegawai = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Daftar Pegawai</title>
      </Head>
      <PageContainer
        title="Rekon"
        content="Daftar Pegawai"
        breadcrumbRender={() => {
          return (
            <Breadcrumb>
              <Breadcrumb.Item>Home</Breadcrumb.Item>
              <Breadcrumb.Item>List</Breadcrumb.Item>
              <Breadcrumb.Item>App</Breadcrumb.Item>
            </Breadcrumb>
          );
        }}
      >
        <DaftarPegawai />
      </PageContainer>
    </>
  );
};

Pegawai.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Pegawai.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Pegawai;
