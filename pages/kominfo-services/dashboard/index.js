import PageContainer from "@/components/PageContainer";
import KominfoServicesLayout from "@/components/KominfoServices/KominfoServicesLayout";
import FlushAdmin from "@/components/KominfoServices/FlushAdmin";
import Head from "next/head";
import { Breadcrumb } from "antd";
import Link from "next/link";

const KominfoServicesDashboardPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Layanan Kominfo Jatim</title>
      </Head>
      <PageContainer
        title="Dashboard Layanan Kominfo"
        content="Portal layanan email dan tanda tangan elektronik dari Kominfo Jawa Timur"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Dashboard Layanan Kominfo</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <div>
          <FlushAdmin />
        </div>
      </PageContainer>
    </>
  );
};

KominfoServicesDashboardPage.getLayout = function getLayout(page) {
  return (
    <KominfoServicesLayout active="/kominfo-services/dashboard">
      {page}
    </KominfoServicesLayout>
  );
};

KominfoServicesDashboardPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KominfoServicesDashboardPage;
