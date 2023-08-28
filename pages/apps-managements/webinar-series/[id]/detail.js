import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailWebinar from "@/components/WebinarSeries/DetailWebinar";
import DetailWebinarSeriesAdmin from "@/components/WebinarSeries/DetailWebinarSeriesAdmin";
import { detailWebinar } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DetailWebinarSeries = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["webinar-series-admin-detail", router?.query?.id],
    () => detailWebinar(router?.query?.id),
    {}
  );

  const handleBack = () => router?.back();

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Webinar</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/webinar-series">
                  <a>Daftar Webinar Series Admin</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Webinar Series</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title={"Rumah ASN"}
        content="Detail Webinar Series Admin"
        loading={isLoading}
      >
        <Card>
          <DetailWebinar data={data} />
          <DetailWebinarSeriesAdmin />
        </Card>
      </PageContainer>
    </>
  );
};

DetailWebinarSeries.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

DetailWebinarSeries.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailWebinarSeries;
