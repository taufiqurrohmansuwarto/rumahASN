import PageContainer from "@/components/PageContainer";
import DetailTicketPublish from "@/components/Ticket/DetailTicketPublish";
import { Card } from "antd";
import { useRouter } from "next/router";
import AgentLayout from "../../../../src/components/AgentLayout";

const TicketsDetail = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push("/agent/tickets/semua");
  };

  return (
    <PageContainer onBack={handleBack} subTitle="Tiket" title="Detail">
      <Card>
        <DetailTicketPublish id={router?.query?.id} />
      </Card>
    </PageContainer>
  );
};

TicketsDetail.getLayout = (page) => {
  return <AgentLayout active="/agent/tickets">{page}</AgentLayout>;
};

TicketsDetail.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default TicketsDetail;
