import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailTicketPublish from "@/components/Ticket/DetailTicketPublish";
import { Breadcrumb, Card, Grid } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const DetailTicketCustomers = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  return (
    <PageContainer
      childrenContentStyle={{
        padding: breakPoint.xs ? 0 : null,
      }}
      header={{
        breadcrumbRender: () => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail Pertanyaan</Breadcrumb.Item>
          </Breadcrumb>
        ),
      }}
    >
      <Card>
        <DetailTicketPublish id={router?.query?.id} />
      </Card>
    </PageContainer>
  );
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
