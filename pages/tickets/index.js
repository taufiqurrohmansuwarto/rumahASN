import { useQuery } from "@tanstack/react-query";
import { Button, Table } from "antd";
import { useRouter } from "next/router";
import { getAllTickets } from "../../services/users.services";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

const Tickets = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(["user-tickets"], () => getAllTickets());

  const columns = [{}];

  const createTicket = () => {
    router.push("/tickets/create");
  };

  return (
    <PageContainer title="Tiket" subTitle="Daftar Tiket">
      <Button onClick={createTicket}>Buat</Button>
      <Table
        rowKey={(row) => row?.id}
        loading={isLoading}
        dataSource={data?.results}
      />
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
