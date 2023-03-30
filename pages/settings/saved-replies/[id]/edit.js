import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Col, Row } from "antd";
import EditSavedReplies from "@/components/SavedReplies/EditSavedReplies";
import { useRouter } from "next/router";
import { detailSavedReplies, getSavedReplies } from "@/services/index";
import Link from "next/link";

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
    <PageContainer
      title="Balasan Tersimpan"
      subTitle="Edit"
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/feeds">
              <a>Beranda</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/settings/saved-replies">
              <a>Balasan Tersimpan</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Edit</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      <Card>
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
      </Card>
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
