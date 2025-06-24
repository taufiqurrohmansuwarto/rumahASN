import {
  getDetailPengadaanProxy,
  usulkanPengadaanProxy,
} from "@/services/siasn-services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import {
  Spin,
  Alert,
  Descriptions,
  Modal,
  Button,
  Form,
  Input,
  DatePicker,
  message,
  Flex,
  Card,
  Typography,
  Space,
  Grid,
  Tag,
  Avatar,
  Tooltip,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  ReloadOutlined,
  SendOutlined,
  UserOutlined,
  IdcardOutlined,
  CalendarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  FormOutlined,
  FilePdfOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ModalUsulan = ({ open, onClose, data, onSuccess }) => {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { mutateAsync: usulkan, isLoading } = useMutation({
    mutationFn: (data) => usulkanPengadaanProxy(data),
    onSuccess: () => {
      message.success("Usulan berhasil dikirim");
      onClose();
      form.resetFields();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      message.error(error?.message || "Usulan gagal dikirim");
    },
  });

  useEffect(() => {
    if (open && data) {
      form.setFieldsValue({
        no_peserta: data?.usulan_data?.data?.no_peserta,
        tahun_formasi: data?.periode,
      });
    }
  }, [open, data, form]);

  const handleAutoFill = () => {
    form.setFieldsValue({
      no_sk: "800.1.13.2/1401/204/2025",
      tgl_sk: dayjs("2025-03-27"),
      tgl_ttd_sk: dayjs("2025-03-27"),
      pejabat_ttd_sk: "196704091992022003",
    });
    message.success("Data berhasil diisi otomatis");
  };

  const handleAutoFill2 = () => {
    form.setFieldsValue({
      no_sk: "800.1.13.2/932/204/2025",
      tgl_sk: dayjs("2025-02-28"),
      tgl_ttd_sk: dayjs("2025-02-28"),
      pejabat_ttd_sk: "196704091992022003",
    });
    message.success("Data berhasil diisi otomatis");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id: data?.id,
        data: {
          ...values,
          tgl_sk: values.tgl_sk.format("DD-MM-YYYY"),
          tgl_ttd_sk: values.tgl_ttd_sk.format("DD-MM-YYYY"),
          sk_pdf: data?.sk_pdf,
        },
      };
      await usulkan(payload);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      open={open}
      confirmLoading={isLoading}
      onCancel={onClose}
      title={
        <Flex align="center" gap={12}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SendOutlined style={{ color: "white", fontSize: "18px" }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
              📝 Form Usulan Pengadaan
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Lengkapi data untuk mengirim usulan
            </Text>
          </div>
        </Flex>
      }
      width={isMobile ? "95%" : 900}
      onOk={handleSubmit}
      okText="Kirim Usulan"
      cancelText="Batal"
      okButtonProps={{
        icon: <SendOutlined />,
        style: {
          background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
          borderColor: "#FF4500",
          fontWeight: 600,
        },
      }}
      cancelButtonProps={{
        style: {
          borderColor: "#d9d9d9",
        },
      }}
      styles={{
        header: {
          borderBottom: "2px solid #FF4500",
          paddingBottom: "16px",
          marginBottom: "20px",
        },
      }}
    >
      <Flex vertical gap={20}>
        {/* Auto Fill Button */}
        <Card
          size="small"
          style={{
            backgroundColor: "#fff7e6",
            border: "1px solid #ffcc99",
            borderRadius: "8px",
          }}
        >
          <Flex align="center" justify="space-between" wrap>
            <Flex align="center" gap={8}>
              <ThunderboltOutlined
                style={{ color: "#FF4500", fontSize: "16px" }}
              />
              <Text strong style={{ color: "#1a1a1a" }}>
                Isi Otomatis Data SK
              </Text>
            </Flex>
            <Flex gap={8}>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleAutoFill}
                size="small"
                style={{
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  borderColor: "#FF4500",
                  fontWeight: 500,
                }}
              >
                Auto Fill
              </Button>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleAutoFill2}
                size="small"
                style={{
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  borderColor: "#FF4500",
                  fontWeight: 500,
                }}
              >
                Auto Fill 2
              </Button>
            </Flex>
          </Flex>
        </Card>

        <Form form={form} layout="vertical" size="large">
          <Card
            title={
              <Flex align="center" gap={8}>
                <UserOutlined style={{ color: "#FF4500" }} />
                <Text strong>Data Peserta</Text>
              </Flex>
            }
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Flex gap={16} wrap>
              <Form.Item
                label="No Peserta"
                name="no_peserta"
                style={{ flex: 1, minWidth: isMobile ? "100%" : "200px" }}
              >
                <Input
                  readOnly
                  prefix={<IdcardOutlined style={{ color: "#666" }} />}
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </Form.Item>
              <Form.Item
                label="Tahun Formasi"
                name="tahun_formasi"
                style={{ flex: 1, minWidth: isMobile ? "100%" : "200px" }}
              >
                <Input
                  readOnly
                  prefix={<CalendarOutlined style={{ color: "#666" }} />}
                  style={{ backgroundColor: "#f5f5f5" }}
                />
              </Form.Item>
            </Flex>
          </Card>

          <Card
            title={
              <Flex align="center" gap={8}>
                <FileTextOutlined style={{ color: "#FF4500" }} />
                <Text strong>Data SK</Text>
              </Flex>
            }
            size="small"
          >
            <Flex vertical gap={16}>
              <Form.Item
                label="No SK"
                name="no_sk"
                rules={[{ required: true, message: "Nomor SK wajib diisi" }]}
              >
                <Input
                  placeholder="Masukkan nomor SK"
                  prefix={<FileTextOutlined style={{ color: "#666" }} />}
                />
              </Form.Item>

              <Flex gap={16} wrap>
                <Form.Item
                  label="Tanggal SK"
                  name="tgl_sk"
                  rules={[
                    { required: true, message: "Tanggal SK wajib diisi" },
                  ]}
                  style={{ flex: 1, minWidth: isMobile ? "100%" : "200px" }}
                >
                  <DatePicker
                    format="DD-MM-YYYY"
                    style={{ width: "100%" }}
                    placeholder="Pilih tanggal SK"
                  />
                </Form.Item>
                <Form.Item
                  label="Tanggal TTD SK"
                  name="tgl_ttd_sk"
                  rules={[
                    { required: true, message: "Tanggal TTD SK wajib diisi" },
                  ]}
                  style={{ flex: 1, minWidth: isMobile ? "100%" : "200px" }}
                >
                  <DatePicker
                    format="DD-MM-YYYY"
                    style={{ width: "100%" }}
                    placeholder="Pilih tanggal TTD"
                  />
                </Form.Item>
              </Flex>

              <Form.Item
                label="Pejabat TTD SK"
                name="pejabat_ttd_sk"
                rules={[
                  { required: true, message: "Pejabat TTD SK wajib diisi" },
                ]}
              >
                <Input
                  placeholder="Masukkan nama pejabat penandatangan"
                  prefix={<UserOutlined style={{ color: "#666" }} />}
                />
              </Form.Item>
            </Flex>
          </Card>
        </Form>
      </Flex>
    </Modal>
  );
};

