import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SiasnTab from "@/components/PemutakhiranData/Admin/SiasnTab";
import { dataUtamaMasterByNip } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Breadcrumb,
  Card,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const EmployeeBio = ({ data, loading }) => {
  return (
    <Skeleton loading={loading}>
      <Card>
        <Space direction="vertical">
          <Avatar shape="square" src={data?.foto} />
          <Tag color={data?.status === "Aktif" ? "green" : "red"}>
            {data?.status === "Aktif" ? "Pegawai Aktif" : "Pegawai Non Aktif"}
          </Tag>
          <Typography.Text>
            {data?.nama} - {data?.nip_baru}
          </Typography.Text>
          <Typography.Text>
            {data?.jabatan?.jabatan} -{" "}
            <Typography.Text type="secondary">
              {data?.skpd?.detail}
            </Typography.Text>
          </Typography.Text>
        </Space>
      </Card>
    </Skeleton>
  );
};

const IntegrasiSIASNByNIP = () => {
  const router = useRouter();
  const { nip } = router?.query;

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster-by-nip", nip],
    () => dataUtamaMasterByNip(nip)
  );

  return (
    <>
      <Head>
        <title>Data SIASN - SIMASTER {nip}</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        title="Data Integrasi SIASN"
        loading={isLoadingDataSimaster}
        subTitle={`Integrasi SIASN - SIMASTER ${nip}`}
        content={
          <EmployeeBio loading={isLoadingDataSimaster} data={dataSimaster} />
        }
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/integrasi/siasn">
                  <a>Integrasi</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Integrasi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <SiasnTab nip={nip} />
      </PageContainer>
    </>
  );
};

IntegrasiSIASNByNIP.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

IntegrasiSIASNByNIP.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default IntegrasiSIASNByNIP;
