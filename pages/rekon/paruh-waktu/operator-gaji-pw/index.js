import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";

import OperatorUpahParuhWaktu from "@/components/Rekon/OperatorUpahParuhWaktu/OperatorUpahParuhWaktu";

// Export komponen OperatorUpahParuhWaktu
export { OperatorUpahParuhWaktu };

const OperatorUpahParuhWaktuPage = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Operator Gaji Paruh Waktu</title>
      </Head>
      <PageContainer
        title="Operator Gaji Paruh Waktu"
        subTitle="Kelola operator pengelola gaji"
        breadcrumbRender={() => {
          return (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/rekon/paruh-waktu/pegawai">Paruh Waktu</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Operator Gaji</Breadcrumb.Item>
            </Breadcrumb>
          );
        }}
      >
        <FloatButton.BackTop />
        <OperatorUpahParuhWaktu />
      </PageContainer>
    </>
  );
};

OperatorUpahParuhWaktuPage.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/paruh-waktu/operator-gaji-pw">
      {page}
    </RekonLayout>
  );
};

OperatorUpahParuhWaktuPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default OperatorUpahParuhWaktuPage;
