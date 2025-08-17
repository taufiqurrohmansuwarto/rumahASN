import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import Head from "next/head";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";

const AsnKnowledge = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/asn-connect/asn-knowledge/create")}
        >
          Buat Pengetahuan
        </Button>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledge.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledge.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-knowledge">{page}</Layout>;
};

export default AsnKnowledge;
