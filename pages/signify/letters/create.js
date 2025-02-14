import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function SignifyLettersCreate() {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Signify - Membuat Surat</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Signify</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Signify - Membuat Surat"
        content="Membuat Surat"
      ></PageContainer>
    </>
  );
}

SignifyLettersCreate.getLayout = function getLayout(page) {
  return <Layout active="/signify/letters/create">{page}</Layout>;
};

SignifyLettersCreate.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SignifyLettersCreate;
