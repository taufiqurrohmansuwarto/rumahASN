import Head from "next/head";
import CustomersTickets from "../../src/components/CustomersTickets";
import Layout from "../../src/components/Layout";

const Tickets = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Status Selesai</title>
      </Head>
      <CustomersTickets status="SELESAI" title="Status Selesai" />;
    </>
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
