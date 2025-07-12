import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import PengaturanGelarByNip from "@/components/LayananSIASN/PengaturanGelarByNip";
import { dataUtamaMasterByNip } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  fotoByNip,
  getDataKppn,
  getPnsAllByNip,
  updateDataUtamaByNip,
  updateFotoByNip,
} from "@/services/siasn-services";
import { getUmur } from "@/utils/client-utils";
import { TagOutlined, UserOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert as AlertAntd,
  Avatar,
  Button,
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
import CekUnor from "@/components/Disparitas/CekUnor";

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

const EmployeeDescriptionMaster = ({ data, loading, unorId }) => {
  const breakPoint = Grid.useBreakpoint();

  return (
    <Card
      title={
        <Space>
          <Typography.Text strong>Informasi Pegawai SIMASTER</Typography.Text>
        </Space>
      }
      style={{ marginBottom: 16 }}
      loading={loading}
    >
      <Descriptions
        size="small"
        column={breakPoint.xs ? 1 : 2}
        layout={breakPoint.xs ? "vertical" : "horizontal"}
        bordered
      >
        <Descriptions.Item label="Nama Lengkap">
          <Typography.Text copyable strong>
            {data?.nama || "-"}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="NIP">
          <Typography.Text copyable code>
            {data?.nip_baru || "-"}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Usia">
          <Tag color="blue">
            {data?.tgl_lahir ? `${getUmur(data?.tgl_lahir)} Tahun` : "-"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Jabatan">
          <Typography.Text strong>
            {data?.jabatan?.jabatan || "-"}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label="Golongan">
          <Tag color="volcano">{data?.pangkat?.golongan || "-"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Jenjang Pendidikan">
          <div>
            <Typography.Text strong>
              {data?.pendidikan?.jenjang || "-"}
            </Typography.Text>
            {data?.pendidikan?.prodi && (
              <Typography.Text style={{ display: "block", color: "#666" }}>
                {data?.pendidikan?.prodi}
              </Typography.Text>
            )}
            {data?.pendidikan?.nama_sekolah && (
              <Typography.Text
                style={{ display: "block", color: "#999", fontSize: "12px" }}
              >
                {data?.pendidikan?.nama_sekolah}
              </Typography.Text>
            )}
          </div>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <Space>
              <Typography.Text>Perangkat Daerah</Typography.Text>
              <CekUnor unorId={unorId} />
            </Space>
          }
          span={breakPoint.xs ? 1 : 2}
        >
          <Typography.Text>{data?.skpd?.detail || "-"}</Typography.Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

const EmployeeContent = ({ data, loading, nip }) => {
  const queryClient = useQueryClient();
  const breakPoint = Grid.useBreakpoint();

  const { mutateAsync: updateFoto, isLoading: isLoadingUpdateFoto } =
    useMutation((nip) => updateFotoByNip(nip), {
      onSuccess: () => {
        queryClient.invalidateQueries(["foto-by-nip", nip]);
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
        queryClient.invalidateQueries(["data-utama-simaster-by-nip", nip]);
        queryClient.invalidateQueries(["data-pns-all", nip]);
        message.success("Berhasil memperbarui foto");
      },
      onError: () => {
        message.error("Gagal memperbarui foto");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["foto-by-nip", nip]);
        queryClient.invalidateQueries(["data-utama-siasn", nip]);
        queryClient.invalidateQueries(["data-utama-simaster-by-nip", nip]);
        queryClient.invalidateQueries(["data-pns-all", nip]);
      },
    });

  const handleUpdateFoto = async () => {
    await updateFoto(nip);
  };

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
          <Flex vertical style={{ marginBottom: 16 }}>
            {/* Foto Section - Responsive Layout */}
            <Row justify="center" style={{ marginBottom: 24 }}>
              <Col xs={24} sm={24} md={22} lg={20} xl={18}>
                <Flex
                  align="center"
                  justify="center"
                  gap={breakPoint.xs ? 4 : 8}
                  wrap
                >
                  {/* Foto SIMASTER */}
                  <Flex
                    vertical
                    align="center"
                    style={{
                      minWidth: breakPoint.xs ? "120px" : "140px",
                      padding: breakPoint.xs ? "12px 4px" : "16px 8px",
                    }}
                  >
                    <Typography.Text
                      strong
                      style={{
                        fontSize: breakPoint.xs ? "12px" : "13px",
                        color: "#1890ff",
                        textAlign: "center",
                        marginBottom: "12px",
                      }}
                    >
                      📸 Foto SIMASTER
                    </Typography.Text>
                    <Avatar
                      src={data?.master?.foto}
                      size={120}
                      shape="square"
                      icon={!data?.master?.foto && <UserOutlined />}
                    />
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: breakPoint.xs ? "10px" : "11px",
                        textAlign: "center",
                      }}
                    >
                      Database Lokal
                    </Typography.Text>
                  </Flex>

                  {/* Transfer Button */}
                  <Flex
                    vertical
                    align="center"
                    justify="center"
                    style={{
                      minWidth: breakPoint.xs ? "140px" : "160px",
                      padding: breakPoint.xs ? "12px 8px" : "16px",
                    }}
                  >
                    <Button
                      type="primary"
                      style={{
                        width: "100%",
                        marginBottom: "8px",
                      }}
                      onClick={handleUpdateFoto}
                      loading={isLoadingUpdateFoto}
                    >
                      📤 Transfer ke SIASN
                    </Button>
                    <Typography.Text
                      style={{
                        fontSize: breakPoint.xs ? "10px" : "11px",
                        color: "#666",
                        textAlign: "center",
                        fontStyle: "italic",
                        lineHeight: 1.3,
                      }}
                    >
                      Transfer foto ke database pusat
                    </Typography.Text>
                  </Flex>

                  {/* Foto SIASN */}
                  <Flex
                    vertical
                    align="center"
                    style={{
                      minWidth: breakPoint.xs ? "120px" : "140px",
                      padding: breakPoint.xs ? "12px 4px" : "16px 8px",
                    }}
                  >
                    <Typography.Text
                      strong
                      style={{
                        fontSize: breakPoint.xs ? "12px" : "13px",
                        color: "#fa8c16",
                        textAlign: "center",
                        marginBottom: "12px",
                      }}
                    >
                      📸 Foto SIASN
                    </Typography.Text>
                    <Avatar
                      src={data?.fotoSiasn?.data}
                      size={120}
                      shape="square"
                      icon={!data?.fotoSiasn?.data && <UserOutlined />}
                    />
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: breakPoint.xs ? "10px" : "11px",
                        textAlign: "center",
                      }}
                    >
                      Database Pusat
                    </Typography.Text>
                  </Flex>
                </Flex>
              </Col>
            </Row>

            {/* Employee Description */}
            <EmployeeDescriptionMaster
              unorId={data?.siasn?.unorId}
              loading={loading}
              data={data?.master}
            />
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

  const { data: foto, isLoading: isLoadingFoto } = useQuery(
    ["foto-by-nip", nip],
    () => fotoByNip(nip),
    {
      refetchOnWindowFocus: false,
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
        nip={nip}
        loading={isLoadingDataSimaster}
        data={{
          master: dataSimaster,
          siasn: siasn,
          pns: dataPnsAll,
          fotoSiasn: foto,
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
