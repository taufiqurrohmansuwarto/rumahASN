import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import RekonPegawaiDetail from "@/components/Rekon/RekonPegawaiDetail";
import { IconBadges } from "@tabler/icons-react";
import { Breadcrumb, Button, Grid } from "antd";
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
        extra={[
          <Link key="1" href={`/rekon/dashboard/kenaikan-pangkat`} passHref>
            <Button key="1" type="link">
              KP Instansi
            </Button>
          </Link>,
          <Link key="2" href={`/rekon/dashboard/pg`} passHref>
            <Button key="2" type="link">
              PG Instansi
            </Button>
          </Link>,
          <Link key="3" href={`/rekon/dashboard/pemberhentian`} passHref>
            <Button key="4" type="link">
              Pemberhentian Instansi
            </Button>
          </Link>,
          <Link key="4" href={`/rekon/dashboard/ip-asn`} passHref>
            <Button key="5" type="link">
              IP ASN Instansi
            </Button>
          </Link>,
        ]}
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
        <RekonPegawaiDetail />
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
