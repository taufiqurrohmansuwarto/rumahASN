import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailTicketPublish from "@/components/Ticket/DetailTicketPublish";
import { Card } from "antd";
import { useRouter } from "next/router";

const DetailTicketCustomers = () => {
  const router = useRouter();
  return (
    <PageContainer>
      <Card>
        <DetailTicketPublish id={router?.query?.id} />
      </Card>
    </PageContainer>
  );
};

// add layout
DetailTicketCustomers.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

DetailTicketCustomers.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DetailTicketCustomers;
