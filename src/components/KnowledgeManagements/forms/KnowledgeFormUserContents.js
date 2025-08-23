import {
  createKnowledgeContent,
  getKnowledgeCategories,
  updateKnowledgeContent,
} from "@/services/knowledge-management.services";
import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import {
  EditOutlined,
  PlusOutlined,
  SendOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Grid,
  Input,
  message,
  Row,
  Select,
  Tag,
  Typography,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function KnowledgeFormUserContents({
  initialData = null,
  onSuccess = () => {},
  onCancel = () => {},
  mode = "user", // "user" | "admin"
  queryKeysToInvalidate = ["fetch-knowledge-user-contents"], // customizable query keys
  showDraftButton = true, // show/hide draft button
  showSubmitButton = true, // show/hide submit button
  customButtonText = null, // { draft: "Custom Draft", submit: "Custom Submit", cancel: "Custom Cancel" }
  customTitle = null, // custom title text
  customSubtitle = null, // custom subtitle text
  useCreateMutation = null, // custom create mutation hook
  useUpdateMutation = null, // custom update mutation hook
}) {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  // Query untuk mengambil categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery(
    ["knowledge-categories"],
    () => getKnowledgeCategories(),
    {
      keepPreviousData: true,
    }
  );

  // Get button text based on mode and custom text
  const getButtonText = () => {
    const defaultTexts = {
      user: {
        draft: "Simpan Draft",
        submit: "Kirim untuk Review",
        cancel: "Batal"
      },
      admin: {
        draft: "Simpan",
        submit: "Perbarui",
        cancel: "Batal"
      }
    };
    
    return {
      draft: customButtonText?.draft || defaultTexts[mode].draft,
      submit: customButtonText?.submit || defaultTexts[mode].submit,
      cancel: customButtonText?.cancel || defaultTexts[mode].cancel
    };
  };

  const buttonText = getButtonText();

  // Use custom mutations or default ones
  const defaultCreateMutation = useMutation(
    (data) => createKnowledgeContent(data),
    {
      onSuccess: (data) => {
        const successMessage = mode === "admin" ? "Konten berhasil dibuat!" : "Konten berhasil dibuat!";
        message.success(successMessage);
        queryKeysToInvalidate.forEach(key => {
          queryClient.invalidateQueries([key]);
        });
        if (mode === "user") {
          form.resetFields();
          setTags([]);
          setContent("");
        }
        onSuccess(data);
      },
      onError: (error) => {
        message.error("Gagal membuat konten: " + error.message);
      },
    }
  );

  const defaultUpdateMutation = useMutation(
    ({ id, data }) => updateKnowledgeContent({ id, data }),
    {
      onSuccess: (data) => {
        const successMessage = mode === "admin" ? "Konten berhasil diperbarui!" : "Konten berhasil diperbarui!";
        message.success(successMessage);
        queryKeysToInvalidate.forEach(key => {
          queryClient.invalidateQueries([key]);
        });
        onSuccess(data);
      },
      onError: (error) => {
        message.error("Gagal memperbarui konten: " + error.message);
      },
    }
  );

  // Use provided hooks or default ones
  const createMutationHook = useCreateMutation || (() => defaultCreateMutation);
  const updateMutationHook = useUpdateMutation || (() => defaultUpdateMutation);

  const { mutate: createMutation, isLoading: createLoading } = createMutationHook();
  const { mutate: updateMutation, isLoading: updateLoading } = updateMutationHook();

  // Set initial data jika dalam mode edit
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: initialData.title,
        category_id: initialData.category_id,
      });

      if (initialData.content) {
        setContent(initialData.content);
      }

      if (initialData.tags) {
        setTags(initialData.tags);
      }
    }
  }, [initialData, form]);

  const handleFinish = (values) => {
    const formData = {
      ...values,
      content: content,
      tags: tags,
    };

    if (initialData) {
      if (mode === "admin") {
        updateMutation({ id: initialData.id, payload: formData });
      } else {
        updateMutation({ id: initialData.id, data: formData });
      }
    } else {
      createMutation(formData);
    }
  };

  const handleSaveDraft = () => {
    form
      .validateFields()
      .then((values) => {
        const formData = {
          ...values,
          content: content,
          status: mode === "admin" ? (initialData?.status || "draft") : "draft",
          tags: tags,
        };

        if (initialData) {
          if (mode === "admin") {
            updateMutation({ id: initialData.id, payload: formData });
          } else {
            updateMutation({ id: initialData.id, data: formData });
          }
        } else {
          createMutation(formData);
        }
      })
      .catch(() => {
        message.warning("Mohon lengkapi field yang wajib diisi");
      });
  };

  const handleSubmitForReview = () => {
    form
      .validateFields()
      .then((values) => {
        const formData = {
          ...values,
          content: content,
          status: mode === "admin" ? (initialData?.status || "published") : "pending",
          tags: tags,
        };

        if (initialData) {
          if (mode === "admin") {
            updateMutation({ id: initialData.id, payload: formData });
          } else {
            updateMutation({ id: initialData.id, data: formData });
          }
        } else {
          createMutation(formData);
        }
      })
      .catch(() => {
        message.error("Mohon lengkapi semua field yang wajib diisi");
      });
  };

  // Handle tags
  const handleAddTag = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (removedTag) => {
    setTags(tags.filter((tag) => tag !== removedTag));
  };

  const isLoading = createLoading || updateLoading;

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
                  <EditOutlined
                    style={{ color: "#FF4500", fontSize: "18px" }}
                  />
                </div>
              )}

              {/* Content Section */}
              <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
                <div style={{ marginBottom: isMobile ? "16px" : "20px" }}>
                  <Title
                    level={isMobile ? 5 : 4}
                    style={{
                      margin: 0,
                      color: "#1A1A1B",
                      lineHeight: isMobile ? "1.3" : "1.4",
                    }}
                  >
                    📚{" "}
                    {customTitle || (initialData
                      ? "Edit Manajemen Pengetahuan"
                      : "Buat Manajemen Pengetahuan Baru")}
                  </Title>
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: isMobile ? "12px" : "14px",
                      lineHeight: isMobile ? "1.3" : "1.4",
                    }}
                  >
                    {customSubtitle || (initialData
                      ? "Perbarui konten manajemen pengetahuan yang sudah ada"
                      : "Kelola dan bagikan pengetahuan untuk pengembangan organisasi")}
                  </Text>
                </div>

                <Form form={form} layout="vertical" onFinish={handleFinish}>
                  <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 16]}>
                    <Col xs={24} lg={16}>
                      <Form.Item
                        name="title"
                        label={
                          <Flex align="center" gap="small">
                            <Text
                              strong
                              style={{ fontSize: isMobile ? "13px" : "14px" }}
                            >
                              Judul
                            </Text>
                            <Tooltip
                              title="Buat judul yang jelas, spesifik, dan mudah dipahami. Gunakan kata kunci yang relevan untuk memudahkan pencarian. Contoh: 'Panduan Lengkap Pengajuan Cuti Tahunan'"
                              placement="top"
                            >
                              <QuestionCircleOutlined
                                style={{
                                  color: "#FF4500",
                                  fontSize: "12px",
                                  cursor: "help",
                                }}
                              />
                            </Tooltip>
                          </Flex>
                        }
                        rules={[
                          { required: true, message: "Judul harus diisi!" },
                          { max: 255, message: "Judul maksimal 255 karakter!" },
                        ]}
                      >
                        <Input
                          placeholder="Masukkan judul konten yang jelas dan informatif"
                          style={{
                            borderRadius: "6px",
                            fontSize: isMobile ? "13px" : "14px",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#FF4500";
                            e.target.style.boxShadow =
                              "0 0 0 2px rgba(255, 69, 0, 0.2)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#d9d9d9";
                            e.target.style.boxShadow = "none";
                          }}
                        />
                      </Form.Item>

                      <Form.Item
                        label={
                          <Flex align="center" gap="small">
                            <Text
                              strong
                              style={{ fontSize: isMobile ? "13px" : "14px" }}
                            >
                              Konten
                            </Text>
                            <Tooltip
                              title="Tulis konten yang lengkap dan terstruktur. Gunakan format markdown untuk styling. Sertakan langkah-langkah detail, gambar pendukung, dan contoh jika diperlukan. Konten yang baik akan membantu rekan kerja memahami topik dengan mudah."
                              placement="top"
                            >
                              <QuestionCircleOutlined
                                style={{
                                  color: "#FF4500",
                                  fontSize: "12px",
                                  cursor: "help",
                                }}
                              />
                            </Tooltip>
                          </Flex>
                        }
                        rules={[
                          { required: true, message: "Konten harus diisi!" },
                        ]}
                      >
                        <div
                          style={{
                            border: "1px solid #d9d9d9",
                            borderRadius: "6px",
                            overflow: "hidden",
                          }}
                        >
                          <MarkdownEditor
                            value={content}
                            fullHeight
                            acceptedFileTypes={[
                              "image/*",
                              // word, excel, txt, pdf
                              ".doc",
                              ".docx",
                              ".xls",
                              ".xlsx",
                              ".txt",
                              ".pdf",
                            ]}
                            onChange={setContent}
                            placeholder="Jelaskan konten knowledge dengan detail, serta lampirkan file pendukung jika diperlukan."
                            onRenderPreview={renderMarkdown}
                            onUploadFile={uploadFile}
                            mentionSuggestions={null}
                          />
                        </div>
                      </Form.Item>
                    </Col>

                    <Col xs={24} lg={8}>
                      <Form.Item
                        name="category_id"
                        label={
                          <Flex align="center" gap="small">
                            <Text
                              strong
                              style={{ fontSize: isMobile ? "13px" : "14px" }}
                            >
                              Kategori
                            </Text>
                            <Tooltip
                              title="Pilih kategori yang paling sesuai dengan topik konten Anda. Kategori yang tepat akan memudahkan orang lain menemukan informasi ini saat mereka membutuhkannya."
                              placement="top"
                            >
                              <QuestionCircleOutlined
                                style={{
                                  color: "#FF4500",
                                  fontSize: "12px",
                                  cursor: "help",
                                }}
                              />
                            </Tooltip>
                          </Flex>
                        }
                        rules={[
                          {
                            required: true,
                            message: "Kategori harus dipilih!",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Pilih kategori..."
                          loading={categoriesLoading}
                          style={{
                            borderRadius: "6px",
                            fontSize: isMobile ? "13px" : "14px",
                          }}
                          onFocus={(e) => {
                            const selector = e.target.closest(".ant-select");
                            if (selector) {
                              selector.style.borderColor = "#FF4500";
                              selector.style.boxShadow =
                                "0 0 0 2px rgba(255, 69, 0, 0.2)";
                            }
                          }}
                          onBlur={(e) => {
                            const selector = e.target.closest(".ant-select");
                            if (selector) {
                              selector.style.borderColor = "#d9d9d9";
                              selector.style.boxShadow = "none";
                            }
                          }}
                        >
                          {categories.map((category) => (
                            <Option key={category.id} value={category.id}>
                              {category.name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label={
                          <Flex align="center" gap="small">
                            <Text
                              strong
                              style={{ fontSize: isMobile ? "13px" : "14px" }}
                            >
                              Tags
                            </Text>
                            <Tooltip
                              title="Tambahkan kata kunci yang relevan untuk memudahkan pencarian. Gunakan 3-5 tags yang spesifik. Contoh: 'prosedur', 'panduan', 'cuti', 'HR'. Tekan Enter atau klik + untuk menambah tag."
                              placement="top"
                            >
                              <QuestionCircleOutlined
                                style={{
                                  color: "#FF4500",
                                  fontSize: "12px",
                                  cursor: "help",
                                }}
                              />
                            </Tooltip>
                          </Flex>
                        }
                      >
                        <div>
                          {tags.length > 0 && (
                            <div style={{ marginBottom: "12px" }}>
                              {tags.map((tag, index) => (
                                <Tag
                                  key={index}
                                  closable
                                  color="#FF4500"
                                  style={{
                                    margin: "2px",
                                    borderRadius: "4px",
                                    fontSize: isMobile ? "11px" : "12px",
                                  }}
                                  onClose={() => handleRemoveTag(tag)}
                                >
                                  {tag}
                                </Tag>
                              ))}
                            </div>
                          )}
                          <Input
                            placeholder="Tambah tag..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onPressEnter={handleAddTag}
                            style={{
                              borderRadius: "6px",
                              fontSize: isMobile ? "12px" : "13px",
                            }}
                            suffix={
                              <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={handleAddTag}
                                size="small"
                                style={{ color: "#FF4500" }}
                              />
                            }
                            onFocus={(e) => {
                              e.target.style.borderColor = "#FF4500";
                              e.target.style.boxShadow =
                                "0 0 0 2px rgba(255, 69, 0, 0.2)";
                            }}
                            onBlur={(e) => {
                              e.target.style.borderColor = "#d9d9d9";
                              e.target.style.boxShadow = "none";
                            }}
                          />
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Action Buttons - Bottom left */}
                  <div
                    style={{
                      borderTop: "1px solid #EDEFF1",
                      paddingTop: isMobile ? "16px" : "20px",
                      marginTop: isMobile ? "16px" : "20px",
                      display: "flex",
                      justifyContent: isMobile ? "center" : "flex-start",
                      alignItems: "center",
                      gap: isMobile ? "12px" : "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      onClick={onCancel}
                      size="middle"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#FF4500";
                        e.currentTarget.style.color = "#FF4500";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#d9d9d9";
                        e.currentTarget.style.color = "#595959";
                      }}
                    >
                      {buttonText.cancel}
                    </Button>
                    
                    {showDraftButton && (
                      <Button
                        onClick={handleSaveDraft}
                        loading={isLoading}
                        size="middle"
                        style={{
                          borderColor: "#52c41a",
                          color: "#52c41a",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#52c41a";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#52c41a";
                        }}
                      >
                        {isLoading ? "Menyimpan..." : buttonText.draft}
                      </Button>
                    )}
                    
                    {showSubmitButton && (
                      <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSubmitForReview}
                        loading={isLoading}
                        size="middle"
                      >
                        {isLoading ? (mode === "admin" ? "Memperbarui..." : "Mengirim...") : buttonText.submit}
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            </Flex>
          </Card>
        </Col>
      </Row>

      <style jsx global>{`
        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 8px !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
          box-shadow: 0 2px 8px rgba(255, 69, 0, 0.15) !important;
        }

        .ant-card .ant-card-body {
          padding: 0 !important;
          border-radius: inherit !important;
        }

        /* Fix untuk icon section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child {
          border-top-left-radius: inherit !important;
          border-bottom-left-radius: inherit !important;
        }

        /* Fix untuk content section agar border radius konsisten */
        .ant-card .ant-card-body > div:first-child > div:last-child {
          border-top-right-radius: inherit !important;
          border-bottom-right-radius: inherit !important;
        }

        .ant-input:focus,
        .ant-input-focused,
        .ant-select-focused .ant-select-selector {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-select:hover .ant-select-selector {
          border-color: #ff4500 !important;
        }

        .ant-btn-primary {
          background: linear-gradient(
            135deg,
            #ff4500 0%,
            #ff6b35 100%
          ) !important;
          border-color: #ff4500 !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.3) !important;
        }

        .ant-btn-primary:hover {
          background: linear-gradient(
            135deg,
            #e53e00 0%,
            #ff4500 100%
          ) !important;
          border-color: #e53e00 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(255, 69, 0, 0.4) !important;
          transition: all 0.2s ease !important;
        }

        .ant-form-item-label > label {
          font-weight: 500 !important;
          color: #1a1a1b !important;
        }

        .ant-tag {
          transition: all 0.2s ease !important;
        }

        .ant-tag:hover {
          transform: translateY(-1px) !important;
        }

        @media (max-width: 768px) {
          .ant-col {
            margin-bottom: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default KnowledgeFormUserContents;
