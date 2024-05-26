import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import { dataUtamaMasterByNip } from "@/services/master.services";
import { dataUtamSIASNByNip, getPnsAllByNip } from "@/services/siasn-services";
import { getUmur } from "@/utils/client-utils";
import { Alert } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Card,
  Col,
  Descriptions,
  Flex,
  Grid,
  Row,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import SyncGolonganByNip from "../Sync/SyncGolonganByNip";
import SyncJabatanByNip from "../Sync/SyncJabatanByNip";

// import { patchAnomali2023 } from "@/services/anomali.services";

const EmployeeUnor = ({ data, loading }) => {
  return (
    <Alert title="Informasi ASN Via SIASN" color="yellow">
      <Spin spinning={loading}>
        {data ? (
          <Row>
            <Col span={24}>
              {data?.nama} ({data?.nip_baru}) - {data?.unor_nm}
            </Col>
            <Col span={24}>
              {data?.jabatan_nama} - {data?.golongan_nm}
            </Col>
          </Row>
        ) : (
          <div>
            <Tag color="red">Pegawai Tidak ditemukan di SIASN</Tag>
          </div>
        )}
      </Spin>
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
        <Descriptions.Item label="Nama">
          <Typography.Text copyable>{data?.nama}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="NIP">
          <Typography.Text copyable>{data?.nip_baru}</Typography.Text>
        </Descriptions.Item>
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
        <Flex gap={10} vertical>
          <Flex>
            <Tooltip title="Status Kepegawaian SIMASTER">
              <StatusMaster status={data?.master?.status} />
            </Tooltip>
            <Tooltip title="Status Kepegawaian SIASN">
              <StatusSIASN
                status={data?.siasn?.statusPegawai}
                kedudukanNama={data?.siasn?.kedudukanPnsNama}
              />
            </Tooltip>
          </Flex>
          <Flex gap={20} justify="space-between">
            <div>
              <Avatar size={110} shape="square" src={data?.master?.foto} />
            </div>
            <EmployeeDescriptionMaster loading={loading} data={data?.master} />
          </Flex>
        </Flex>
      </Col>
    </Row>
  );
};

const StatusSIASN = ({ status, kedudukanNama }) => {
  return (
    <Tag color="orange">
      {status} - {kedudukanNama}
    </Tag>
  );
};

const StatusMaster = ({ status }) => {
  return (
    <Tag color={status === "Aktif" ? "green" : "red"}>
      {status === "Aktif" ? "Pegawai Aktif" : "Pegawai Non Aktif"}
    </Tag>
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
      <EmployeeUnor loading={isLoadingDataPns} data={dataPnsAll} />
      <Flex style={{ marginTop: 10 }} gap={10} align="center" justify="start">
        <IPAsnByNip tahun={2023} nip={dataSimaster?.nip_baru} />
        <SyncGolonganByNip nip={nip} />
        <SyncJabatanByNip nip={nip} />
      </Flex>
    </Card>
  );
}

export default EmployeeDetail;
