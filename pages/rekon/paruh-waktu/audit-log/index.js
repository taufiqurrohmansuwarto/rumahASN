import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";

import AuditUpahParuhWaktu from "@/components/Rekon/AuditUpahParuhWaktu/AuditUpahParuhWaktu";

// Export komponen AuditUpahParuhWaktu
export { AuditUpahParuhWaktu };

const AuditLogUpahParuhWaktuPage = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Audit Upah Paruh Waktu</title>
      </Head>
      <PageContainer
        title="Rekon"
        content="Audit Upah Paruh Waktu"
        breadcrumbRender={() => {
          return (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Audit Upah Paruh Waktu</Breadcrumb.Item>
            </Breadcrumb>
          );
        }}
      >
        <FloatButton.BackTop />
        <AuditUpahParuhWaktu />
      </PageContainer>
    </>
  );
};

AuditLogUpahParuhWaktuPage.getLayout = (page) => {
  return (
    <RekonLayout active="/rekon/paruh-waktu/audit-log">{page}</RekonLayout>
  );
};

AuditLogUpahParuhWaktuPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AuditLogUpahParuhWaktuPage;
