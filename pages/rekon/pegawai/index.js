import PageContainer from "@/components/PageContainer";
import DaftarPegawai from "@/components/Rekon/DaftarPegawai";
import RekonLayout from "@/components/Rekon/RekonLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";

const Pegawai = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Daftar Pegawai</title>
      </Head>
      <PageContainer
        title="Daftar Pegawai Rekonisiliasi"
        content="Kelola dan monitor data pegawai untuk rekonisiliasi"
        subTitle="Lihat daftar lengkap pegawai dan status sinkronisasi data dengan sistem SIASN"
        breadcrumbRender={() => {
          return (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Rekonisiliasi</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Daftar Pegawai</Breadcrumb.Item>
            </Breadcrumb>
          );
        }}
      >
        <FloatButton.BackTop />
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
