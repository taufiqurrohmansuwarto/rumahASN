import PageContainer from "@/components/PageContainer";
import DaftarPegawaiParuhWaktu from "@/components/Rekon/DaftarPegawaiParuhWaktu";
import RekonLayout from "@/components/Rekon/RekonLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";

const ParuhWaktu = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Paruh Waktu</title>
      </Head>
      <PageContainer
        title="Rekon"
        content="Paruh Waktu"
        breadcrumbRender={() => {
          return (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Paruh Waktu</Breadcrumb.Item>
            </Breadcrumb>
          );
        }}
      >
        <FloatButton.BackTop />
        <DaftarPegawaiParuhWaktu />
      </PageContainer>
    </>
  );
};

ParuhWaktu.getLayout = (page) => {
  return <RekonLayout active="/rekon/paruh-waktu">{page}</RekonLayout>;
};

ParuhWaktu.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ParuhWaktu;
