import {
  BranchesOutlined,
  SaveOutlined,
  SendOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import {
  Card,
  Col,
  Flex,
  Form,
  Grid,
  message,
  Row,
  Spin,
  Typography,
  Button,
  Input,
  Space,
  Alert,
} from "antd";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import KnowledgeFormTitle from "./KnowledgeFormTitle";
import KnowledgeFormSummary from "./KnowledgeFormSummary"; 
import KnowledgeFormContent from "./KnowledgeFormContent";
import KnowledgeFormCategory from "./KnowledgeFormCategory";
import KnowledgeFormTags from "./KnowledgeFormTags";
import KnowledgeFormReferences from "./KnowledgeFormReferences";
import KnowledgeFormAttachments from "./KnowledgeFormAttachments";
import KnowledgeFormType from "./KnowledgeFormType";
import KnowledgeFormSourceUrl from "./KnowledgeFormSourceUrl";
import KnowledgeFormMedia from "./KnowledgeFormMedia";
import RevisionStatusIndicator from "../components/RevisionStatusIndicator";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;
const { TextArea } = Input;

function RevisionForm({
  initialData = null, // revision data
  originalContent = null, // original content for comparison
  onSave = () => {},
  onSubmit = () => {},
  onCancel = () => {},
  isLoading = false,
  isSaving = false,
  isSubmitting = false,
}) {
  const router = useRouter();
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [content, setContent] = useState("");
  const [contentType, setContentType] = useState("teks");
  const [mediaFile, setMediaFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [changeNotes, setChangeNotes] = useState("");

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Watch for type changes
  const watchedType = Form.useWatch("type", form);
  
  useEffect(() => {
    if (watchedType && watchedType !== contentType) {
      setContentType(watchedType);
    }
  }, [watchedType, contentType]);

  // Set initial data from revision
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: initialData.title,
        summary: initialData.summary,
        category_id: initialData.category_id,
        type: initialData.type || "teks",
        source_url: initialData.source_url || "",
      });

      if (initialData.content) {
        setContent(initialData.content);
      }

      if (initialData.type) {
        setContentType(initialData.type);
      }

      if (initialData.tags) {
        setTags(initialData.tags);
      }

      if (initialData.references) {
        form.setFieldValue('references', initialData.references);
      }

      if (initialData.change_notes) {
        setChangeNotes(initialData.change_notes);
      }

      // Handle attachments if any
      if (initialData.attachments) {
        const mappedFiles = initialData.attachments.map((attachment, index) => ({
          uid: `-${index}`,
          name: attachment.filename || attachment.name,
          status: 'done',
          url: attachment.url,
          response: {
            data: { url: attachment.url }
          }
        }));
        setFileList(mappedFiles);
      }

      // Handle media file
      if (initialData.source_url && ['video', 'audio', 'gambar'].includes(initialData.type)) {
        setMediaFile({
          uid: 'existing-media',
          name: initialData.title || 'Media File',
          status: 'done',
          url: initialData.source_url,
          type: initialData.type
        });
      }
    }
  }, [initialData, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        content,
        tags,
        references: values.references || [],
        changeNotes,
      };
      onSave(formData);
    } catch (error) {
      if (error.errorFields) {
        message.warning("Mohon lengkapi field yang wajib diisi");
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        content,
        tags,
        references: values.references || [],
        changeNotes,
      };
      onSubmit(formData);
    } catch (error) {
      if (error.errorFields) {
        message.error("Mohon lengkapi semua field yang wajib diisi");
      }
    }
  };

  const formatVersion = (version) => {
    return version ? `v${version}` : "Draft";
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
        <Text style={{ display: "block", marginTop: "16px", color: "#666" }}>
          Memuat data revisi...
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[isMobile ? 12 : 16, isMobile ? 12 : 16]}>
        <Col span={24}>
          <Card
            style={{
              width: "100%",
              borderRadius: isMobile ? "8px" : "12px",
              border: "1px solid #EDEFF1",
              marginBottom: isMobile ? "12px" : "16px",
            }}
            styles={{ body: { padding: 0 } }}
          >
            <Flex>
              {/* Icon Section - Hide on mobile */}
              {!isMobile && (
                <div
                  style={{
                    width: "40px",
                    backgroundColor: "#F8F9FA",
                    borderRight: "1px solid #EDEFF1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "700px",
                  }}
                >
                  <BranchesOutlined
                    style={{ color: "#1890FF", fontSize: "18px" }}
                  />
                </div>
              )}

              {/* Content Section */}
              <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                  <Flex justify="space-between" align="flex-start" style={{ marginBottom: "12px" }}>
                    <div>
                      <Flex align="center" gap="12px" style={{ marginBottom: "8px" }}>
                        <Title level={4} style={{ margin: 0, color: "#1A1A1B" }}>
                          Edit Revisi {formatVersion(initialData?.version)}
                        </Title>
                        {initialData?.status && (
                          <RevisionStatusIndicator status={initialData.status} />
                        )}
                      </Flex>
                      <Text style={{ color: "#787C7E", fontSize: "14px" }}>
                        Perbarui konten revisi dan simpan perubahan Anda
                      </Text>
                    </div>
                    
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={onCancel}
                      style={{ color: "#6B7280" }}
                    >
                      Kembali
                    </Button>
                  </Flex>

                  {/* Original content reference */}
                  {originalContent && (
                    <Alert
                      message="Referensi Konten Asli"
                      description={
                        <Text style={{ fontSize: "13px" }}>
                          Membuat revisi dari: <strong>{originalContent.title}</strong> (v{originalContent.version || "1.0"})
                        </Text>
                      }
                      type="info"
                      showIcon
                      style={{
                        backgroundColor: "#E6F4FF",
                        border: "1px solid #BAE6FD",
                        marginBottom: "20px",
                      }}
                    />
                  )}
                </div>

                {/* Form */}
                <Form form={form} layout="vertical">
                  <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 16]}>
                    <Col xs={24} lg={16}>
                      <KnowledgeFormTitle isMobile={isMobile} />
                      <KnowledgeFormType isMobile={isMobile} />
                      {['video', 'audio', 'gambar'].includes(contentType) ? (
                        <KnowledgeFormMedia
                          isMobile={isMobile}
                          contentType={contentType}
                          mediaFile={mediaFile}
                          setMediaFile={setMediaFile}
                        />
                      ) : (
                        <KnowledgeFormSourceUrl 
                          isMobile={isMobile} 
                          contentType={contentType} 
                        />
                      )}
                      <KnowledgeFormSummary isMobile={isMobile} />
                      <KnowledgeFormContent 
                        isMobile={isMobile} 
                        content={content} 
                        setContent={setContent} 
                      />
                      
                      {/* Change Notes */}
                      <Form.Item
                        label="Catatan Perubahan"
                        style={{ marginBottom: "20px" }}
                      >
                        <TextArea
                          value={changeNotes}
                          onChange={(e) => setChangeNotes(e.target.value)}
                          placeholder="Jelaskan perubahan yang Anda buat (opsional)..."
                          rows={3}
                          style={{
                            backgroundColor: "#FAFBFC",
                            border: "1px solid #E1E8ED",
                            borderRadius: "6px",
                          }}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                      <KnowledgeFormCategory isMobile={isMobile} />
                      <KnowledgeFormTags
                        isMobile={isMobile}
                        tags={tags}
                        setTags={setTags}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                      />
                      <KnowledgeFormReferences isMobile={isMobile} />
                      <KnowledgeFormAttachments
                        isMobile={isMobile}
                        fileList={fileList}
                        setFileList={setFileList}
                        contentId={initialData?.content_id}
                      />
                    </Col>
                  </Row>

                  {/* Actions */}
                  <div
                    style={{
                      borderTop: "1px solid #EDEFF1",
                      paddingTop: "20px",
                      marginTop: "20px",
                    }}
                  >
                    <Flex justify="space-between" align="center">
                      <Text style={{ color: "#787C7E", fontSize: "13px" }}>
                        Simpan sebagai draft atau submit untuk review
                      </Text>

                      <Space size="middle">
                        <Button
                          icon={<SaveOutlined />}
                          onClick={handleSave}
                          loading={isSaving}
                          style={{
                            borderColor: "#52C41A",
                            color: "#52C41A",
                            fontWeight: 600,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSaving) {
                              e.currentTarget.style.backgroundColor = "#52C41A";
                              e.currentTarget.style.color = "white";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSaving) {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#52C41A";
                            }
                          }}
                        >
                          {isSaving ? "Menyimpan..." : "Simpan Draft"}
                        </Button>

                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSubmit}
                          loading={isSubmitting}
                          style={{
                            backgroundColor: "#1890FF",
                            borderColor: "#1890FF",
                            fontWeight: 600,
                          }}
                        >
                          {isSubmitting ? "Mengirim..." : "Submit untuk Review"}
                        </Button>
                      </Space>
                    </Flex>
                  </div>
                </Form>
              </div>
            </Flex>
          </Card>
        </Col>
      </Row>

      {/* Global Styles */}
      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 8px !important;
        }

        .ant-card:hover {
          border-color: #1890ff !important;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15) !important;
        }

        .ant-input:focus,
        .ant-input-focused,
        .ant-select-focused .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }

        .ant-btn-primary {
          background: linear-gradient(
            135deg,
            #1890ff 0%,
            #40a9ff 100%
          ) !important;
          border-color: #1890ff !important;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.3) !important;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(
            135deg,
            #0f7ae5 0%,
            #1890ff 100%
          ) !important;
          border-color: #0f7ae5 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(24, 144, 255, 0.4) !important;
          transition: all 0.2s ease !important;
        }
      `}</style>
    </div>
  );
}

export default RevisionForm;