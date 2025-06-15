import Head from "next/head";
import CustomersTickets from "../../src/components/CustomersTickets";
import Layout from "../../src/components/Layout";
import { Grid } from "@mantine/core";
import PageContainer from "@/components/PageContainer";
import CustomerTicketsLayout from "@/components/CustomerTicketsLayout";

const Tickets = () => {
  return (
    <>
      <PageContainer title="Status Dikerjakan" content="Status Dikerjakan">
        <Head>
          <title>Rumah ASN - Status Dikerjakan</title>
        </Head>
        <Grid gutter={16}>
          <Grid.Col span={12}>
            <CustomerTicketsLayout activeKey="dikerjakan">
              <CustomersTickets status="DIKERJAKAN" title="Status Dikerjakan" />
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
