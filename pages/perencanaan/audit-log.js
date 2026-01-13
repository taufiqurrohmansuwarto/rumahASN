import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";

const AuditLogFormasi = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Audit Log Formasi</title>
      </Head>
      <PageContainer
        title="Audit Log Formasi"
        subTitle="Daftar audit log formasi perencanaan"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/perencanaan/audit-log">Audit Log Formasi</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
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

