import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import BuatUsulan from "@/components/Usulan/Submitter/BuatUsulan";
import DaftarUsulan from "@/components/Usulan/Submitter/DaftarUsulan";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";

function AllSubmission() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Daftar Usulan Aplikasi Rumah ASN</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Usulan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Usulan"
        content="Daftar Semua Usulan"
      >
        <Card>
          <BuatUsulan />
          <DaftarUsulan />
        </Card>
      </PageContainer>
    </>
  );
}

AllSubmission.getLayout = function getLayout(page) {
  return <Layout active="/submissions/all">{page}</Layout>;
};

AllSubmission.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AllSubmission;
