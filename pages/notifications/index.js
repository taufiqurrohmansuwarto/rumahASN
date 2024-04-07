import Layout from "@/components/Layout";
import ListNotifications from "@/components/ListNotifications";
import PageContainer from "@/components/PageContainer";
import { DeleteOutlined } from "@ant-design/icons";
import { Grid, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Breadcrumb, Button, message } from "antd";
import Head from "next/head";
import Link from "next/link";
import { clearChatsNotificatoins } from "@/services/index";

function NotificationsPage() {
  const queryClient = useQueryClient();
  const { mutate: clearNotif, isLoading: loadingClearChats } = useMutation(
    (data) => clearChatsNotificatoins(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus notifikasi");
        queryClient.invalidateQueries("notifications-total");
      },
      onError: () => message.error("Gagal menghapus notifikasi"),
      onSettled: () => queryClient.invalidateQueries("notifications-total"),
    }
  );

  const handleClearNotif = () => clearNotif();

  return (
    <>
      <Head>
        <title>Rumah ASN - Notifikasi</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi Pertanyaan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi"
        content="Notifikasi Pertanyaan"
      >
        <Grid align="center" justify="center">
          <Grid.Col md={8} sm={12}>
            <Stack>
              <Button
                type="primary"
                icon={<DeleteOutlined />}
                onClick={handleClearNotif}
              >
                Hapus Notifikasi
              </Button>
              <ListNotifications />
            </Stack>
          </Grid.Col>
        </Grid>
      </PageContainer>
    </>
  );
}

NotificationsPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

NotificationsPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default NotificationsPage;
