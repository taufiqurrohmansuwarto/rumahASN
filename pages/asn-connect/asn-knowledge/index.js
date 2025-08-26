import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import KnowledgeUserContents from "@/components/KnowledgeManagements/lists/KnowledgeUserContents";
import { KnowledgeNavigationSegmented } from "@/components/KnowledgeManagements";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import Head from "next/head";
import { useRouter } from "next/navigation";

const AsnKnowledge = () => {
  const router = useRouter();

  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Connect - Manajemen Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <Flex justify="space-between" align="center" style={{ marginBottom: "16px" }}>
          <KnowledgeNavigationSegmented currentPath="/asn-connect/asn-knowledge" />
          
          <Button
            shape="round"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/asn-connect/asn-knowledge/create")}
          >
            Buat Pengetahuan
          </Button>
        </Flex>
        
        <KnowledgeUserContents />
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledge.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledge.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledge;
