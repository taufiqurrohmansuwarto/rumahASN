import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card } from "antd";
import Link from "next/link";
import { getFaqs } from "@/services/index";
import FAQMenu from "@/components/FAQMenu";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import InformationLayout from "@/components/Information/InformationLayout";

function FAQPage() {
  const { data, isLoading } = useQuery(["faqs"], () => getFaqs());

  return (
    <>
      <Head>
        <title>Rumah ASN - Pertanyaan Umum</title>
      </Head>
      <InformationLayout
        title="Pertanyaan Umum"
        content="Pertanyaan yang sering diajukan"
      >
        <Card style={{ minHeight: "80vh" }}>
          <FAQMenu data={data} />
        </Card>
      </InformationLayout>
    </>
  );
}

FAQPage.Auth = {
  action: "manage",
  subject: "Feeds",
};

FAQPage.getLayout = function getLayout(page) {
  return <Layout active="/information">{page}</Layout>;
};

export default FAQPage;
