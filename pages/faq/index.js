import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card } from "antd";
import Link from "next/link";
import { getFaqs } from "../../services";
import FAQMenu from "../../src/components/FAQMenu";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";
import Head from "next/head";

function Feeds() {
  const { data, isLoading } = useQuery(["faqs"], () => getFaqs());

  return (
    <>
      <Head>
        <title>FAQ & Knowledge Base</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title="F.A.Q dan Knowledge Base"
        subTitle="Pertanyaan yang sering diajukan"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>FAQ & Knowledge Base</Breadcrumb.Item>
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
  return <Layout>{page}</Layout>;
};

export default Feeds;
