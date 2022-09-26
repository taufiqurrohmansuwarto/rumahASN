import { Input } from "antd";
import Layout from "../src/components/Layout";
import PageContainer from "../src/components/PageContainer";

export default function Home() {
  return (
    <Layout>
      <PageContainer title="Hello world" subTitle="tes">
        <Input />
      </PageContainer>
    </Layout>
  );
}
