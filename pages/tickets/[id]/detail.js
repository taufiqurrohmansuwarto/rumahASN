import PageContainer from "@/components/PageContainer";
import DetailTicketPublish from "@/components/Ticket/DetailTicketPublish";
import { useRouter } from "next/router";
import Layout from "../../../src/components/Layout";
import { Card } from "antd";

const DetailTicket = () => {
  const router = useRouter();

  const { id } = router.query;
  const goBack = () => {
    router.push("/tickets/semua");
  };

  return (
    <PageContainer onBack={goBack} subTitle="Tiket" title="Detail">
      <Card>
        <DetailTicketPublish id={id} />
      </Card>
    </PageContainer>
  );
};

DetailTicket.Auth = {
  action: "manage",
  subject: "Tickets",
};

DetailTicket.getLayout = function (page) {
  return <Layout active={"/tickets"}>{page}</Layout>;
};

export default DetailTicket;
