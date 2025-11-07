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
        <title>Rumah ASN - Rekon - Audit Log Upah Paruh Waktu</title>
      </Head>
      <PageContainer
        title="Audit Log Upah Paruh Waktu"
        content="Riwayat perubahan upah pegawai paruh waktu"
        breadcrumbRender={() => {
          return (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/rekon/paruh-waktu/pegawai">Paruh Waktu</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Audit Log</Breadcrumb.Item>
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
