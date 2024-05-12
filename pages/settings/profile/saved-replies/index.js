import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import CreateSavedReplies from "@/components/SavedReplies/CreateSavedReplies";
import ListSavedReplies from "@/components/SavedReplies/ListSavedReplies";
import { Grid, Stack } from "@mantine/core";
import { Divider, Grid as AntdGrid } from "antd";
import Head from "next/head";

const SavedReplies = () => {
  const breakPoint = AntdGrid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Konfigurasi - Template Balasan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Template Balasan"
      >
        <Grid>
          <Grid.Col md={8} xs={12}>
            <Stack>
              <ListSavedReplies />
              <Divider orientation="left">Tambahkan Template Balasan</Divider>
              <CreateSavedReplies />
            </Stack>
          </Grid.Col>
        </Grid>
      </PageContainer>
    </>
  );
};

SavedReplies.getLayout = function getLayout(page) {
  return (
    <Layout>
      <ProfileLayout tabActiveKey="saved-replies">{page}</ProfileLayout>
    </Layout>
  );
};

SavedReplies.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SavedReplies;
