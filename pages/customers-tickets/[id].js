import Layout from "@/components/Layout";
import DetailTicketPublish from "@/components/Ticket/DetailTicketPublish";
import { useRouter } from "next/router";

const DetailTicketCustomers = () => {
  const router = useRouter();
  return <DetailTicketPublish id={router?.query?.id} />;
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
