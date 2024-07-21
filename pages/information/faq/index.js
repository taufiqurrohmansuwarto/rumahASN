import FAQMenu from "@/components/FAQMenu";
import InformationLayout from "@/components/Information/InformationLayout";
import Layout from "@/components/Layout";
import { getFaqs } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import Head from "next/head";

function FAQPage() {
  const { data, isLoading } = useQuery(["faqs"], () => getFaqs());

  return (
    <>
      <Head>
        <title>Rumah ASN - Informasi - Pertanyaan Umum</title>
      </Head>
      <InformationLayout
        title="Informasi Rumah ASN"
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
  return <Layout active="/information/faq">{page}</Layout>;
};

export default FAQPage;
