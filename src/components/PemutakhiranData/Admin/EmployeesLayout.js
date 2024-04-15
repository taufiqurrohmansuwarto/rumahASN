import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import PageContainer from "@/components/PageContainer";
import { dataUtamaMasterByNip } from "@/services/master.services";
import { dataUtamSIASNByNip, getPnsAllByNip } from "@/services/siasn-services";
import { getUmur } from "@/utils/client-utils";
import { Alert } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Breadcrumb,
  Col,
  Descriptions,
  Flex,
  Grid,
  Layout,
  Row,
  Space,
  Tag,
  Tooltip,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const EmployeeUnor = ({ data }) => {
  return (
    <Alert title="Informasi ASN" color="yellow">
      <Row>
        <Col span={24}>
          {data?.nama} ({data?.nip_baru}) - {data?.unor_nm}
        </Col>
        <Col span={24}>{data?.jabatan_nama}</Col>
      </Row>
    </Alert>
  );
};

const EmployeeDescriptionMaster = ({ data, loading }) => {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Descriptions
        size="small"
        column={1}
        layout={breakPoint?.xs ? "vertical" : "horizontal"}
      >
        <Descriptions.Item label="Usia">
          {getUmur(data?.tgl_lahir)} Tahun
        </Descriptions.Item>
        <Descriptions.Item label="Jabatan">
          {data?.jabatan?.jabatan}
        </Descriptions.Item>
        <Descriptions.Item label="Golongan">
          {data?.pangkat?.golongan}
        </Descriptions.Item>
        <Descriptions.Item label="Jenjang Pendidikan">
          {data?.pendidikan?.jenjang} {data?.pendidikan?.prodi}{" "}
          {data?.pendidikan?.nama_sekolah}
        </Descriptions.Item>
        <Descriptions.Item label="Perangkat Daerah">
          {data?.skpd?.detail}
        </Descriptions.Item>
      </Descriptions>
    </>
  );
};

const EmployeeContent = ({ data, loading }) => {
  return (
    <Row gutter={[8, 16]}>
      <Col sm={24} md={24}>
        <Flex gap={20} justify="space-between">
          <div>
            <Avatar size={110} shape="square" src={data?.master?.foto} />
          </div>
          <EmployeeDescriptionMaster loading={loading} data={data?.master} />
        </Flex>
      </Col>
    </Row>
  );
};

function EmployeesLayout({ children, active }) {
  const router = useRouter();
  const { nip } = router.query;

  const handleTabChange = (key) => {
    router.push(`/apps-managements/integrasi/siasn/${nip}/${key}`);
  };

  const { data: dataSimaster, isLoading: isLoadingSimaster } = useQuery(
    ["data-utama-simaster-by-nip", nip],
    () => dataUtamaMasterByNip(nip)
  );

  const { data: dataPnsAll, isLoading: isLoadingDataPns } = useQuery(
    ["data-pns-all", nip],
    () => getPnsAllByNip(nip)
  );

  const { data: siasn, isLoading: loadingSiasn } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip)
  );

  return (
    <>
      <PageContainer
        // loading={isLoadingDataSimaster || isLoadingDataPns || loadingSiasn}
        token={{
          // paddingInlinePageContainerContent: 0,
          paddingBlockPageContainerContent: 0,
        }}
        style={{
          backgroundColor: "white",
        }}
        onTabChange={handleTabChange}
        tabActiveKey={active || "data-utama"}
        tags={[
          <Tooltip key="test" title="Status Kepegawaian SIMASTER">
            <Tag
              key="test"
              color={dataSimaster?.status === "Aktif" ? "green" : "red"}
            >
              {dataSimaster?.status}
            </Tag>
          </Tooltip>,
          <Tooltip key="hello" title="Status Kepegawaian SIASN">
            <Tag key="hello" color="yellow">
              {siasn?.statusPegawai} {siasn?.kedudukanPnsNama}
            </Tag>
          </Tooltip>,
          <IPAsnByNip nip={nip} tahun={2023} key="ipasn" />,
        ]}
        tabList={[
          {
            key: "data-utama",
            label: "Data Utama",
            style: {
              padding: 0,
            },
          },
          {
            key: "profesional",
            label: "Profesional",
            style: { padding: 0 },
          },
          {
            key: "pengembangan-karir-dan-kompetensi",
            label: "Pengembangan Karir & Kompetensi",
            style: {
              padding: 0,
            },
          },
          {
            key: "prestasi-dan-disiplin",
            label: "Prestasi & Disiplin",
            style: {
              padding: 0,
            },
          },
        ]}
        tabProps={{
          tabBarStyle: {
            padding: 0,
            margin: 0,
          },
        }}
        title={dataSimaster?.nama}
        subTitle={dataSimaster?.nip_baru}
        content={
          <Space direction="vertical">
            <EmployeeContent
              loading={isLoadingSimaster}
              data={{
                master: dataSimaster,
                siasn: siasn,
                pns: dataPnsAll,
              }}
            />
            <EmployeeUnor data={dataPnsAll} />
          </Space>
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
              <Breadcrumb.Item>
                <Link href="/apps-managements/anomali-data-2023">
                  <a>Anomali</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Integrasi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      />
      <Layout.Content
        style={{
          padding: 16,
        }}
      >
        {children}
      </Layout.Content>
    </>
  );
}

export default EmployeesLayout;
