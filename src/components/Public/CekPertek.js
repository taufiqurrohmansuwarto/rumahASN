import { cekPertekService } from "@/services/public.services";
import { FileWordOutlined } from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Col,
  Radio,
  Form,
  Input,
  message,
  Modal,
  Row,
  Skeleton,
  Space,
} from "antd";
import { useState } from "react";

const ShowData = ({ data, loading }) => {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (!data) {
    return null;
  }

  const handleDownload = () => {
    const base64String = `data:application/pdf;base64,${data?.file}`;
    const a = document.createElement("a");
    a.href = base64String;
    a.download = "pertek.pdf";
    a.click();
  };

  const handleDownloadSk = () => {
    const base64String = `data:application/pdf;base64,${data?.fileSk}`;
    const a = document.createElement("a");
    a.href = base64String;
    a.download = "sk.pdf";
    a.click();
  };
  return (
    <div className="result-container" style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 16 }}>Informasi Pertek</h3>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div className="info-item">
            <strong>Nama:</strong> {data.nama}
          </div>
          <div className="info-item">
            <strong>NIP:</strong> {data.nip}
          </div>
          <div className="info-item">
            <strong>Nomor Peserta:</strong> {data.no_peserta}
          </div>
          <div className="info-item">
            <strong>Jenis Formasi:</strong> {data.jenis_formasi_nama}
          </div>
        </Col>
        <Col span={12}>
          <div className="info-item">
            <strong>Status Usulan:</strong>{" "}
            <span style={{ color: "#1890ff" }}>{data.status_usulan_nama}</span>
          </div>
          <div className="info-item">
            <strong>Unit Organisasi:</strong> {data.unor_siasn || "-"}
          </div>
          <Space>
            {data?.file && (
              <div className="info-item" style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<FileWordOutlined />}
                  onClick={handleDownload}
                >
                  Unduh Pertek
                </Button>
              </div>
            )}
            {data?.fileSk && (
              <div className="info-item" style={{ marginTop: 16 }}>
                <Button
                  type="primary"
                  icon={<FileWordOutlined />}
                  onClick={handleDownloadSk}
                >
                  Unduh SK
                </Button>
              </div>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

const ModalCekPertek = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(null);

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => cekPertekService(data),
    onSuccess: (data) => {
      setData(data);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message);
    },
  });

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const payload = {
      no_peserta: values?.no_peserta,
      no_ijazah: values?.no_ijazah,
      tahun_lulus: values?.tahun_lulus,
      tahun: values?.tahun,
    };

    mutate(payload);
  };

  return (
    <Modal
      title="Cek Status Usulan CASN"
      open={open}
      onCancel={onCancel}
      onOk={null}
      okText="Submit"
      footer={null}
      width={800}
    >
      <Stack>
        <Alert
          color="red"
          variant="filled"
          icon={<IconAlertCircle size="1rem" />}
        >
          Hanya untuk Pemerintah Provinsi Jawa Timur
        </Alert>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col md={12} xs={24}>
              <Form.Item
                rules={[{ required: true, message: "No Peserta harus diisi" }]}
                normalize={(values) => values.replace(/\s/g, "")}
                name="no_peserta"
                label="No Peserta"
                style={{ marginBottom: 16 }}
              >
                <Input placeholder="Masukkan nomor peserta" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                rules={[{ required: true, message: "No Ijazah harus diisi" }]}
                name="no_ijazah"
                label="No Ijazah (lihat di SSCASN)"
              >
                <Input placeholder="Masukkan nomor ijazah" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                rules={[{ required: true, message: "Tahun Lulus harus diisi" }]}
                name="tahun_lulus"
                label="Tahun Lulus (lihat di SSCASN)"
              >
                <Input placeholder="Masukkan tahun lulus" />
              </Form.Item>
            </Col>
            <Col md={12} xs={24}>
              <Form.Item
                rules={[{ required: true, message: "Tahun harus diisi" }]}
                name="tahun"
                label="Tahun"
                style={{ marginBottom: 16 }}
              >
                <Radio.Group>
                  <Radio.Button value="2025">2025</Radio.Button>
                  <Radio.Button value="2024">2024</Radio.Button>
                  <Radio.Button value="2023">2023</Radio.Button>
                  <Radio.Button value="2022">2022</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          <Button
            loading={isLoading}
            disabled={isLoading}
            type="primary"
            htmlType="submit"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Form>
        <ShowData data={data} loading={isLoading} />
      </Stack>
    </Modal>
  );
};

function CekPertek() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button shape="round" type="primary" onClick={handleOpenModal}>
        Cek Status Usulan CASN
      </Button>
      <ModalCekPertek
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
      />
    </>
  );
}

export default CekPertek;
