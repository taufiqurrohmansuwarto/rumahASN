import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row } from "antd";
import EditSavedReplies from "@/components/SavedReplies/EditSavedReplies";
import { useRouter } from "next/router";
import { detailSavedReplies, getSavedReplies } from "@/services/index";

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
    <PageContainer title="Edit Balasan Tersimpan">
      <Row justify="center">
        <Col span={14}>
          <Card>
            <EditSavedReplies
              id={router?.query?.id}
              initialValues={data}
              loading={isLoading || isLoadingSavedReplies}
              savedReplies={dataSavedReplies}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

Edit.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Edit.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Edit;
