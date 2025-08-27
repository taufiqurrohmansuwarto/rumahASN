import { KnowledgeUserContentDetail } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getKnowledgeContent } from "@/services/knowledge-management.services";
import { useQuery } from "@tanstack/react-query";
import { FloatButton } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnKnowledgeMyKnowledgeDetail = () => {
  const router = useRouter();
  
  const { data, isLoading } = useQuery(
    ["my-knowledge-content-detail", router.query.id],
    () => getKnowledgeContent(router.query.id),
    {
      enabled: !!router.query.id,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  useScrollRestoration("myKnowledgeScrollPosition", true, isLoading);

  const gotoMyKnowledge = () => {
    router.push("/asn-connect/asn-knowledge/my-knowledge");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pengetahuan Saya</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <PageContainer
          loading={isLoading}
          title={data?.title || "Detail Pengetahuan Saya"}
          onBack={gotoMyKnowledge}
        >
          <FloatButton.BackTop />
          <KnowledgeUserContentDetail 
            data={data} 
            disableInteractions={data?.status !== 'published'}
            showOwnerActions={true}
          />
        </PageContainer>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeMyKnowledgeDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeMyKnowledgeDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default AsnKnowledgeMyKnowledgeDetail;