const ModalPdfViewer = ({ open, onClose, pdfData, title }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getPdfDataUrl = (base64String) => {
    if (base64String?.startsWith("data:application/pdf;base64,")) {
      return base64String;
    }
    return `data:application/pdf;base64,${base64String}`;
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <Flex align="center" gap={12}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FilePdfOutlined style={{ color: "white", fontSize: "18px" }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
              📄 {title || "PDF Viewer"}
            </Title>
            <Text type="secondary" style={{ fontSize: "13px" }}>
              Dokumen SK Pengadaan
            </Text>
          </div>
        </Flex>
      }
      width={isMobile ? "95%" : "90%"}
      footer={null}
      styles={{
        header: {
          borderBottom: "2px solid #FF4500",
          paddingBottom: "16px",
          marginBottom: "20px",
        },
        body: {
          padding: "0",
        },
      }}
    >
      <div style={{ height: isMobile ? "70vh" : "80vh" }}>
        <iframe
          src={getPdfDataUrl(pdfData)}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            borderRadius: "8px",
          }}
          title="PDF Viewer"
        />
      </div>
    </Modal>
  );
};

function DetailLayananPengadaan() {
  const router = useRouter();
  const { id } = router.query;
  const [openModalUsulan, setOpenModalUsulan] = useState(false);
  const [openModalPdf, setOpenModalPdf] = useState(false);
  const [usulanData, setUsulanData] = useState(null);

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["detail-pengadaan-proxy", id],
    queryFn: () => getDetailPengadaanProxy(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });

  const handleOpenModalUsulan = (data) => {
    setOpenModalUsulan(true);
    setUsulanData(data);
  };

  const handleCloseModalUsulan = () => {
    setOpenModalUsulan(false);
    setUsulanData(null);
  };

  const handleOpenPdfViewer = () => {
    setOpenModalPdf(true);
  };

  const handleClosePdfViewer = () => {
    setOpenModalPdf(false);
  };

  const handleRefresh = () => {
    refetch();
    message.success("Data berhasil dimuat ulang");
  };

  if (isLoading) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          padding: isMobile ? "20px" : "50px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            borderRadius: "12px",
            border: "1px solid #e8e8e8",
            maxWidth: "400px",
            width: "100%",
          }}
        >
          <Flex vertical gap={16} align="center">
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileTextOutlined style={{ color: "white", fontSize: "24px" }} />
            </div>
            <Spin size="large" />
            <div>
              <Title level={4} style={{ margin: 0, color: "#1a1a1a" }}>
                Memuat Data Pengadaan
              </Title>
              <Text type="secondary">
                Sedang mengambil detail layanan pengadaan...
              </Text>
            </div>
          </Flex>
        </Card>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          padding: isMobile ? "20px" : "50px",
        }}
      >
        <Card style={{ maxWidth: "500px", width: "100%" }}>
          <Alert
            message="Gagal Memuat Data"
            description={
              error?.message || "Terjadi kesalahan saat memuat data pengadaan"
            }
            type="error"
            showIcon
            action={
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                style={{
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  borderColor: "#FF4500",
                }}
              >
                Coba Lagi
              </Button>
            }
          />
        </Card>
      </Flex>
    );
  }

  if (!data?.sk_pdf) {
    return (
      <Flex
        justify="center"
        align="center"
        style={{
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          padding: isMobile ? "20px" : "50px",
        }}
      >
        <Card style={{ maxWidth: "500px", width: "100%" }}>
          <Alert
            message="PDF Tidak Tersedia"
            description="Dokumen PDF untuk layanan pengadaan ini tidak tersedia"
            type="warning"
            showIcon
            action={
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                style={{
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  borderColor: "#FF4500",
                }}
              >
                Refresh
              </Button>
            }
          />
        </Card>
      </Flex>
    );
  }

  return (
    <div
      style={{
        padding: isMobile ? "12px" : "20px",
        backgroundColor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex
          align="center"
          gap={isMobile ? 12 : 16}
          wrap
          justify="space-between"
        >
          <Flex align="center" gap={isMobile ? 12 : 16}>
            <div
              style={{
                width: isMobile ? "40px" : "48px",
                height: isMobile ? "40px" : "48px",
                backgroundColor: "#FF4500",
                borderRadius: isMobile ? "8px" : "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FileTextOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? "16px" : "20px",
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Title
                level={isMobile ? 4 : 3}
                style={{ margin: 0, color: "#1a1a1a" }}
              >
                📋 Detail Layanan Pengadaan
              </Title>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "12px" : "14px" }}
              >
                Informasi lengkap dan aksi pengadaan ASN
              </Text>
            </div>
          </Flex>

          <Flex gap={8}>
            <Tooltip title="Refresh data">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isRefetching}
                style={{
                  borderColor: "#FF4500",
                  color: "#FF4500",
                }}
              >
                {!isMobile && "Refresh"}
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      </Card>

      {/* Data Card */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Descriptions
          title={
            <Flex align="center" gap={8}>
              <UserOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
              <Text strong style={{ fontSize: "16px" }}>
                Informasi Pegawai
              </Text>
            </Flex>
          }
          bordered={!isMobile}
          column={isMobile ? 1 : isTablet ? 2 : 3}
          size="middle"
        >
          <Descriptions.Item
            label={
              <Flex align="center" gap={6}>
                <UserOutlined style={{ color: "#666" }} />
                <Text>Nama</Text>
              </Flex>
            }
          >
            <Tag
              color="blue"
              style={{
                borderRadius: "8px",
                padding: "4px 12px",
                fontWeight: 500,
              }}
            >
              {data?.data?.nama || "N/A"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Flex align="center" gap={6}>
                <IdcardOutlined style={{ color: "#666" }} />
                <Text>NIP</Text>
              </Flex>
            }
          >
            <Text
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                backgroundColor: "#f5f5f5",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              {data?.data?.nip || "N/A"}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Flex align="center" gap={6}>
                <BankOutlined style={{ color: "#666" }} />
                <Text>No Peserta</Text>
              </Flex>
            }
          >
            <Text
              style={{
                fontFamily: "monospace",
                fontWeight: 600,
                color: "#FF4500",
                backgroundColor: "#fff7e6",
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              {data?.data?.usulan_data?.data?.no_peserta || "N/A"}
            </Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Flex align="center" gap={6}>
                <FormOutlined style={{ color: "#666" }} />
                <Text>Jenis Formasi</Text>
              </Flex>
            }
          >
            <Tag
              color="purple"
              style={{
                borderRadius: "8px",
                padding: "4px 12px",
                fontWeight: 500,
              }}
            >
              {data?.data?.jenis_formasi_nama || "N/A"}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Flex align="center" gap={6}>
                <CalendarOutlined style={{ color: "#666" }} />
                <Text>Tahun Formasi</Text>
              </Flex>
            }
          >
            <Tag
              color="orange"
              style={{
                borderRadius: "8px",
                padding: "4px 12px",
                fontWeight: 500,
              }}
            >
              {data?.data?.periode || "N/A"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Action Buttons */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex
          gap={12}
          wrap
          justify={isMobile ? "center" : "flex-start"}
          align="center"
        >
          <Button
            type="primary"
            size="large"
            icon={<EyeOutlined />}
            onClick={handleOpenPdfViewer}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              borderColor: "#1890ff",
              fontWeight: 600,
              borderRadius: "8px",
              minWidth: isMobile ? "120px" : "160px",
            }}
          >
            📄 Lihat PDF
          </Button>

          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={() =>
              handleOpenModalUsulan({
                ...data?.data,
                sk_pdf: data?.sk_pdf,
              })
            }
            style={{
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              borderColor: "#FF4500",
              fontWeight: 600,
              borderRadius: "8px",
              minWidth: isMobile ? "120px" : "160px",
            }}
          >
            📝 Kirim Usulan
          </Button>
        </Flex>
      </Card>

      {/* PDF Preview Card */}
      <Card
        title={
          <Flex align="center" gap={8}>
            <FilePdfOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
            <Text strong style={{ fontSize: "16px" }}>
              Preview Dokumen SK
            </Text>
          </Flex>
        }
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
        extra={
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={handleOpenPdfViewer}
            style={{ color: "#FF4500", fontWeight: 500 }}
          >
            Buka di Modal
          </Button>
        }
      >
        <div
          style={{
            height: isMobile ? "400px" : "600px",
            border: "2px solid #e8e8e8",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <iframe
            src={`data:application/pdf;base64,${data.sk_pdf}`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="PDF Preview"
          />
        </div>
      </Card>

      {/* Modals */}
      <ModalUsulan
        open={openModalUsulan}
        onClose={handleCloseModalUsulan}
        data={usulanData}
        onSuccess={handleRefresh}
      />

      <ModalPdfViewer
        open={openModalPdf}
        onClose={handleClosePdfViewer}
        pdfData={data?.sk_pdf}
        title="Dokumen SK Pengadaan"
      />
    </div>
  );
}

export default DetailLayananPengadaan;
