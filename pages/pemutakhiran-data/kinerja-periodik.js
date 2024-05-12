import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataCltn from "@/components/PemutakhiranData/CompareDataCltn";
import CompareKinerjaPeriodik from "@/components/PemutakhiranData/CompareKinerjaPeriodik";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Card, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const KinerjaPeriodik = () => {
  const router = useRouter();
  const handleBack = () => router.push("/pemutakhiran-data/komparasi");
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data CLTN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        extra={[<CustomSelectMenu key="menu" />]}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">
                  <a>Peremajaan Data</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Riwayat Kinerja Periodik</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Kinerja Periodik"
        content="Riwayat Kinerja Periodik"
      >
        <Card>
          <CompareKinerjaPeriodik />
        </Card>
      </PageContainer>
    </>
  );
};

KinerjaPeriodik.Auth = {
  action: "manage",
  subject: "Tickets",
};

KinerjaPeriodik.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default KinerjaPeriodik;
