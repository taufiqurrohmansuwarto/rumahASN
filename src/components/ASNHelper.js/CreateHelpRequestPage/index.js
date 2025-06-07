import {
  Form,
  Input,
  Tag,
  Flex,
  Row,
  Col,
  Card,
  Typography,
  Button,
  message,
  Space,
  List,
} from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  SendOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  MessageOutlined,
} from "@ant-design/icons";

// Import components
import CategorySelector from "./CategorySelector";
import UrgencyPicker from "./UrgencyPicker";
import ContentEditor from "./ContentEditor";
import AttachmentUploader from "./AttachmentUploader";
import SimilarQuestionsChecker from "./SimilarQuestionsChecker";

const { Text, Title } = Typography;

const CreateHelpRequestPage = ({
  formConfig,
  helpTips,
  recentSimilarRequests,
}) => {
  const [form] = Form.useForm();
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedUrgency, setSelectedUrgency] = useState(null);
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSimilarQuestions, setShowSimilarQuestions] = useState(false);
  const router = useRouter();

  // Show similar questions when title is sufficient
  useEffect(() => {
    const title = form.getFieldValue("title");
    if (title && title.length > 10) {
      setShowSimilarQuestions(true);
    } else {
      setShowSimilarQuestions(false);
    }
  }, [form]);

  const handleTagToggle = (tag) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    form.setFieldsValue({ category: categoryId });
  };

  const handleUrgencyChange = (urgencyId) => {
    setSelectedUrgency(urgencyId);
    form.setFieldsValue({ urgency: urgencyId });
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    form.setFieldsValue({ description: e.target.value });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        category: selectedCategory,
        urgency: selectedUrgency,
        description,
        tags: selectedTags,
        attachments,
      };

      console.log("Form values:", submitData);
      message.success("Permintaan bantuan berhasil dikirim!");
      router.push("/asn-connect/asn-helper/bantuan/saya");
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Gagal mengirim permintaan bantuan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "20px 0",
      }}
    >
      <Row justify="center">
        <Col xs={24} sm={23} md={22} lg={24} xl={24} xxl={18}>
          <Row gutter={20}>
            {/* Left Column - Form */}
            <Col xs={24} lg={18} xl={17}>
              {/* Create Help Header - Reddit Style */}
              <Card
                style={{
                  marginBottom: "8px",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  backgroundColor: "#FFFFFF",
                }}
                bodyStyle={{ padding: 0 }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #EDEFF1",
                    backgroundColor: "#F8F9FA",
                  }}
                >
                  <Flex align="center" gap={8}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#FF4500",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PlusOutlined
                        style={{ color: "white", fontSize: "12px" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#1A1A1B",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Buat Permintaan Bantuan Baru
                    </Text>
                  </Flex>
                </div>

                {/* Content */}
                <div style={{ padding: "16px" }}>
                  <Text style={{ color: "#787C7E", fontSize: "14px" }}>
                    Jelaskan masalah Anda dengan detail untuk mendapat bantuan
                    yang tepat
                  </Text>
                </div>
              </Card>

              {/* Similar Questions Checker */}
              {showSimilarQuestions && (
                <SimilarQuestionsChecker
                  similarQuestions={recentSimilarRequests}
                  showViewMore={true}
                />
              )}

              {/* Main Form Card */}
              <Card
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  padding: 0,
                  overflow: "hidden",
                }}
                bodyStyle={{ padding: 0 }}
                hoverable
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#898989";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#EDEFF1";
                }}
              >
                <div style={{ padding: "20px 24px" }}>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                  >
                    {/* Title Input */}
                    <Form.Item
                      name="title"
                      label={
                        <Text
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#1A1A1B",
                          }}
                        >
                          Judul Permintaan Bantuan
                        </Text>
                      }
                      rules={[
                        { required: true, message: "Judul harus diisi" },
                        { min: 10, message: "Judul minimal 10 karakter" },
                      ]}
                      style={{ marginBottom: "20px" }}
                    >
                      <Input
                        placeholder="Contoh: Butuh template SK pengangkatan CPNS terbaru"
                        style={{
                          fontSize: "15px",
                          height: "44px",
                          border: "1px solid #EDEFF1",
                        }}
                      />
                    </Form.Item>

                    {/* Category Selector */}
                    <CategorySelector
                      categories={formConfig?.categories}
                      selectedCategory={selectedCategory}
                      onCategorySelect={handleCategorySelect}
                    />

                    {/* Urgency Picker */}
                    <UrgencyPicker
                      urgencyLevels={formConfig?.urgencyLevels}
                      selectedUrgency={selectedUrgency}
                      onUrgencyChange={handleUrgencyChange}
                    />

                    {/* Content Editor */}
                    <ContentEditor
                      value={description}
                      onChange={handleDescriptionChange}
                      placeholder="Jelaskan masalah Anda secara detail..."
                    />

                    {/* Tags */}
                    <div style={{ marginBottom: "20px" }}>
                      <Text
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#1A1A1B",
                          display: "block",
                          marginBottom: "12px",
                        }}
                      >
                        Tags (Opsional)
                      </Text>
                      <Flex
                        wrap="wrap"
                        gap={8}
                        style={{ marginBottom: "12px" }}
                      >
                        {formConfig?.suggestedTags?.map((tag) => (
                          <Tag
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            style={{
                              cursor: "pointer",
                              fontSize: "13px",
                              padding: "6px 12px",
                              height: "28px",
                              lineHeight: "16px",
                              backgroundColor: selectedTags.includes(tag)
                                ? "#FF4500"
                                : "#F8F9FA",
                              color: selectedTags.includes(tag)
                                ? "white"
                                : "#787C7E",
                              border: selectedTags.includes(tag)
                                ? "1px solid #FF4500"
                                : "1px solid #EDEFF1",
                              borderRadius: "14px",
                              transition: "all 0.2s ease",
                            }}
                            onMouseEnter={(e) => {
                              if (!selectedTags.includes(tag)) {
                                e.currentTarget.style.backgroundColor =
                                  "#FF4500";
                                e.currentTarget.style.color = "white";
                                e.currentTarget.style.borderColor = "#FF4500";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!selectedTags.includes(tag)) {
                                e.currentTarget.style.backgroundColor =
                                  "#F8F9FA";
                                e.currentTarget.style.color = "#787C7E";
                                e.currentTarget.style.borderColor = "#EDEFF1";
                              }
                            }}
                          >
                            {tag.replace("_", " ")}
                          </Tag>
                        ))}
                      </Flex>
                      {selectedTags.length > 0 && (
                        <Text style={{ fontSize: "13px", color: "#787C7E" }}>
                          Dipilih: {selectedTags.join(", ")}
                        </Text>
                      )}
                    </div>

                    {/* Attachment Uploader */}
                    <AttachmentUploader
                      fileList={attachments}
                      onChange={({ fileList }) => setAttachments(fileList)}
                    />

                    {/* Submit Button */}
                    <div
                      style={{
                        marginTop: "24px",
                        paddingTop: "20px",
                        borderTop: "1px solid #EDEFF1",
                      }}
                    >
                      <Flex justify="flex-end">
                        <Button
                          type="primary"
                          htmlType="submit"
                          loading={loading}
                          icon={<SendOutlined />}
                          style={{
                            backgroundColor: "#FF4500",
                            borderColor: "#FF4500",
                            borderRadius: "20px",
                            fontWeight: 600,
                            fontSize: "14px",
                            height: "36px",
                            padding: "0 20px",
                            minWidth: "150px",
                          }}
                        >
                          Kirim Permintaan
                        </Button>
                      </Flex>
                    </div>
                  </Form>
                </div>
              </Card>
            </Col>

            {/* Right Column - Tips and Guidelines */}
            <Col xs={24} lg={6} xl={7}>
              {/* Tips Card */}
              <Card
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  padding: 0,
                  overflow: "hidden",
                }}
                bodyStyle={{ padding: 0 }}
                hoverable
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#898989";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#EDEFF1";
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #EDEFF1",
                    backgroundColor: "#F8F9FA",
                  }}
                >
                  <Flex align="center" gap={8}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#FF4500",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <BulbOutlined
                        style={{ color: "white", fontSize: "12px" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#1A1A1B",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Tips Membuat Permintaan
                    </Text>
                  </Flex>
                </div>

                {/* Content */}
                <div style={{ padding: "12px 16px" }}>
                  <List
                    size="small"
                    dataSource={
                      helpTips || [
                        {
                          id: 1,
                          title: "Judul yang Jelas",
                          description:
                            "Gunakan judul yang spesifik dan mudah dipahami",
                          icon: "📝",
                        },
                        {
                          id: 2,
                          title: "Detail Lengkap",
                          description:
                            "Jelaskan masalah dengan detail dan konteks yang cukup",
                          icon: "📋",
                        },
                        {
                          id: 3,
                          title: "Kategori Tepat",
                          description:
                            "Pilih kategori yang sesuai agar bantuan lebih tepat sasaran",
                          icon: "🎯",
                        },
                        {
                          id: 4,
                          title: "Lampiran Pendukung",
                          description:
                            "Sertakan screenshot atau dokumen jika diperlukan",
                          icon: "📎",
                        },
                      ]
                    }
                    renderItem={(item) => (
                      <List.Item style={{ padding: "10px 0", border: "none" }}>
                        <Flex gap={12} align="flex-start">
                          <span style={{ fontSize: "16px" }}>{item.icon}</span>
                          <Flex vertical gap={4}>
                            <Text
                              style={{
                                fontSize: "13px",
                                fontWeight: 700,
                                color: "#1A1A1B",
                                lineHeight: "18px",
                              }}
                            >
                              {item.title}
                            </Text>
                            <Text
                              style={{
                                fontSize: "13px",
                                color: "#787C7E",
                                lineHeight: "18px",
                              }}
                            >
                              {item.description}
                            </Text>
                          </Flex>
                        </Flex>
                      </List.Item>
                    )}
                  />
                </div>
              </Card>

              {/* Guidelines Card */}
              <Card
                style={{
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  marginBottom: "8px",
                  padding: 0,
                  overflow: "hidden",
                }}
                bodyStyle={{ padding: 0 }}
                hoverable
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#898989";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#EDEFF1";
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #EDEFF1",
                    backgroundColor: "#F8F9FA",
                  }}
                >
                  <Flex align="center" gap={8}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "#52C41A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CheckCircleOutlined
                        style={{ color: "white", fontSize: "12px" }}
                      />
                    </div>
                    <Text
                      strong
                      style={{
                        color: "#1A1A1B",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Panduan Komunitas
                    </Text>
                  </Flex>
                </div>

                {/* Content */}
                <div style={{ padding: "12px 16px" }}>
                  <Space direction="vertical" size={12}>
                    <div>
                      <Text
                        style={{
                          fontSize: "13px",
                          color: "#1A1A1B",
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: 700,
                        }}
                      >
                        ✅ Lakukan
                      </Text>
                      <Text style={{ fontSize: "13px", color: "#787C7E" }}>
                        Gunakan bahasa yang sopan dan profesional
                      </Text>
                    </div>

                    <div>
                      <Text
                        style={{
                          fontSize: "13px",
                          color: "#1A1A1B",
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: 700,
                        }}
                      >
                        ✅ Lakukan
                      </Text>
                      <Text style={{ fontSize: "13px", color: "#787C7E" }}>
                        Berikan apresiasi kepada yang membantu
                      </Text>
                    </div>

                    <div>
                      <Text
                        style={{
                          fontSize: "13px",
                          color: "#1A1A1B",
                          display: "block",
                          marginBottom: "4px",
                          fontWeight: 700,
                        }}
                      >
                        ❌ Hindari
                      </Text>
                      <Text style={{ fontSize: "13px", color: "#787C7E" }}>
                        Meminta informasi yang bersifat rahasia/pribadi
                      </Text>
                    </div>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: #898989 !important;
        }

        .ant-form-item-label > label {
          color: #1a1a1b !important;
          font-weight: 700 !important;
        }

        .ant-input {
          border: 1px solid #edeff1 !important;
        }

        .ant-input:hover {
          border-color: #ff4500 !important;
        }

        .ant-input:focus {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-btn-primary {
          background-color: #ff4500 !important;
          border-color: #ff4500 !important;
        }

        .ant-btn-primary:hover {
          background-color: #ff6533 !important;
          border-color: #ff6533 !important;
        }
      `}</style>
    </div>
  );
};

export default CreateHelpRequestPage;
