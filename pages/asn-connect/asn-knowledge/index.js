import Layout from "@/components/Layout";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import Head from "next/head";
import { useRouter } from "next/navigation";

const AsnKnowledge = () => {
  const router = useRouter();
  useScrollRestoration();
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
