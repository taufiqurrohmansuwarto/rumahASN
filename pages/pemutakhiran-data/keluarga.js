import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import CompareDataKeluarga from "@/components/PemutakhiranData/CompareDataKeluarga";
import CustomSelectMenu from "@/components/PemutakhiranData/CustomSelectMenu";
import { dataRiwayatKeluargaSIASN } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const RiwayatKeluarga = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["data-siasn-rw-keluarga"],
    () => dataRiwayatKeluargaSIASN(),
    {}
  );

  const handleBack = () => router.push("/pemutakhiran-data/komparasi");

  return (
    <>
      <Head>
        <title>Rumah ASN - Peremajaan SIASN - Data Keluarga</title>
      </Head>
      <PageContainer
        loading={isLoading}
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
              <Breadcrumb.Item>Data Riwayat Keluarga</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        onBack={handleBack}
        title="Riwayat Keluarga"
        content="Komparasi Data Keluarga SIASN dan SIMASTER"
      >
        <CompareDataKeluarga data={data} />
      </PageContainer>
    </>
  );
};

RiwayatKeluarga.Auth = {
  action: "manage",
  subject: "Tickets",
};

RiwayatKeluarga.getLayout = (page) => {
  return <Layout active="/pemutakhiran-data/data-utama">{page}</Layout>;
};

export default RiwayatKeluarga;
