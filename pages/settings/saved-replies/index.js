import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CreateSavedReplies from "@/components/SavedReplies/CreateSavedReplies";
import ListSavedReplies from "@/components/SavedReplies/ListSavedReplies";
import { Grid, Space, Stack } from "@mantine/core";
import { Alert, Card, Divider } from "antd";

const SavedReplies = () => {
  return (
    <PageContainer
      title="Balasan Tersimpan"
      // content="Balasan yang disimpan adalah potongan teks yang dapat digunakan kembali yang dapat Anda gunakan di seluruh bidang komentar Helpdesk. Balasan yang disimpan dapat menghemat waktu Anda jika Anda sering mengetik tanggapan yang serupa."
    >
      <Grid>
        <Grid.Col span={8}>
          <Stack>
            <Alert
              showIcon
              message="Balasan Tersimpan"
              description="
            Balasan yang disimpan adalah potongan teks yang dapat digunakan kembali yang dapat Anda gunakan di seluruh bidang komentar Helpdesk. Balasan yang disimpan dapat menghemat waktu Anda jika Anda sering mengetik tanggapan yang serupa."
              type="info"
            />
            <ListSavedReplies />
            <Divider orientation="left">Tambahkan Balasan Tersimpan</Divider>
            <CreateSavedReplies />
          </Stack>
        </Grid.Col>
      </Grid>
    </PageContainer>
  );
};

SavedReplies.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

SavedReplies.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SavedReplies;
