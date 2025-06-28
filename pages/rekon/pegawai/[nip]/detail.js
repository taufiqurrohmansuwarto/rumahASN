import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiDetail from "@/components/Rekon/RekonPegawaiDetail";
import RekonPegawaiLayoutDetail from "@/components/Rekon/RekonPegawaiLayoutDetail";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const Pegawai = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Daftar Pegawai</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Informasi Pegawai"
        content="Detail informasi pegawai"
        onBack={() => router.back()}
        breadcrumbRender={() => {
          return (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/rekon/dashboard">Dashboard</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/rekon/pegawai">Daftar Pegawai</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Pegawai</Breadcrumb.Item>
            </Breadcrumb>
          );
        }}
      >
        <RekonPegawaiLayoutDetail></RekonPegawaiLayoutDetail>
      </PageContainer>
    </>
  );
};

Pegawai.getLayout = (page) => {
  return <RekonLayout active="/rekon/pegawai">{page}</RekonLayout>;
};

Pegawai.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Pegawai;
