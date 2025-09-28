import {
  Form,
  Input,
  Upload,
  Button,
  Card,
  message,
  Switch,
  Select,
  Radio,
  Divider,
  Steps,
  Flex,
  Row,
  Col,
  Grid,
  Typography,
  Space,
} from "antd";
import { Text } from "@mantine/core";
import {
  InboxOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import { useRouter } from "next/router";
import { useCreateDocument } from "@/hooks/esign-bkd";

const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;
const { Title } = Typography;
const { useBreakpoint } = Grid;

function DocumentForm() {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const isXs = !screens?.sm;
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [signers, setSigners] = useState([]);
  const [workflowType, setWorkflowType] = useState("self");

  const { mutateAsync: createDocument, isLoading } = useCreateDocument();

  const handleFinish = async (values) => {
    try {
      if (fileList.length === 0) {
        message.error("Silakan upload file PDF terlebih dahulu");
        return;
      }

      const formData = {
        ...values,
        workflow_type: workflowType,
        signers: workflowType !== "self" ? signers : [],
      };

      const file = fileList[0]?.originFileObj || fileList[0];
      await createDocument({ data: formData, file });

      message.success("Dokumen berhasil diupload dan workflow telah diatur");
      router.push("/esign-bkd/documents");
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Gagal mengupload dokumen";
      message.error(errorMessage);
    }
  };

  const addSigner = () => {
    setSigners([...signers, { id: Date.now(), email: "", role: "signer" }]);
  };

  const removeSigner = (id) => {
    setSigners(signers.filter((signer) => signer.id !== id));
  };

  const updateSigner = (id, field, value) => {
    setSigners(
      signers.map((signer) =>
        signer.id === id ? { ...signer, [field]: value } : signer
      )
    );
  };

  const steps = [
    {
      title: "Upload Dokumen",
      icon: <FileTextOutlined />,
    },
    {
      title: "Pengaturan",
      icon: <SettingOutlined />,
    },
    {
      title: "Workflow",
      icon: <TeamOutlined />,
    },
  ];

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
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Flex vertical gap="large">
            <Card size="small" title="Upload File PDF">
              <Dragger {...uploadProps}>
                <Flex vertical align="center" style={{ padding: "40px 24px" }}>
                  <InboxOutlined
                    style={{ fontSize: 64, color: "#1890ff", marginBottom: 24 }}
                  />
                  <Title
                    level={4}
                    style={{ marginBottom: 8, color: "#1890ff" }}
                  >
                    Upload File PDF
                  </Title>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#8e8e93",
                      textAlign: "center",
                    }}
                  >
                    Klik atau seret file PDF ke area ini untuk upload
                    <br />
                    Maksimal ukuran 25MB
                  </Text>
                </Flex>
              </Dragger>

              {fileList.length > 0 && (
                <Flex
                  align="center"
                  gap="middle"
                  style={{
                    marginTop: 20,
                    padding: 16,
                    background:
                      "linear-gradient(90deg, #e6f7ff 0%, #f0f9ff 100%)",
                    borderRadius: 12,
                    border: "1px solid #91d5ff",
                  }}
                >
                  <FileTextOutlined
                    style={{ color: "#1890ff", fontSize: 24 }}
                  />
                  <Flex vertical style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 600, fontSize: 14 }}>
                      {fileList[0].name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#8e8e93" }}>
                      {(fileList[0].size / 1024 / 1024).toFixed(2)} MB • PDF
                    </Text>
                  </Flex>
                </Flex>
              )}
            </Card>
          </Flex>
        );

      case 1:
        return (
          <Flex vertical gap="large">
            <Card size="small" title="Informasi Dokumen">
              <Flex vertical gap="large">
                <Form.Item
                  label="Judul Dokumen"
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
                  />
                </Form.Item>

                <Form.Item
                  label="Deskripsi"
                  name="description"
                  rules={[{ max: 500, message: "Maksimal 500 karakter!" }]}
                >
                  <TextArea
                    placeholder="Deskripsi dokumen (opsional)"
                    rows={3}
                    maxLength={500}
                    showCount
                  />
                </Form.Item>

                <Flex justify="space-between" align="center">
                  <Flex vertical>
                    <Text style={{ fontWeight: 600 }}>Dokumen Publik</Text>
                    <Text style={{ fontSize: 14, color: "#8e8e93" }}>
                      Dokumen dapat dilihat oleh pengguna lain
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
              </Flex>
            </Card>
          </Flex>
        );

      case 2:
        return (
          <Flex vertical gap="large">
            <Card size="small" title="Pilih Jenis Workflow">
              <Radio.Group
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value)}
                style={{ width: "100%" }}
              >
                <Flex vertical gap="middle">
                  <Radio value="self">
                    <Flex vertical style={{ marginLeft: 8 }}>
                      <Flex
                        align="center"
                        gap="small"
                        style={{ fontWeight: 500 }}
                      >
                        <UserOutlined /> Tanda Tangan Mandiri
                      </Flex>
                      <Text style={{ fontSize: 14, color: "#8e8e93" }}>
                        Saya akan menandatangani dokumen ini sendiri
                      </Text>
                    </Flex>
                  </Radio>

                  <Radio value="sequential">
                    <Flex vertical style={{ marginLeft: 8 }}>
                      <Flex
                        align="center"
                        gap="small"
                        style={{ fontWeight: 500 }}
                      >
                        <TeamOutlined /> Sequential (Berurutan)
                      </Flex>
                      <Text style={{ fontSize: 14, color: "#8e8e93" }}>
                        Penandatangan dilakukan secara berurutan sesuai urutan
                      </Text>
                    </Flex>
                  </Radio>

                  <Radio value="parallel">
                    <Flex vertical style={{ marginLeft: 8 }}>
                      <Flex
                        align="center"
                        gap="small"
                        style={{ fontWeight: 500 }}
                      >
                        <TeamOutlined /> Parallel (Bersamaan)
                      </Flex>
                      <Text style={{ fontSize: 14, color: "#8e8e93" }}>
                        Semua penandatangan dapat menandatangani bersamaan
                      </Text>
                    </Flex>
                  </Radio>
                </Flex>
              </Radio.Group>
            </Card>

            {workflowType !== "self" && (
              <Card
                size="small"
                title="Daftar Penandatangan"
                extra={
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={addSigner}
                  >
                    Tambah
                  </Button>
                }
              >
                {signers.length === 0 ? (
                  <Flex justify="center" style={{ padding: "32px 0" }}>
                    <Text style={{ color: "#8e8e93" }}>
                      Belum ada penandatangan
                    </Text>
                  </Flex>
                ) : (
                  <Flex vertical gap="middle">
                    {signers.map((signer, index) => (
                      <Flex
                        key={signer.id}
                        align="center"
                        gap="middle"
                        style={{
                          padding: 12,
                          border: "1px solid #d9d9d9",
                          borderRadius: 8,
                        }}
                      >
                        <Flex
                          align="center"
                          justify="center"
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: "#e6f7ff",
                            borderRadius: "50%",
                            fontSize: 14,
                            fontWeight: 500,
                            flexShrink: 0,
                          }}
                        >
                          {workflowType === "sequential" ? (
                            index + 1
                          ) : (
                            <UserOutlined />
                          )}
                        </Flex>

                        <Flex gap="middle" style={{ flex: 1 }}>
                          <Input
                            placeholder="Email penandatangan"
                            value={signer.email}
                            onChange={(e) =>
                              updateSigner(signer.id, "email", e.target.value)
                            }
                            style={{ flex: 1 }}
                          />

                          <Select
                            value={signer.role}
                            onChange={(value) =>
                              updateSigner(signer.id, "role", value)
                            }
                            style={{ width: 120 }}
                          >
                            <Option value="reviewer">Reviewer</Option>
                            <Option value="signer">Signer</Option>
                            <Option value="approver">Approver</Option>
                          </Select>
                        </Flex>

                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => removeSigner(signer.id)}
                          danger
                        />
                      </Flex>
                    ))}
                  </Flex>
                )}
              </Card>
            )}
          </Flex>
        );

      default:
        return null;
    }
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
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
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
                <Text style={{ fontSize: 16, color: "#6b7280" }}>
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
                    background: "#FF4500",
                    borderColor: "#FF4500",
                    color: "white",
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
          <div style={{ marginTop: "16px" }}>
            <Steps
              current={currentStep}
              items={steps}
              style={{
                marginBottom: 32,
                padding: "0 16px",
              }}
              size="default"
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{ is_public: false }}
            >
              {renderStepContent()}

              <Divider />

              <Flex justify="space-between" style={{ marginTop: 24 }}>
                <Button
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep(currentStep - 1)}
                  style={{
                    borderRadius: 6,
                    height: 40,
                    paddingInline: 20,
                    fontWeight: 500,
                  }}
                >
                  Sebelumnya
                </Button>

                <Flex gap="middle">
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

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="primary"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      disabled={currentStep === 0 && fileList.length === 0}
                      style={{
                        background: "#FF4500",
                        borderColor: "#FF4500",
                        borderRadius: 6,
                        height: 40,
                        paddingInline: 20,
                        fontWeight: 500,
                      }}
                    >
                      Selanjutnya
                    </Button>
                  ) : (
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
                      Buat Dokumen
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Form>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default DocumentForm;
