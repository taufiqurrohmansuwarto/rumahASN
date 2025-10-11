import {
  DownloadOutlined,
  IdcardOutlined,
  SafetyOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Text } from "@mantine/core";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  message,
  Row,
  Typography,
} from "antd";
import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const { Title } = Typography;
const { useBreakpoint } = Grid;

const LOGO_URL = "https://siasn.bkd.jatimprov.go.id:9000/public/logojatim.png";
const LOGO_WIDTH_PX = 76;
const LOGO_HEIGHT_PX = 113;

function SpecimenForm() {
  const screens = useBreakpoint();
  const isXs = !screens?.sm;
  const [form] = Form.useForm();
  const [isGenerating, setIsGenerating] = useState(false);

  // Watch form values for real-time preview
  const [formValues, setFormValues] = useState({
    name: "",
    position: "",
    rank: "",
  });

  // Watch form changes
  const watchAllFields = Form.useWatch([], form);

  useEffect(() => {
    const values = form.getFieldsValue();
    setFormValues({
      name: values.name || "",
      position: values.position || "",
      rank: values.rank || "",
    });
  }, [watchAllFields, form]);

  const handleFinish = async (values) => {
    try {
      setIsGenerating(true);
      message.loading({ content: "Generating spesimen...", key: "generate" });

      // Get preview element
      const previewElement = document.getElementById("specimen-preview");
      if (!previewElement) {
        throw new Error("Preview element not found");
      }

      // Generate canvas from preview
      const canvas = await html2canvas(previewElement, {
        scale: 4, // Higher quality untuk logo lebih tajam
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true, // Allow cross-origin images
        allowTaint: false,
        imageTimeout: 15000, // Wait untuk logo load
      });

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error("Failed to generate image");
          }

          // Create download link
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `spesimen_${values.name
            .replace(/[^a-zA-Z0-9]/g, "_")
            .toLowerCase()}_${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          message.success({
            content: "Spesimen berhasil dibuat dan didownload!",
            key: "generate",
          });
          setIsGenerating(false);
        },
        "image/png",
        1.0 // Max quality
      );
    } catch (error) {
      console.error("Error generating specimen:", error);
      message.error({
        content: error?.message || "Gagal membuat spesimen",
        key: "generate",
      });
      setIsGenerating(false);
    }
  };

  // Preview Component
  const PreviewPanel = () => {
    const currentDate = dayjs().format("DD MMMM YYYY");

    return (
      <Card
        title={
          <Flex align="center" gap="small">
            <EyeOutlined style={{ color: "#FF4500" }} />
            <span>Preview Real-time</span>
          </Flex>
        }
        style={{
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
        styles={{
          header: {
            borderBottom: "2px solid #f0f0f0",
            background: "#fafafa",
          },
          body: {
            padding: "16px",
          },
        }}
      >
        <div
          id="specimen-preview"
          style={{
            width: "420px",
            height: "130px",
            margin: "0 auto",
            background: "white",
            border: "1px solid #808080",
            borderRadius: "10px",
            padding: "12px 16px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxSizing: "border-box",
          }}
        >
          {/* Logo - tanpa border, natural size */}
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              height: `${LOGO_HEIGHT_PX}px`,
              width: `${LOGO_WIDTH_PX}px`,
            }}
          >
            <img
              src={LOGO_URL}
              alt="Logo"
              crossOrigin="anonymous"
              style={{
                height: "100%",
                width: "100%",
                objectFit: "contain",
                imageRendering: "high-quality",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* Text Content */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.35,
              height: `${LOGO_HEIGHT_PX}px`,
              justifyContent: "space-between",
            }}
          >
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: "#4b5563",
                  fontWeight: 400,
                  marginBottom: "2px",
                }}
              >
                Ditandatangani secara elektronik oleh:
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#000",
                  fontWeight: 400,
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.2px",
                }}
              >
                {formValues.position || "NAMA JABATAN"}
              </div>
            </div>
            <div
              style={{
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#000",
                  textTransform: "none",
                  letterSpacing: "0.2px",
                  marginBottom: "2px",
                }}
              >
                {formValues.name || "Nama dan Gelar"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#1f2937",
                  fontWeight: 400,
                }}
              >
                {formValues.rank || "Pangkat"}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <IdcardOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Spesimen Tanda Tangan
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Generate spesimen tanda tangan digital untuk verifikasi
            </Text>
          </div>

          {/* Info Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Flex vertical gap="small">
              <Text style={{ fontSize: "16px", color: "#6b7280" }}>
                Sistem akan membuat dokumen spesimen tanda tangan dalam format
                PNG
              </Text>
              <Text style={{ fontSize: "14px", color: "#9ca3af" }}>
                • Dokumen compact dalam format landscape
              </Text>
              <Text style={{ fontSize: "14px", color: "#9ca3af" }}>
                • Hanya input text (nama, jabatan, pangkat)
              </Text>
              <Text style={{ fontSize: "14px", color: "#9ca3af" }}>
                • File PNG langsung terdownload setelah generate
              </Text>
            </Flex>
          </div>

          {/* Form Section */}
          <div style={{ marginTop: "24px" }}>
            <Row gutter={[24, 24]}>
              {/* Left Column - Form */}
              <Col xs={24} lg={14} xl={12}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleFinish}
                  initialValues={{}}
                >
                  <Flex vertical gap="middle">
                    {/* Personal Info Section */}
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          label={
                            <Text style={{ fontWeight: 600, color: "#6b7280" }}>
                              Nama Lengkap (dengan Gelar)
                            </Text>
                          }
                          name="name"
                          rules={[
                            { required: true, message: "Nama wajib diisi!" },
                            { min: 3, message: "Minimal 3 karakter!" },
                            {
                              max: 100,
                              message: "Maksimal 100 karakter!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Contoh: ANDRI FITRI LESTARI, S.Kom"
                            maxLength={100}
                            showCount
                            style={{ borderRadius: 6 }}
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <Text style={{ fontWeight: 600, color: "#6b7280" }}>
                              Jabatan
                            </Text>
                          }
                          name="position"
                          rules={[
                            {
                              required: true,
                              message: "Jabatan wajib diisi!",
                            },
                            { min: 3, message: "Minimal 3 karakter!" },
                            {
                              max: 150,
                              message: "Maksimal 150 karakter!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Contoh: KEPALA BIDANG"
                            maxLength={150}
                            showCount
                            style={{ borderRadius: 6 }}
                            size="large"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
                        <Form.Item
                          label={
                            <Text style={{ fontWeight: 600, color: "#6b7280" }}>
                              Pangkat
                            </Text>
                          }
                          name="rank"
                          rules={[
                            {
                              required: true,
                              message: "Pangkat wajib diisi!",
                            },
                            { min: 3, message: "Minimal 3 karakter!" },
                            {
                              max: 100,
                              message: "Maksimal 100 karakter!",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Contoh: Pembina Tk. I (IV/b)"
                            maxLength={100}
                            showCount
                            style={{ borderRadius: 6 }}
                            size="large"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider style={{ margin: "16px 0" }} />

                    {/* Action Buttons */}
                    <Flex justify="center" gap="middle">
                      <Button
                        onClick={() => {
                          form.resetFields();
                        }}
                        style={{
                          borderRadius: 6,
                          height: 44,
                          paddingInline: 32,
                          fontWeight: 500,
                        }}
                        size="large"
                      >
                        Reset
                      </Button>

                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isGenerating}
                        icon={<DownloadOutlined />}
                        style={{
                          background: "#FF4500",
                          borderColor: "#FF4500",
                          borderRadius: 6,
                          height: 44,
                          paddingInline: 32,
                          fontWeight: 500,
                        }}
                        size="large"
                      >
                        Generate & Download Spesimen
                      </Button>
                    </Flex>
                  </Flex>
                </Form>
              </Col>

              {/* Right Column - Preview */}
              <Col xs={24} lg={10} xl={12}>
                <div style={{ position: "sticky", top: "24px" }}>
                  <PreviewPanel />
                </div>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Info Card */}
        <Card
          style={{
            marginTop: 16,
            borderRadius: 8,
            background: "#f9fafb",
            border: "1px solid #e5e7eb",
          }}
        >
          <Flex gap="middle" align="start">
            <SafetyOutlined
              style={{ fontSize: 20, color: "#FF4500", marginTop: 4 }}
            />
            <Flex vertical gap="small" style={{ flex: 1 }}>
              <Text style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>
                Tentang Spesimen Tanda Tangan
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280" }}>
                Spesimen tanda tangan adalah dokumen contoh yang berisi
                informasi identitas dan tanda tangan resmi untuk keperluan
                verifikasi dan administrasi kepegawaian.
              </Text>
              <Text style={{ fontSize: 13, color: "#6b7280" }}>
                Dokumen yang dihasilkan berformat PNG dengan kualitas tinggi dan
                sudah teroptimasi untuk pencetakan maupun penggunaan digital.
              </Text>
            </Flex>
          </Flex>
        </Card>
      </div>
    </div>
  );
}

export default SpecimenForm;
