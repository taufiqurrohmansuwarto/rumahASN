import { KnowledgeUserContentDetail } from "@/components/KnowledgeManagements";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getKnowledgeContent } from "@/services/knowledge-management.services";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";

const AsnKnowledgeDetail = () => {
  useScrollRestoration();
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["knowledge-content-detail", router.query.id],
    () => getKnowledgeContent(router.query.id),
    {
      enabled: !!router.query.id,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const gotoAsnKnowledge = () => {
    router.push("/asn-connect/asn-knowledge");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pengetahuan</title>
      </Head>
      <LayoutASNConnect active="asn-knowledge">
        <PageContainer
          loading={isLoading}
          title={data?.title || "Detail Pengetahuan"}
          onBack={gotoAsnKnowledge}
        >
          <KnowledgeUserContentDetail data={data} />
        </PageContainer>
      </LayoutASNConnect>
    </>
  );
};

AsnKnowledgeDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnKnowledgeDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-knowledge">{page}</Layout>;
};

export default AsnKnowledgeDetail;
