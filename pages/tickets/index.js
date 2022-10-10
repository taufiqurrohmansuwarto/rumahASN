import { Button } from "antd";
import { useRouter } from "next/router";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

const Tickets = () => {
  const router = useRouter();

  const createTicket = () => {
    router.push("/tickets/create");
  };

  return (
    <PageContainer title="Tiket" subTitle="Daftar Tiket">
      <Button onClick={createTicket}>Buat</Button>
    </PageContainer>
  );
};

// add layout
Tickets.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Tickets.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Tickets;
