import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import { dataUtamaMasterByNip } from "@/services/master.services";
import { dataUtamSIASNByNip, getPnsAllByNip } from "@/services/siasn-services";
import { getUmur } from "@/utils/client-utils";
import { ActionIcon } from "@mantine/core";
import {
  IconBadges,
  IconBarrierBlock,
  IconEyeCheck,
  IconHistory,
} from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Alert as AlertAntd,
  Avatar,
  Card,
  Col,
  Descriptions,
  Flex,
  Grid,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import SyncGolonganByNip from "../Sync/SyncGolonganByNip";
import SyncJabatanByNip from "../Sync/SyncJabatanByNip";
import TrackingKenaikanPangkatByNip from "./Usulan/TrackingKenaikanPangkatByNip";
import { useRouter } from "next/router";
import TrackingPemberhentianByNip from "./Usulan/TrackingPemberhentianByNip";
import TrackingPerbaikanNamaByNip from "./Usulan/TrackingPerbaikanNamaByNip";
import TrackingUsulanLainnyaByNip from "./Usulan/TrackingUsulanLainnyaByNip";

// import { patchAnomali2023 } from "@/services/anomali.services";

const EmployeeUnor = ({ data, loading, nip }) => {
  return (
    <AlertAntd
      message="Informasi ASN Via SIASN"
      showIcon
      type="warning"
      action={
        <Space direction="vertical">
          <SyncJabatanByNip nip={nip} />
          <SyncGolonganByNip nip={nip} />
        </Space>
      }
      description={
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
      }
    ></AlertAntd>
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
  const router = useRouter();
  return (
    <Row gutter={[8, 16]}>
      <Col sm={24} md={24}>
        <Flex gap={10} vertical>
          <Flex>
            <Tooltip title="Status Kepegawaian SIMASTER">
              <div>
                <StatusMaster status={data?.master?.status} />
              </div>
            </Tooltip>
            <Tooltip title="Status Kepegawaian SIASN">
              <div>
                <StatusSIASN
                  status={data?.siasn?.statusPegawai}
                  kedudukanNama={data?.siasn?.kedudukanPnsNama}
                />
              </div>
            </Tooltip>
            <Tooltip title="Status Verifikasi NIK">
              <Tag color={data?.siasn?.validNik ? "green" : "red"}>
                {data?.siasn?.validNik
                  ? "NIK Terverifikasi"
                  : "NIK Belum Terverifikasi"}
              </Tag>
            </Tooltip>
          </Flex>
          <Flex gap={20} justify="space-between">
            <Space direction="vertical" align="center">
              <Avatar size={110} shape="circle" src={data?.master?.foto} />
              <Space align="center">
                <TrackingKenaikanPangkatByNip nip={router.query.nip} />
                <TrackingPemberhentianByNip nip={router.query.nip} />
                <TrackingPerbaikanNamaByNip nip={router.query.nip} />
                <TrackingUsulanLainnyaByNip nip={router.query.nip} />
              </Space>
            </Space>
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
  return <Tag color={status === "Aktif" ? "green" : "red"}>{status}</Tag>;
};

function EmployeeDetail({ nip }) {
  const breakPoint = Grid.useBreakpoint();
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
      <EmployeeUnor nip={nip} loading={isLoadingDataPns} data={dataPnsAll} />
      <Space
        direction={breakPoint?.xs ? "vertical" : "horizontal"}
        align={breakPoint?.xs ? "start" : "center"}
      >
        <IPAsnByNip tahun={2023} nip={dataSimaster?.nip_baru} />
      </Space>
    </Card>
  );
}

export default EmployeeDetail;
