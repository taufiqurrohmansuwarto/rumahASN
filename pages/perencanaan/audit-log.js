import PageContainer from "@/components/PageContainer";
import AuditLogList from "@/components/PerencanaanFormasi/AuditLogList";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";

const AuditLogFormasi = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Audit Log Perencanaan</title>
      </Head>
      <PageContainer
        title="Audit Log"
        subTitle="Riwayat perubahan data perencanaan formasi"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/perencanaan/formasi">Formasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Audit Log</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <AuditLogList />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

AuditLogFormasi.getLayout = (page) => (
  <PerencanaanFormasiLayout active="/perencanaan/audit-log">{page}</PerencanaanFormasiLayout>
);

AuditLogFormasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AuditLogFormasi;

