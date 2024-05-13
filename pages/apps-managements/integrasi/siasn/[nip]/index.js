import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import EmployeeDetail from "@/components/PemutakhiranData/Admin/EmployeeDetail";
import SiasnTab from "@/components/PemutakhiranData/Admin/SiasnTab";
import { Breadcrumb, Card, Flex, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function DetailNIP() {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();
  const handleBack = () => {
    router.back();
  };

  const { nip } = router.query;
  return (
    <>
      <Head>
        <title>Integrasi SIASN - Detail Informasi</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        subTitle="Pegawai"
        title="Detail"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Forum Kepegawaian</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/integrasi/siasn">
                  <a>Integrasi SIASN</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Informasi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Flex vertical gap={8}>
          <EmployeeDetail nip={nip} />
          <Card>
            <SiasnTab nip={nip} />
          </Card>
        </Flex>
      </PageContainer>
    </>
  );
}

DetailNIP.getLayout = function (page) {
  return <Layout active="/apps-managements/integrasi/siasn">{page}</Layout>;
};

DetailNIP.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailNIP;
