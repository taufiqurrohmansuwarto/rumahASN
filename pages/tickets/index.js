import { Button } from "antd";
import { useRouter } from "next/router";
import Layout from "../../src/components/Layout";

const Tickets = () => {
  const router = useRouter();

  const createTicket = () => {
    router.push("/tickets/create");
  };

  return (
    <div>
      <h1>ticket</h1>
      <Button onClick={createTicket}>Create</Button>
      <p>list tikect/ada fitlernya</p>
    </div>
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
