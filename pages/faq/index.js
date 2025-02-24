import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card } from "antd";
import Link from "next/link";
import { getFaqs } from "../../services";
import FAQMenu from "../../src/components/FAQMenu";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";
import Head from "next/head";
import InformationLayout from "@/components/Information/InformationLayout";

function Feeds() {
  const { data, isLoading } = useQuery(["faqs"], () => getFaqs());

  return (
    <>
      <Head>
        <title>Rumah ASN - Pertanyaan Umum</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title="Pertanyaan Umum"
        subTitle="Pertanyaan Umum yang sering muncul"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">Beranda</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Pertanyaan Umum</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <Card style={{ minHeight: "80vh" }}>
          <FAQMenu data={data} />
        </Card>
      </PageContainer>
    </>
  );
}

Feeds.Auth = {
  action: "manage",
  subject: "Feeds",
};

Feeds.getLayout = function getLayout(page) {
  return (
    <Layout>
      <InformationLayout>{page}</InformationLayout>
    </Layout>
  );
};

export default Feeds;
