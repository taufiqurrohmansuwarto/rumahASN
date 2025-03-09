import IPAsnByNip from "@/components/LayananSIASN/IPASNByNip";
import EmployeeDetail from "@/components/PemutakhiranData/Admin/EmployeeDetail";
import SiasnTab from "@/components/PemutakhiranData/Admin/SiasnTab";
import { patchAnomali2023 } from "@/services/anomali.services";
import { dataUtamaMasterByNip } from "@/services/master.services";
import { Alert, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Card,
  Checkbox,
  Col,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

/**
 * Komponen untuk mengubah status anomali
 * @param {Object} props - Properti komponen
 * @param {Object} props.data - Data anomali
 * @param {boolean} props.open - Status modal terbuka
 * @param {Function} props.onCancel - Fungsi untuk menutup modal
 */
const ChangeStatusAnomali = ({ data, open, onCancel }) => {
  const [form] = Form.useForm();
  const router = useRouter();
  const nip = router.query.nip;
  const queryClient = useQueryClient();

  // Mutasi untuk memperbarui data anomali
  const { mutate: update, isLoading } = useMutation({
    mutationFn: patchAnomali2023,
    onSuccess: () => {
      message.success("Berhasil memperbarui data");
      onCancel();
    },
    onError: () => {
      message.error("Gagal memperbarui data");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["data-utama-simaster-by-nip", nip]);
    },
  });

  // Mengisi form dengan data yang ada
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        is_repaired: data?.is_repaired,
        description: data?.description,
      });
    }
  }, [data, form]);

  // Handler untuk submit form
  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      update({
        id: data?.id,
        data: {
          is_repaired: values.is_repaired,
          description: values.description,
          reset: values.reset,
        },
      });
    } catch (error) {
      console.log("Form validation error:", error);
    }
  };

  return (
    <Modal
      confirmLoading={isLoading}
      onOk={handleFinish}
      title="Perbaikan Anomali"
      centered
      open={open}
      onCancel={onCancel}
    >
      <Stack>
        <Alert title="Harap diperhatikan" color="red">
          Pastikan Data Jabatan Terakhir di SIASN menggunakan awalan UPT jika di
          sekolah. Jangan di beri tanda cek sebelum diperbaiki
        </Alert>
        <Form layout="vertical" form={form}>
          <Form.Item
            valuePropName="checked"
            name="is_repaired"
            label="Sudah diperbaiki?"
          >
            <Checkbox />
          </Form.Item>
          <Form.Item valuePropName="checked" name="reset" label="Lepas">
            <Checkbox />
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Stack>
    </Modal>
  );
};

/**
 * Komponen untuk menampilkan biodata pegawai
 * @param {Object} props - Properti komponen
 * @param {Object} props.data - Data pegawai dari SIMASTER
 * @param {boolean} props.loading - Status loading data
 * @param {boolean} props.isLoadingDataPns - Status loading data PNS
 * @param {Object} props.dataPnsAll - Data PNS
 * @param {Object} props.siasn - Data dari SIASN
 */
const EmployeeBio = ({
  data,
  loading,
  isLoadingDataPns,
  dataPnsAll,
  siasn,
}) => {
  const [open, setOpen] = useState(false);
  const [anomali, setAnomali] = useState(null);

  const handleOpen = (anomali) => {
    setAnomali(anomali);
    setOpen(true);
  };

  const handleClose = () => {
    setAnomali(null);
    setOpen(false);
  };

  return (
    <Card loading={loading}>
      <ChangeStatusAnomali data={anomali} open={open} onCancel={handleClose} />
      <Row gutter={[16, 16]}>
        <Col md={2} sm={5}>
          <Avatar size={95} shape="circle" src={data?.foto} />
        </Col>
        <Col md={10} sm={13}>
          <Space direction="vertical">
            <Space size="small">
              {/* Status dari SIMASTER */}
              <Tooltip title="Status Pegawai dari SIMASTER">
                <Tag color={data?.status === "Aktif" ? "green" : "red"}>
                  {data?.status === "Aktif"
                    ? "Pegawai Aktif"
                    : "Pegawai Non Aktif"}
                </Tag>
              </Tooltip>

              {/* Status dari SIASN */}
              <Tooltip title="Status Pegawai dari SIASN">
                <Tag color="yellow">{siasn?.kedudukanPnsNama}</Tag>
              </Tooltip>

              {/* Daftar anomali */}
              {data?.anomali?.length > 0 && (
                <>
                  {data.anomali.map((d) => (
                    <Tag
                      key={d?.id}
                      color={d?.is_repaired ? "green" : "red"}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleOpen(d)}
                    >
                      {d?.jenis_anomali_nama}
                    </Tag>
                  ))}
                </>
              )}
            </Space>

            {/* Informasi pegawai */}
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
        </Col>
      </Row>

      {/* Informasi ASN */}
      <Row style={{ marginTop: 8 }} gutter={[32, 32]}>
        <Col md={24}>
          <Skeleton loading={isLoadingDataPns}>
            <Alert title="Informasi ASN" color="yellow">
              <Row>
                <Col span={24}>
                  {dataPnsAll?.nama} ({dataPnsAll?.nip_baru}) -{" "}
                  {dataPnsAll?.unor_nm}
                </Col>
                <Col span={24}>{dataPnsAll?.jabatan_nama}</Col>
              </Row>
            </Alert>
          </Skeleton>
        </Col>
      </Row>

      {/* Komponen IP ASN */}
      <IPAsnByNip tahun={2023} nip={data?.nip_baru} />
    </Card>
  );
};

/**
 * Komponen utama halaman detail pegawai
 * Menampilkan informasi lengkap pegawai dari SIMASTER dan SIASN
 */
const RekonPegawaiDetail = () => {
  const router = useRouter();
  const { nip } = router?.query;

  // Query untuk data SIMASTER
  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery({
    queryKey: ["data-utama-simaster-by-nip", nip],
    queryFn: () => dataUtamaMasterByNip(nip),
    enabled: !!nip,
  });

  return (
    <Skeleton loading={isLoadingDataSimaster} avatar paragraph={{ rows: 3 }}>
      {dataSimaster ? (
        <Stack>
          <EmployeeDetail nip={nip} />
          <Card>
            <SiasnTab nip={nip} />
          </Card>
        </Stack>
      ) : (
        <Empty description="Data tidak ditemukan" />
      )}
    </Skeleton>
  );
};

export default RekonPegawaiDetail;
