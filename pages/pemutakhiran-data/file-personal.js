import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareFile from "@/components/PemutakhiranData/CompareFile";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const FilePersonalPage = () => {
  const router = useRouter();

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - File Personal</title>
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
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/pemutakhiran-data/komparasi">Integrasi MyASN</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>File Personal</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="File Personal"
        content="Daftar dokumen dan file personal pegawai"
      >
        <CompareFile />
      </PageContainer>
    </>
  );
};

FilePersonalPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

FilePersonalPage.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/komparasi">{page}</Layout>;
};

export default FilePersonalPage;
