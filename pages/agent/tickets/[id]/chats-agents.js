import { Card } from "antd";
import { useRouter } from "next/router";
import AgentLayout from "../../../../src/components/AgentLayout";
import PageContainer from "../../../../src/components/PageContainer";

const TicketsDetails = () => {
  const router = useRouter();
  return (
    <PageContainer
      title="Ticket"
      subTitle="Details"
      onBack={() => router.back()}
    >
      <Card>
        <p>{JSON.stringify(router)}</p>
      </Card>
    </PageContainer>
  );
};

TicketsDetails.getLayout = (page) => {
  return <AgentLayout active="/agent/tickets">{page}</AgentLayout>;
};

TicketsDetails.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default TicketsDetails;
