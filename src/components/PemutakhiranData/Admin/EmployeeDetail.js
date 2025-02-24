import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import PengaturanGelarByNip from "@/components/LayananSIASN/PengaturanGelarByNip";
import {
  anomaliUserByNip,
  updateAnomaliUserByNip,
} from "@/services/anomali.services";
import { dataUtamaMasterByNip } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  getDataKppn,
  getPnsAllByNip,
  updateDataUtamaByNip,
} from "@/services/siasn-services";
import { getUmur } from "@/utils/client-utils";
import { LockOutlined } from "@ant-design/icons";
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
  Image,
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
import { useEffect, useState } from "react";
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
              <Image
                alt="Foto"
                style={{
                  borderRadius: 8,
                }}
                width={210}
                height={210}
                shape="square"
                src={data?.master?.foto}
              />
            </Space>
            <EmployeeDescriptionMaster loading={loading} data={data?.master} />
          </Flex>
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

const CheckAnomali = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [currentId, setCurrentId] = useState(null);

  const [currentAnomali, setCurrentAnomali] = useState(null);

  const handleOpen = (anomali) => {
    setOpen(true);
    setCurrentAnomali(anomali);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentAnomali(null);
  };

  const { nip } = router.query;
  const { data: anomali, isLoading: isLoadingAnomali } = useQuery(
    ["anomali-user-by-nip", nip],
    () => anomaliUserByNip(nip),
    {
      enabled: !!nip,
    }
  );

  const { mutateAsync: update, isloading: isLoadingUpdate } = useMutation(
    (data) => updateAnomaliUserByNip(data),
    {
      onSuccess: () => {
        message.success("Berhasil memperbarui data");
        handleClose();
      },
      onError: () => {
        message.error("Gagal memperbarui data");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["anomali-user-by-nip", nip]);
      },
    }
  );

  return (
    <div>
      <ModalAnomali
        loadingUpdate={isLoadingUpdate}
        update={update}
        open={open}
        onCancel={handleClose}
        nip={nip}
        id={currentId}
        initialData={currentAnomali}
      />
      {anomali?.length && (
        <>
          {anomali?.map((a) => (
            <Tooltip key={a.id} title="Anomali">
              <Tag
                onClick={() => handleOpen(a)}
                icon={<LockOutlined />}
                style={{
                  cursor: "pointer",
                }}
                color={a?.is_repaired ? "green" : "#f50"}
              >
                {a?.jenis_anomali_nama}
                {a?.is_repaired ? `${a?.user?.username}` : null}
              </Tag>
            </Tooltip>
          ))}
        </>
      )}
    </div>
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
      >
        <IPAsnByNip tahun={2024} nip={dataSimaster?.nip_baru} />
        <Kppn id={siasn?.kppnId} />
        <PengaturanGelarByNip nip={nip} />
      </Space>
    </Card>
  );
}

export default EmployeeDetail;
