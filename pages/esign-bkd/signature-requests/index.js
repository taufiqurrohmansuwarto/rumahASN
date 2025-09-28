import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { SignatureRequestList } from "@/components/EsignBKD";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const SignatureRequestsPage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Permintaan Tanda Tangan E-Sign BKD</title>
      </Head>
      <PageContainer
        title="Permintaan Tanda Tangan"
        content="Kelola permintaan tanda tangan elektronik dan workflow approval"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd">Dashboard E-Sign BKD</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Permintaan Tanda Tangan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <SignatureRequestList />
      </PageContainer>
    </>
  );
};

SignatureRequestsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

SignatureRequestsPage.getLayout = (page) => {
  return (
    <EsignBKDLayout active="/esign-bkd/signature-requests">
      {page}
    </EsignBKDLayout>
  );
};

export default SignatureRequestsPage;
