import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CreateSavedReplies from "@/components/SavedReplies/CreateSavedReplies";
import ListSavedReplies from "@/components/SavedReplies/ListSavedReplies";
import { Grid, Space, Stack } from "@mantine/core";
import { Alert, Breadcrumb, Card, Divider } from "antd";
import Link from "next/link";

const SavedReplies = () => {
  return (
    <PageContainer
      title="Konfigurasi"
      subTitle="Balasan Tersimpan"
      breadcrumbRender={() => (
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/feeds">
              <a>Beranda</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Balasan Tersimpan</Breadcrumb.Item>
        </Breadcrumb>
      )}
      // content="Balasan yang disimpan adalah potongan teks yang dapat digunakan kembali yang dapat Anda gunakan di seluruh bidang komentar Helpdesk. Balasan yang disimpan dapat menghemat waktu Anda jika Anda sering mengetik tanggapan yang serupa."
    >
      <Grid>
        <Grid.Col md={8} xs={12}>
          <Stack>
            <Alert
              showIcon
              message="Balasan Tersimpan"
              description="Balasan yang disimpan adalah teks yang bisa dipakai lagi dan berguna untuk dijadikan tanggapan di berbagai bidang Helpdesk. Menggunakan balasan yang disimpan bisa membantu Anda menghemat waktu jika sering mengetik respons yang sama."
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
