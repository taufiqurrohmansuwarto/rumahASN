import Layout from "@/components/Layout";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import CreateSavedReplies from "@/components/SavedReplies/CreateSavedReplies";
import ListSavedReplies from "@/components/SavedReplies/ListSavedReplies";
import { Grid, Stack } from "@mantine/core";
import { Alert, Divider, PageHeader } from "antd";
import Head from "next/head";

const SavedReplies = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Konfigurasi - Template Balasan</title>
      </Head>
      <PageHeader title="Template Balasan">
        <Grid>
          <Grid.Col md={8} xs={12}>
            <Stack>
              {/* <Alert
              showIcon
              message="Template Balasan"
              description="Template Balasan adalah teks siap pakai yang sudah dibuat sebelumnya. Penggunaannya menghemat waktu saat membalas atau membuat komentar."
              type="info"
            /> */}
              <ListSavedReplies />
              <Divider orientation="left">Tambahkan Template Balasan</Divider>
              <CreateSavedReplies />
            </Stack>
          </Grid.Col>
        </Grid>
      </PageHeader>
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
