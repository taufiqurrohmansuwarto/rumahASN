import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function SignifyLetters() {
  const router = useRouter();

  const handleBack = () => router.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Signify - Surat</title>
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
        title="Signify - Surat"
        content="Surat"
      ></PageContainer>
    </>
  );
}

SignifyLetters.getLayout = function getLayout(page) {
  return <Layout active="/signify/letters">{page}</Layout>;
};

SignifyLetters.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SignifyLetters;
