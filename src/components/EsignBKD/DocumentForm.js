import { useCreateDocument } from "@/hooks/esign-bkd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  InboxOutlined,
  SafetyOutlined,
  SaveOutlined,
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
  Switch,
  Typography,
  Upload,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Title } = Typography;
const { useBreakpoint } = Grid;

function DocumentForm() {
  const router = useRouter();
  const screens = useBreakpoint();
  const isXs = !screens?.sm;
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  const { mutateAsync: createDocument, isLoading } = useCreateDocument();

  const handleFinish = async (values) => {
    try {
      console.log("Form values received:", values); // Debug log

      // Final validation
      if (fileList.length === 0) {
        message.error("Silakan upload file PDF terlebih dahulu");
        return;
      }

      // Step 1: Create document only
      const documentData = {
        title: values.title,
        description: values.description || "",
        is_public: values.is_public || false,
        is_add_footer: values.is_add_footer || false,
      };

      const file = fileList[0]?.originFileObj || fileList[0];
      const documentResult = await createDocument({ data: documentData, file });

      message.success("Dokumen berhasil diupload");
      // Navigate to step 2: Signature setup page
      router.push(
        `/esign-bkd/documents/create?documentId=${documentResult.data.id}`
      );
    } catch (error) {
      console.error("Error creating document:", error);
      const errorMessage =
        error?.response?.data?.message || "Gagal mengupload dokumen";
      message.error(errorMessage);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    fileList,
    maxCount: 1,
    accept: ".pdf",
    beforeUpload: (file) => {
      const isPDF = file.type === "application/pdf";
      if (!isPDF) {
        message.error("Hanya file PDF yang diperbolehkan!");
        return false;
      }

      const isLt25M = file.size / 1024 / 1024 < 25;
      if (!isLt25M) {
        message.error("Ukuran file tidak boleh lebih dari 25MB!");
        return false;
      }

      setFileList([
        {
          uid: file.uid || String(Date.now()),
          name: file.name,
          status: "done",
          size: file.size,
          type: file.type,
          originFileObj: file,
        },
      ]);

      // Auto-fill title from filename (remove .pdf extension)
      const fileName = file.name.replace(/\.pdf$/i, "");
      form.setFieldsValue({ title: fileName });

      return false;
    },
    onRemove: () => {
      setFileList([]);
      // Clear title when file is removed
      form.setFieldsValue({ title: "" });
    },
  };

  const renderStepContent = () => {
    return (
      <div style={{ padding: "0" }}>
        <Flex vertical gap="middle">
          {/* Upload Section */}
          <div>
            <Text
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: 8,
                display: "block",
              }}
            >
              Upload File PDF
            </Text>
            <Dragger {...uploadProps}>
              <Flex vertical align="center" style={{ padding: "16px 12px" }}>
                <InboxOutlined
                  style={{ fontSize: 36, color: "#FF4500", marginBottom: 8 }}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: "#FF4500",
                    marginBottom: 2,
                    fontWeight: 500,
                  }}
                >
                  Upload File PDF
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  Klik atau seret file • Maksimal 25MB
                </Text>
              </Flex>
            </Dragger>

            {fileList.length > 0 && (
              <Flex
                align="center"
                gap="middle"
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: "#f0f5ff",
                  borderRadius: 6,
                  border: "1px solid #adc6ff",
                }}
              >
                <FileTextOutlined style={{ color: "#FF4500", fontSize: 20 }} />
                <Flex vertical style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 600, fontSize: 14 }}>
                    {fileList[0].name}
                  </Text>
                  <Text style={{ fontSize: 12, color: "#6b7280" }}>
                    {(fileList[0].size / 1024 / 1024).toFixed(2)} MB • PDF
                  </Text>
                </Flex>
              </Flex>
            )}
          </div>

          <Divider style={{ margin: "12px 0" }} />

          {/* Document Info Section */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <Text style={{ fontWeight: 600, color: "#6b7280" }}>
                    Judul Dokumen
                  </Text>
                }
                name="title"
                rules={[
                  { required: true, message: "Judul wajib diisi!" },
                  { min: 3, message: "Minimal 3 karakter!" },
                ]}
              >
                <Input
                  placeholder="Masukkan judul dokumen"
                  maxLength={200}
                  showCount
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                label={
                  <Text style={{ fontWeight: 600, color: "#6b7280" }}>
                    Deskripsi
                  </Text>
                }
                name="description"
                rules={[{ max: 500, message: "Maksimal 500 karakter!" }]}
              >
                <TextArea
                  placeholder="Deskripsi dokumen (opsional)"
                  rows={3}
                  maxLength={500}
                  showCount
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <div style={{ paddingTop: "30px" }}>
                <Flex vertical gap="middle">
                  <Flex justify="space-between" align="center">
                    <Flex vertical>
                      <Text
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#6b7280",
                        }}
                      >
                        Dokumen Publik
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                        Dapat dilihat pengguna lain
                      </Text>
                    </Flex>
                    <Form.Item
                      name="is_public"
                      valuePropName="checked"
                      style={{ margin: 0 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Flex>

                  <Flex justify="space-between" align="center">
                    <Flex vertical>
                      <Text
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#6b7280",
                        }}
                      >
                        Tambah Footer
                      </Text>
                      <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                        Logo BSrE dan teks footer
                      </Text>
                    </Flex>
                    <Form.Item
                      name="is_add_footer"
                      valuePropName="checked"
                      style={{ margin: 0 }}
                    >
                      <Switch />
                    </Form.Item>
                  </Flex>
                </Flex>
              </div>
            </Col>
          </Row>
        </Flex>
      </div>
    );
  };

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
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
            <SafetyOutlined style={{ fontSize: "24px", marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Upload Dokumen Baru
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Buat dan atur workflow tanda tangan elektronik
            </Text>
          </div>

          {/* Action Button Section */}
          <div
            style={{
              padding: "20px 0 16px 0",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Row gutter={[12, 12]} align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <Text style={{ fontSize: "16px", color: "#6b7280" }}>
                  Sistem upload dokumen dan pengaturan workflow tanda tangan
                </Text>
              </Col>
              <Col
                xs={24}
                md={8}
                style={{
                  display: "flex",
                  justifyContent: isXs ? "flex-start" : "flex-end",
                }}
              >
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.back()}
                  style={{
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "0 16px",
                  }}
                  block={isXs}
                >
                  Kembali
                </Button>
              </Col>
            </Row>
          </div>

          {/* Form Section */}
          <div style={{ marginTop: "12px" }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{ is_public: false, is_add_footer: false }}
            >
              {renderStepContent()}

              <Divider style={{ margin: "16px 0" }} />

              <Flex justify="space-between" style={{ marginTop: 16 }}>
                <Button
                  onClick={() => router.back()}
                  style={{
                    borderRadius: 6,
                    height: 40,
                    paddingInline: 20,
                    fontWeight: 500,
                  }}
                >
                  Batal
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<SaveOutlined />}
                  style={{
                    background: "#FF4500",
                    borderColor: "#FF4500",
                    borderRadius: 6,
                    height: 40,
                    paddingInline: 20,
                    fontWeight: 500,
                  }}
                >
                  Lanjutkan ke Pengaturan TTE
                </Button>
              </Flex>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DocumentForm;
