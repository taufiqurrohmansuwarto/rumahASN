import PageContainer from "@/components/PageContainer";
import DetailTicketPublish from "@/components/Ticket/DetailTicketPublish";
import { useRouter } from "next/router";
import AdminLayout from "../../../../src/components/AdminLayout";
import { Card } from "antd";

const SemuaTicket = () => {
  const router = useRouter();

  const { id } = router.query;

  const handleBack = () => {
    router.push("/admin/tickets-managements/semua");
  };

  return (
    <PageContainer onBack={handleBack} title="Tiket" subTitle="Detail">
      <Card>
        <DetailTicketPublish id={id} />
      </Card>
    </PageContainer>
  );
};

SemuaTicket.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

SemuaTicket.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default SemuaTicket;
