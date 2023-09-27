import { pencarianLayananSIASN } from "@/services/index";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Result,
  Row,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import { useState } from "react";

const HasilLayanan = ({ data }) => {
  const columns = [
    { title: "Nama", key: "nama", dataIndex: "nama" },
    { title: "NIP", key: "nip", dataIndex: "nip" },
    {
      title: "Jenis Layanan",
      key: "jenis_layanan_nama",
      dataIndex: "jenis_layanan_nama",
    },
    {
      title: "Status Usulan",
      key: "status_usulan",
      dataIndex: "status_usulan",
    },
    {
      title: "Tanggal Usulan",
      key: "tanggal_usulan",
      dataIndex: "tanggal_usulan",
    },
  ];

  if (!data) {
    return (
      <Result
        title="Tidak ada"
        subTitle="Data yang anda cari tidak ada pada layanan siasn"
        status="error"
      />
    );
  } else {
    return (
      <>
        <Table
          size="small"
          dataSource={data}
          columns={columns}
          pagination={false}
        />
      </>
    );
  }
};

function SIASNTracking() {
  const [form] = Form.useForm();
  const [dataLayanan, setDataLayanan] = useState(null);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const cancelOpen = () => setOpen(false);

  const listLayanan = [
    { key: "kenaikan-pangkat", label: "Kenaikan Pangkat" },
    { key: "pemberhentian", label: "Pemberhentian" },
    { key: "skk", label: "Usul Perbaikan Nama" },
  ];

  const { data, refetch, isFetching, isLoading } = useQuery(
    ["layanan-siasn", dataLayanan],
    () => pencarianLayananSIASN(dataLayanan),
    {
      refetchOnWindowFocus: false,
      enabled: !!dataLayanan,
      onSuccess: () => {
        handleOpen();
      },
      onError: () => {
        message.error("Gagal mendapatkan data");
      },
    }
  );

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      setDataLayanan(result);
      await refetch();
    } catch (error) {}
  };

  return (
    <div>
      <Row>
        <Modal
          destroyOnClose
          onOk={cancelOpen}
          width={800}
          centered
          title={`Layanan SIASN ${dataLayanan?.jenis_layanan} ${dataLayanan?.nip}`}
          onCancel={cancelOpen}
          open={open}
        >
          <HasilLayanan data={data} />
        </Modal>
        <Col md={18} xs={24}>
          <Card title="Cek Status Kepegawaian">
            <Form onFinish={handleFinish} form={form} layout="vertical">
              <Form.Item
                rules={[
                  { required: true, message: "Pilih Layanan Terlebih dahulu" },
                ]}
                name="jenis_layanan"
                label="Jenis Layanan SIASN"
              >
                <Select
                  showSearch
                  allowClear
                  style={{
                    width: "100%",
                  }}
                >
                  {listLayanan.map((item) => (
                    <Select.Option
                      key={item?.key}
                      name="item"
                      value={item?.key}
                    >
                      {item?.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                rules={[
                  { required: true, message: "NIP Pegawai tidak boleh kosong" },
                ]}
                name="nip"
                label="NIP Pegawai"
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button
                  disabled={isFetching}
                  loading={isFetching}
                  htmlType="submit"
                >
                  Cari
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SIASNTracking;
