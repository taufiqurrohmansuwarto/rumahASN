import Layout from "../src/components/Layout";
import PageContainer from "../src/components/PageContainer";

function NotificationsPage() {
  return (
    <PageContainer title="Notification" content="Notifikasi tiket">
      <div>hello world</div>
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
