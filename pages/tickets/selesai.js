import CustomerTicketsLayout from "@/components/CustomerTicketsLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "@mantine/core";
import Head from "next/head";
import CustomersTickets from "../../src/components/CustomersTickets";
import Layout from "../../src/components/Layout";

const Tickets = () => {
  return (
    <>
      <PageContainer title="Status Selesai" content="Status Selesai">
        <Head>
          <title>Rumah ASN - Status Selesai</title>
        </Head>
        <Grid gutter={16}>
          <Grid.Col span={12}>
            <CustomerTicketsLayout activeKey="selesai">
              <CustomersTickets status="SELESAI" title="Status Selesai" />
            </CustomerTicketsLayout>
          </Grid.Col>
        </Grid>
      </PageContainer>
    </>
  );
};

// add layout
Tickets.getLayout = function getLayout(page) {
  return <Layout active="/tickets/semua">{page}</Layout>;
};

Tickets.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Tickets;
