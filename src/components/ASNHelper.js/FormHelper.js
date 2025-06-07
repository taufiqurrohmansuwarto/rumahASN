import {
  PlusOutlined,
  QuestionCircleOutlined,
  SendOutlined,
  PaperClipOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Tag,
  Typography,
  Upload,
  Space,
  Divider,
  Alert,
} from "antd";
import { useState } from "react";
import { useRouter } from "next/router";

const { TextArea } = Input;
const { Text, Title } = Typography;

const FormHelper = ({ formConfig, helpTips, recentSimilarRequests }) => {
  const [form] = Form.useForm();
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Submit logic here
      console.log("Form values:", { ...values, tags: selectedTags });
      // Redirect to success page or show success message
      router.push("/asn-connect/asn-helper/bantuan/saya");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "very_urgent":
        return "#ff4d4f";
      case "urgent":
        return "#fa8c16";
      default:
        return "#52c41a";
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
        <Col xs={24} sm={22} md={20} lg={18} xl={16}>
          {/* Header Card */}
          <Card
            style={{
              marginBottom: "8px",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
              backgroundColor: "#FFFFFF",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Flex>
              {/* Icon Section */}
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 0",
                  borderRight: "1px solid #EDEFF1",
                }}
              >
                <PlusOutlined style={{ fontSize: 16, color: "#FF4500" }} />
              </div>

              {/* Content Section */}
              <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
                <Title
                  level={5}
                  style={{
                    margin: "0 0 4px 0",
                    color: "#1A1A1B",
                    fontSize: "16px",
                    fontWeight: 500,
                    lineHeight: "20px",
                  }}
                >
                  Buat Permintaan Bantuan Baru
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: "14px",
                    lineHeight: "18px",
                  }}
                >
                  Jelaskan masalah Anda dengan detail untuk mendapat bantuan
                  yang tepat
                </Text>
              </Flex>
            </Flex>
          </Card>

          {/* Help Tips Card */}
          <Card
            style={{
              marginBottom: "8px",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
              backgroundColor: "#FFFFFF",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Flex>
              <div
                style={{
                  width: "40px",
                  backgroundColor: "#F8F9FA",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 0",
                  borderRight: "1px solid #EDEFF1",
                }}
              >
                <BulbOutlined style={{ fontSize: 16, color: "#FAAD14" }} />
              </div>

              <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
                <Text
                  style={{
                    fontSize: "14px",
                    color: "#1A1A1B",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  Tips untuk Mendapat Bantuan Cepat
                </Text>
                {helpTips?.map((tip, index) => (
                  <Text
                    key={index}
                    style={{
                      fontSize: "13px",
                      color: "#787C7E",
                      lineHeight: "18px",
                      marginBottom: index < helpTips.length - 1 ? "4px" : 0,
                    }}
                  >
                    • {tip}
                  </Text>
                ))}
              </Flex>
            </Flex>
          </Card>

          {/* Main Form Card */}
          <Card
            style={{
              marginBottom: "8px",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
              backgroundColor: "#FFFFFF",
            }}
            bodyStyle={{ padding: "20px" }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="middle"
            >
              {/* Title */}
              <Form.Item
                name="title"
                label={
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
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
                    fontSize: "14px",
                    height: "40px",
                  }}
                />
              </Form.Item>

              {/* Category */}
              <Form.Item
                name="category"
                label={
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1B",
                    }}
                  >
                    Pilih Kategori
                  </Text>
                }
                rules={[{ required: true, message: "Pilih kategori" }]}
                style={{ marginBottom: "20px" }}
              >
                <Row gutter={[12, 12]}>
                  {formConfig?.categories?.map((category) => (
                    <Col xs={24} sm={12} md={8} key={category.id}>
                      <Card
                        hoverable
                        size="small"
                        style={{
                          border:
                            selectedCategory === category.id
                              ? "2px solid #FF4500"
                              : "1px solid #EDEFF1",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          backgroundColor:
                            selectedCategory === category.id
                              ? "#FFF2E8"
                              : "#FFFFFF",
                        }}
                        bodyStyle={{
                          padding: "12px 16px",
                          textAlign: "center",
                        }}
                        onClick={() => handleCategorySelect(category.id)}
                        className="category-card"
                      >
                        <div
                          style={{
                            fontSize: "24px",
                            marginBottom: "8px",
                          }}
                        >
                          {category.icon}
                        </div>
                        <Text
                          style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color:
                              selectedCategory === category.id
                                ? "#FF4500"
                                : "#1A1A1B",
                            display: "block",
                          }}
                        >
                          {category.name}
                        </Text>
                        {selectedCategory === category.id && (
                          <div
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              backgroundColor: "#FF4500",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CheckCircleOutlined
                              style={{
                                fontSize: "10px",
                                color: "white",
                              }}
                            />
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Form.Item>

              {/* Urgency */}
              <Form.Item
                name="urgency"
                label={
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1B",
                    }}
                  >
                    Tingkat Urgency
                  </Text>
                }
                rules={[{ required: true, message: "Pilih tingkat urgency" }]}
                style={{ marginBottom: "20px" }}
              >
                <Radio.Group style={{ width: "100%" }}>
                  <Space
                    direction="vertical"
                    size={8}
                    style={{ width: "100%" }}
                  >
                    {formConfig?.urgencyLevels?.map((level) => (
                      <Card
                        key={level.id}
                        size="small"
                        hoverable
                        style={{
                          border: "1px solid #EDEFF1",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                        bodyStyle={{ padding: "12px 16px" }}
                        className="urgency-card"
                      >
                        <Radio
                          value={level.id}
                          style={{
                            fontSize: "14px",
                            width: "100%",
                          }}
                        >
                          <Flex
                            justify="space-between"
                            align="center"
                            style={{ width: "100%" }}
                          >
                            <Flex vertical>
                              <Text
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: getUrgencyColor(level.id),
                                }}
                              >
                                {level.name}
                              </Text>
                              <Text
                                style={{ fontSize: "12px", color: "#787C7E" }}
                              >
                                {level.description}
                              </Text>
                            </Flex>
                          </Flex>
                        </Radio>
                      </Card>
                    ))}
                  </Space>
                </Radio.Group>
              </Form.Item>

              {/* Description */}
              <Form.Item
                name="description"
                label={
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1B",
                    }}
                  >
                    Deskripsi Detail
                  </Text>
                }
                rules={[
                  { required: true, message: "Deskripsi harus diisi" },
                  { min: 20, message: "Deskripsi minimal 20 karakter" },
                ]}
                style={{ marginBottom: "20px" }}
              >
                <TextArea
                  rows={4}
                  placeholder="Jelaskan masalah Anda secara detail..."
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                />
              </Form.Item>

              {/* Tags */}
              <div style={{ marginBottom: "20px" }}>
                <Text
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1A1A1B",
                    display: "block",
                    marginBottom: "12px",
                  }}
                >
                  Tags (Opsional)
                </Text>
                <Flex wrap="wrap" gap={8} style={{ marginBottom: "12px" }}>
                  {formConfig?.suggestedTags?.map((tag) => (
                    <Tag
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        cursor: "pointer",
                        fontSize: "12px",
                        padding: "4px 8px",
                        height: "28px",
                        lineHeight: "20px",
                        backgroundColor: selectedTags.includes(tag)
                          ? "#FF4500"
                          : "#F8F9FA",
                        color: selectedTags.includes(tag) ? "white" : "#787C7E",
                        border: selectedTags.includes(tag)
                          ? "1px solid #FF4500"
                          : "1px solid #EDEFF1",
                        borderRadius: "14px",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {tag.replace("_", " ")}
                    </Tag>
                  ))}
                </Flex>
                {selectedTags.length > 0 && (
                  <Text style={{ fontSize: "12px", color: "#787C7E" }}>
                    Dipilih: {selectedTags.join(", ")}
                  </Text>
                )}
              </div>

              {/* File Upload */}
              <Form.Item
                name="attachments"
                label={
                  <Text
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#1A1A1B",
                    }}
                  >
                    Lampiran (Opsional)
                  </Text>
                }
                style={{ marginBottom: "24px" }}
              >
                <Upload.Dragger
                  multiple
                  style={{
                    padding: "20px",
                    backgroundColor: "#FAFAFA",
                    border: "2px dashed #EDEFF1",
                    borderRadius: "6px",
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <PaperClipOutlined
                      style={{ fontSize: "24px", color: "#787C7E" }}
                    />
                  </p>
                  <p
                    className="ant-upload-text"
                    style={{
                      fontSize: "14px",
                      margin: "8px 0 4px 0",
                      color: "#1A1A1B",
                    }}
                  >
                    Klik atau drag file ke sini
                  </p>
                  <p
                    className="ant-upload-hint"
                    style={{ fontSize: "12px", color: "#787C7E", margin: 0 }}
                  >
                    Screenshot, dokumen, atau file pendukung lainnya
                  </p>
                </Upload.Dragger>
              </Form.Item>

              {/* Submit Button */}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SendOutlined />}
                  style={{
                    backgroundColor: "#FF4500",
                    borderColor: "#FF4500",
                    width: "100%",
                    height: "44px",
                    fontWeight: 600,
                    fontSize: "14px",
                    borderRadius: "6px",
                  }}
                >
                  Kirim Permintaan Bantuan
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Similar Requests Card */}
          {recentSimilarRequests && recentSimilarRequests.length > 0 && (
            <Card
              style={{
                border: "1px solid #EDEFF1",
                borderRadius: "4px",
                backgroundColor: "#FFFFFF",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <Flex>
                <div
                  style={{
                    width: "40px",
                    backgroundColor: "#F8F9FA",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "8px 0",
                    borderRight: "1px solid #EDEFF1",
                  }}
                >
                  <InfoCircleOutlined
                    style={{ fontSize: 16, color: "#1890FF" }}
                  />
                </div>

                <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#1A1A1B",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    Permintaan Serupa yang Sudah Diselesaikan
                  </Text>
                  {recentSimilarRequests.map((request) => (
                    <Flex
                      key={request.id}
                      justify="space-between"
                      align="center"
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#F8F9FA",
                        borderRadius: "4px",
                        marginBottom: "6px",
                        border: "1px solid #EDEFF1",
                      }}
                    >
                      <Text style={{ fontSize: "13px", color: "#1A1A1B" }}>
                        {request.title}
                      </Text>
                      <Flex align="center" gap={6}>
                        <CheckCircleOutlined
                          style={{ fontSize: "12px", color: "#52C41A" }}
                        />
                        <Text style={{ fontSize: "12px", color: "#787C7E" }}>
                          {request.resolvedTime}
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </Flex>
              </Flex>
            </Card>
          )}
        </Col>
      </Row>

      <style jsx global>{`
        .category-card {
          position: relative;
        }

        .category-card:hover {
          border-color: #ff4500 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 69, 0, 0.15);
        }

        .urgency-card:hover {
          border-color: #ff4500 !important;
        }

        .ant-radio-wrapper {
          width: 100% !important;
        }

        .ant-upload-drag {
          border: 2px dashed #edeff1 !important;
        }

        .ant-upload-drag:hover {
          border-color: #ff4500 !important;
        }

        .ant-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .ant-form-item-label > label {
          color: #1a1a1b !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  );
};

export default FormHelper;
