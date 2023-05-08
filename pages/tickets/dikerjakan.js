import Head from "next/head";
import CustomersTickets from "../../src/components/CustomersTickets";
import Layout from "../../src/components/Layout";

const Tickets = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Status Dikerjakan</title>
      </Head>
      <CustomersTickets status="DIKERJAKAN" title="Status Dikerjakan" />;
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
