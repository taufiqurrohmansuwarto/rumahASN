import Layout from "@/components/Layout";
import ListNotifications from "@/components/ListNotifications";
import NotificationLayout from "@/components/Notification/NotificationLayout";
import PageContainer from "@/components/PageContainer";
import { clearChatsNotificatoins } from "@/services/index";
import { ClearOutlined } from "@ant-design/icons";
import { Grid, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  FloatButton,
  Grid as GridAntd,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";

function ForumKepegawaianNotification() {
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

  const breakPoint = GridAntd.useBreakpoint();

  const handleClearNotif = () => clearNotif();

  return (
    <>
      <Head>
        <title>Rumah ASN - Notifikasi</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Notifikasi Pertanyaan</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Notifikasi"
        content="Forum Kepegawaian"
      >
        <NotificationLayout active="forum-kepegawaian">
          <Grid align="center" justify="center">
            <Grid.Col md={8} sm={12}>
              <Stack>
                <Button type="primary" onClick={handleClearNotif}>
                  Hapus Semua Notifikasi
                </Button>
                <ListNotifications />
              </Stack>
            </Grid.Col>
          </Grid>
        </NotificationLayout>
      </PageContainer>
    </>
  );
}

ForumKepegawaianNotification.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ForumKepegawaianNotification.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ForumKepegawaianNotification;
