import { Card } from "antd";
import AgentLayout from "../../../src/components/AgentLayout";
import PageContainer from "../../../src/components/PageContainer";

const Tickets = () => {
  return (
    <PageContainer title="Ticket" subTitle="Agent">
      <Card>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Id quas
          sapiente, sint sunt asperiores facilis voluptatum? Quos, ipsum
          consequatur rerum delectus porro labore at ratione iusto ex excepturi,
          laudantium veniam?
        </p>
      </Card>
    </PageContainer>
  );
};

Tickets.getLayout = (page) => {
  return <AgentLayout>{page}</AgentLayout>;
};

Tickets.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default Tickets;
