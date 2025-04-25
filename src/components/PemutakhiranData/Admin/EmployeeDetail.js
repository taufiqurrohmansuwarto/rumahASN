import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import PengaturanGelarByNip from "@/components/LayananSIASN/PengaturanGelarByNip";
import { dataUtamaMasterByNip } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  getDataKppn,
  getPnsAllByNip,
  updateDataUtamaByNip,
} from "@/services/siasn-services";
import { getUmur } from "@/utils/client-utils";
import { TagOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert as AlertAntd,
  Avatar,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Flex,
  Form,
  Grid,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import SyncGolonganByNip from "../Sync/SyncGolonganByNip";
import SyncJabatanByNip from "../Sync/SyncJabatanByNip";
import DisparitasByNip from "./DisparitasByNip";
import TrackingKenaikanPangkatByNip from "./Usulan/TrackingKenaikanPangkatByNip";
import TrackingPemberhentianByNip from "./Usulan/TrackingPemberhentianByNip";
import TrackingPencantumanGelarByNip from "./Usulan/TrackingPencantumanGelarByNip";
import TrackingPenyesuaianMasaKerjaByNip from "./Usulan/TrackingPenyesuaianMasaKerjaByNip";
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
            <Row gutter={[8, 8]}>
              <Col span={24}>
                {data?.nama} ({data?.nip_baru}) - {data?.unor_nm}
              </Col>
              <Col span={24}>
                {data?.jabatan_nama} - {data?.golongan_nm}
              </Col>
              <Col span={24}>
                <Tracking nip={nip} />
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
        style={{ marginBottom: 16 }}
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
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Flex vertical gap={16}>
          <Flex gap={2} wrap="wrap" justify="flex-start">
            <Tooltip title="Status SIMASTER">
              <StatusMaster status={data?.master?.status} />
            </Tooltip>
            <Tooltip title="Status SIASN">
              <StatusSIASN
                status={data?.siasn?.statusPegawai}
                kedudukanNama={data?.siasn?.kedudukanPnsNama}
              />
            </Tooltip>
            <Tag
              icon={<TagOutlined />}
              color={data?.siasn?.validNik ? "green" : "red"}
            >
              {data?.siasn?.validNik ? "NIK Valid" : "NIK Belum Valid"}
            </Tag>
            <Tag icon={<TagOutlined />} color="blue">
              {data?.siasn?.jenisPegawaiNama || "Jenis Pegawai Tidak Tersedia"}
            </Tag>
            <Tag icon={<TagOutlined />} color="purple">
              {data?.siasn?.asnJenjangJabatan || "Jenjang Tidak Tersedia"}
            </Tag>
          </Flex>

          {/* Informasi Pegawai */}
          <Row gutter={[4, 4]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={6} md={5} lg={4} xl={3}>
              <Avatar
                src={data?.master?.foto}
                size={180}
                shape="square"
                style={{ width: "100%", height: "auto", maxWidth: 180 }}
                icon={!data?.master?.foto && <UserOutlined />}
              />
            </Col>
            <Col xs={24} sm={18} md={19} lg={20} xl={21}>
              <EmployeeDescriptionMaster
                loading={loading}
                data={data?.master}
              />
            </Col>
          </Row>
        </Flex>
      </Col>
    </Row>
  );
};

const Tracking = ({ nip }) => {
  return (
    <>
      <Space align="center">
        <TrackingKenaikanPangkatByNip nip={nip} />
        <TrackingPemberhentianByNip nip={nip} />
        <TrackingPerbaikanNamaByNip nip={nip} />
        <TrackingUsulanLainnyaByNip nip={nip} />
        <TrackingPencantumanGelarByNip nip={nip} />
        <TrackingPenyesuaianMasaKerjaByNip nip={nip} />
      </Space>
    </>
  );
};

const ModalAnomali = ({
  open,
  onCancel,
  update,
  loadingUpdate,
  nip,
  initialData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
    }
  }, [form, initialData]);

  const handleUpdate = async () => {
    try {
      const result = await form.validateFields();
      const payload = {
        id: initialData?.id,
        employee_number: nip,
        data: result,
      };
      await update(payload);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      confirmLoading={loadingUpdate}
      onOk={handleUpdate}
      title="Update Data Anomali"
      open={open}
      onCancel={onCancel}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          valuePropName="checked"
          name="is_repaired"
          label="Sudah diperbaiki?"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item valuePropName="checked" name="reset" label="Reset">
          <Checkbox />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const StatusSIASN = ({ status, kedudukanNama }) => {
  return (
    <Tag icon={<TagOutlined />} color="orange">
      {status} - {kedudukanNama}
    </Tag>
  );
};

const StatusMaster = ({ status }) => {
  return (
    <Tag icon={<TagOutlined />} color={status === "Aktif" ? "green" : "red"}>
      {status}
    </Tag>
  );
};

const Kppn = ({ id }) => {
  const router = useRouter();
  const nip = router?.query?.nip;
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(["data-kppn"], () => getDataKppn(), {
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateDataUtamaByNip(data),
    {
      onSuccess: () => message.success("Berhasil memperbarui data"),
      onError: () => message.error("Gagal memperbarui data"),
      onSettled: () => {
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
      },
    }
  );

  const handleUpdate = async () => {
    const payload = {
      nip,
      data: {
        type: "KPKN",
      },
    };

    await update(payload);
  };

  const dataKppn = (id) => {
    return data?.find((d) => d.id === id);
  };

  return (
    <Spin spinning={isLoading}>
      {data ? (
        <Popconfirm onConfirm={handleUpdate} title="Update KPPN menjadi BPKAD?">
          <Tooltip title="KPPN">
            <Tag
              style={{
                cursor: "pointer",
              }}
              color="blue"
            >
              {dataKppn(id)?.nama}
            </Tag>
          </Tooltip>
        </Popconfirm>
      ) : (
        <Popconfirm onConfirm={handleUpdate} title="Update KPPN menjadi BPKAD?">
          <Tooltip title="KPPN">
            <Tag
              style={{
                cursor: "pointer",
              }}
              color="red"
            >
              KPPN Tidak Ditemukan
            </Tag>
          </Tooltip>
        </Popconfirm>
      )}
    </Spin>
  );
};

function EmployeeDetail({ nip }) {
  const breakPoint = Grid.useBreakpoint();
  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster-by-nip", nip],
    () => dataUtamaMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: dataPnsAll, isLoading: isLoadingDataPns } = useQuery(
    ["data-pns-all", nip],
    () => getPnsAllByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: siasn, isLoading: loadingSiasn } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  return (
    <Card title="Informasi Pegawai" extra={<DisparitasByNip />}>
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
        size={"small"}
      >
        <IPAsnByNip tahun={2024} nip={dataSimaster?.nip_baru} />
        <Kppn id={siasn?.kppnId} />
        <PengaturanGelarByNip nip={nip} />
      </Space>
    </Card>
  );
}

export default EmployeeDetail;
