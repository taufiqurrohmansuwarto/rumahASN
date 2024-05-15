import { dataUtamaMasterByNip } from "@/services/master.services";
import { dataUtamSIASNByNip, getPnsAllByNip } from "@/services/siasn-services";
import { getUmur } from "@/utils/client-utils";
import { Alert } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Col, Descriptions, Flex, Grid, Row } from "antd";

// import { patchAnomali2023 } from "@/services/anomali.services";

const EmployeeUnor = ({ data }) => {
  return (
    <Alert title="Informasi ASN Via SIASN" color="yellow">
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
        <Descriptions.Item label="NIP">{data?.nip_baru}</Descriptions.Item>
        <Descriptions.Item label="Nama">{data?.nama}</Descriptions.Item>
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

function EmployeeDetail({ nip }) {
  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
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
    <Card title="Informasi Pegawai">
      <EmployeeContent
        loading={isLoadingDataSimaster}
        data={{
          master: dataSimaster,
          siasn: siasn,
          pns: dataPnsAll,
        }}
      />
      <EmployeeUnor data={dataPnsAll} />
    </Card>
  );
}

export default EmployeeDetail;
