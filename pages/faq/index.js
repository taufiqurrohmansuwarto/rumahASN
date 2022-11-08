import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import { getFaqs } from "../../services";
import FAQMenu from "../../src/components/FAQMenu";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

function Feeds() {
  const { data, isLoading } = useQuery(["faqs"], () => getFaqs());

  return (
    <PageContainer
      loading={isLoading}
      title="F.A.Q"
      subTitle="Frequently Ask Question"
    >
      <Card
        title="Pertanyaan yang sering diajukan"
        style={{ minHeight: "80vh" }}
      >
        <FAQMenu data={data} />
      </Card>
    </PageContainer>
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
