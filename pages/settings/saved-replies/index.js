import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CreateSavedReplies from "@/components/SavedReplies/CreateSavedReplies";
import ListSavedReplies from "@/components/SavedReplies/ListSavedReplies";
import { Grid, Space, Stack } from "@mantine/core";
import { Alert, Breadcrumb, Card, Divider } from "antd";
import Head from "next/head";
import Link from "next/link";

const SavedReplies = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Konfigurasi - Template Balasan</title>
      </Head>
      <PageContainer
        title="Konfigurasi"
        subTitle="Template Balasan"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Template Balasan</Breadcrumb.Item>
          </Breadcrumb>
        )}
        // content="Balasan yang disimpan adalah potongan teks yang dapat digunakan kembali yang dapat Anda gunakan di seluruh bidang komentar Helpdesk. Balasan yang disimpan dapat menghemat waktu Anda jika Anda sering mengetik tanggapan yang serupa."
      >
        <Grid>
          <Grid.Col md={8} xs={12}>
            <Stack>
              <Alert
                showIcon
                message="Template Balasan"
                description="Template Balasan adalah teks siap pakai yang sudah dibuat sebelumnya. Penggunaannya menghemat waktu saat membalas atau membuat komentar."
                type="info"
              />
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
  return <Layout>{page}</Layout>;
};

SavedReplies.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SavedReplies;
