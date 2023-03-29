import { Grid, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, message } from "antd";
import { clearChatsNotificatoins, listNotifications } from "../services";
import Layout from "../src/components/Layout";
import ListNotifications from "../src/components/ListNotifications";
import PageContainer from "../src/components/PageContainer";

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
    <PageContainer title="Notification" content="Notifikasi tiket">
      <Grid align="center" justify="center">
        <Grid.Col md={8} sm={12}>
          <Stack>
            <Button onClick={handleClearNotif}>Hapus Notifikasi</Button>
            <ListNotifications />
          </Stack>
        </Grid.Col>
      </Grid>
    </PageContainer>
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
