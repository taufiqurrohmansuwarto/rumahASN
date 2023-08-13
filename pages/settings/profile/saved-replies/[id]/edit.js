import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Col, PageHeader, Row } from "antd";
import EditSavedReplies from "@/components/SavedReplies/EditSavedReplies";
import { useRouter } from "next/router";
import { detailSavedReplies, getSavedReplies } from "@/services/index";
import Link from "next/link";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";

const Edit = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["saved-replies", router?.query?.id],
    () => detailSavedReplies(router?.query?.id)
  );

  const { data: dataSavedReplies, isLoading: isLoadingSavedReplies } = useQuery(
    ["saved-replies"],
    () => getSavedReplies(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <PageHeader
      title="Edit"
      subTitle="Template Balasan"
      onBack={() => router?.back()}
    >
      <Row>
        <Col md={14} xs={24}>
          <EditSavedReplies
            id={router?.query?.id}
            initialValues={data}
            loading={isLoading || isLoadingSavedReplies}
            savedReplies={dataSavedReplies}
          />
        </Col>
      </Row>
    </PageHeader>
  );
};

Edit.getLayout = function getLayout(page) {
  return (
    <Layout>
      <ProfileLayout tabActiveKey="saved-replies">{page}</ProfileLayout>
    </Layout>
  );
};

Edit.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Edit;
