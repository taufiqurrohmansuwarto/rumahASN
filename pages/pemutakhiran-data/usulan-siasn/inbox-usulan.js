import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import RiwayatUsulanLayout from "@/components/RiwayatUsulan/RiwayatUsulanLayout";
import RwInboxUsulan from "@/components/RiwayatUsulan/RwInboxUsulan";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const InboxUsulan = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data SKP</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/pemutakhiran-data/komparasi")}
        title="Usulan SIASN"
        subTitle="Inbox Usulan"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">Integrasi MyASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Inbox Usulan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <RiwayatUsulanLayout
          title="Usulan SIASN"
          content="Riwayat Usulan SIASN Inbox Usulan"
          active="inbox-usulan"
          breadcrumbTitle="Inbox Usulan"
        >
          <RwInboxUsulan />
        </RiwayatUsulanLayout>
      </PageContainer>
    </>
  );
};

InboxUsulan.Auth = {
  action: "manage",
  subject: "Tickets",
};

InboxUsulan.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default InboxUsulan;
