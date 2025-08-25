import {
  createKnowledgeContent,
  updateKnowledgeContent,
  uploadMultipleKnowledgeContentAttachments,
} from "@/services/knowledge-management.services";
import { EditOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Col,
  Flex,
  Form,
  Grid,
  message,
  Row,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import KnowledgeFormHeader from "./KnowledgeFormHeader";
import KnowledgeFormTitle from "./KnowledgeFormTitle";
import KnowledgeFormContent from "./KnowledgeFormContent";
import KnowledgeFormCategory from "./KnowledgeFormCategory";
import KnowledgeFormTags from "./KnowledgeFormTags";
import KnowledgeFormReferences from "./KnowledgeFormReferences";
import KnowledgeFormAttachments from "./KnowledgeFormAttachments";
import KnowledgeFormActions from "./KnowledgeFormActions";

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
  const [fileList, setFileList] = useState([]);
  const queryClient = useQueryClient();

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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

      if (initialData.references) {
        form.setFieldValue('references', initialData.references);
      }

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
    }
  }, [initialData, form]);

  const uploadAttachments = async (contentId, filesToUpload) => {
    if (filesToUpload.length === 0) return [];
    
    try {
      const response = await uploadMultipleKnowledgeContentAttachments(
        contentId, 
        filesToUpload.map(fileData => fileData.file)
      );
      
      if (response?.success && response?.data) {
        message.success(`${response.data.length} file berhasil diupload!`);
        return response.data;
      }
      
      return [];
    } catch (error) {
      message.error(`Upload attachments gagal: ${error.message}`);
      throw error;
    }
  };

  const handleFinish = async (values) => {
    try {
      // Separate files that need to be uploaded vs already uploaded
      const filesToUpload = fileList
        .filter(file => file.status === 'done' && file.response?.data?.isTemporary)
        .map(file => file.response.data);

      const existingAttachments = fileList
        .filter(file => file.status === 'done' && file.response?.data?.url && !file.response?.data?.isTemporary)
        .map(file => ({
          filename: file.name,
          url: file.response.data.url,
          mimetype: file.response.data.mimetype || file.type,
          size: file.response.data.size || file.size
        }));

      const formData = {
        ...values,
        content: content,
        tags: tags,
        references: values.references || [],
        attachments: existingAttachments, // Include existing attachments
      };

      let result;
      if (initialData) {
        if (mode === "admin") {
          result = await new Promise((resolve, reject) => {
            updateMutation({ id: initialData.id, payload: formData }, {
              onSuccess: resolve,
              onError: reject
            });
          });
        } else {
          result = await new Promise((resolve, reject) => {
            updateMutation({ id: initialData.id, data: formData }, {
              onSuccess: resolve,
              onError: reject
            });
          });
        }
        
        // Upload new files for existing content
        if (filesToUpload.length > 0) {
          await uploadAttachments(initialData.id, filesToUpload);
        }
      } else {
        // Create content first
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject
          });
        });

        // Upload files for new content
        if (filesToUpload.length > 0 && result?.data?.id) {
          await uploadAttachments(result.data.id, filesToUpload);
        }
      }
    } catch (error) {
      message.error(`Gagal menyimpan: ${error.message}`);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const values = await form.validateFields();
      
      // Separate files that need to be uploaded vs already uploaded
      const filesToUpload = fileList
        .filter(file => file.status === 'done' && file.response?.data?.isTemporary)
        .map(file => file.response.data);

      const existingAttachments = fileList
        .filter(file => file.status === 'done' && file.response?.data?.url && !file.response?.data?.isTemporary)
        .map(file => ({
          filename: file.name,
          url: file.response.data.url,
          mimetype: file.response.data.mimetype || file.type,
          size: file.response.data.size || file.size
        }));

      const formData = {
        ...values,
        content: content,
        status: mode === "admin" ? (initialData?.status || "draft") : "draft",
        tags: tags,
        references: values.references || [],
        attachments: existingAttachments,
      };

      let result;
      if (initialData) {
        if (mode === "admin") {
          result = await new Promise((resolve, reject) => {
            updateMutation({ id: initialData.id, payload: formData }, {
              onSuccess: resolve,
              onError: reject
            });
          });
        } else {
          result = await new Promise((resolve, reject) => {
            updateMutation({ id: initialData.id, data: formData }, {
              onSuccess: resolve,
              onError: reject
            });
          });
        }
        
        // Upload new files for existing content
        if (filesToUpload.length > 0) {
          await uploadAttachments(initialData.id, filesToUpload);
        }
      } else {
        // Create content first
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject
          });
        });

        // Upload files for new content
        if (filesToUpload.length > 0 && result?.data?.id) {
          await uploadAttachments(result.data.id, filesToUpload);
        }
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning("Mohon lengkapi field yang wajib diisi");
      } else {
        message.error(`Gagal menyimpan draft: ${error.message}`);
      }
    }
  };

  const handleSubmitForReview = async () => {
    try {
      const values = await form.validateFields();
      
      // Separate files that need to be uploaded vs already uploaded
      const filesToUpload = fileList
        .filter(file => file.status === 'done' && file.response?.data?.isTemporary)
        .map(file => file.response.data);

      const existingAttachments = fileList
        .filter(file => file.status === 'done' && file.response?.data?.url && !file.response?.data?.isTemporary)
        .map(file => ({
          filename: file.name,
          url: file.response.data.url,
          mimetype: file.response.data.mimetype || file.type,
          size: file.response.data.size || file.size
        }));

      const formData = {
        ...values,
        content: content,
        status: mode === "admin" ? (initialData?.status || "published") : "pending",
        tags: tags,
        references: values.references || [],
        attachments: existingAttachments,
      };

      let result;
      if (initialData) {
        if (mode === "admin") {
          result = await new Promise((resolve, reject) => {
            updateMutation({ id: initialData.id, payload: formData }, {
              onSuccess: resolve,
              onError: reject
            });
          });
        } else {
          result = await new Promise((resolve, reject) => {
            updateMutation({ id: initialData.id, data: formData }, {
              onSuccess: resolve,
              onError: reject
            });
          });
        }
        
        // Upload new files for existing content
        if (filesToUpload.length > 0) {
          await uploadAttachments(initialData.id, filesToUpload);
        }
      } else {
        // Create content first
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject
          });
        });

        // Upload files for new content
        if (filesToUpload.length > 0 && result?.data?.id) {
          await uploadAttachments(result.data.id, filesToUpload);
        }
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Mohon lengkapi semua field yang wajib diisi");
      } else {
        message.error(`Gagal mengirim untuk review: ${error.message}`);
      }
    }
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
                <KnowledgeFormHeader
                  isMobile={isMobile}
                  initialData={initialData}
                  customTitle={customTitle}
                  customSubtitle={customSubtitle}
                />

                <Form form={form} layout="vertical" onFinish={handleFinish}>
                  <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 16]}>
                    <Col xs={24} lg={16}>
                      <KnowledgeFormTitle isMobile={isMobile} />
                      <KnowledgeFormContent 
                        isMobile={isMobile} 
                        content={content} 
                        setContent={setContent} 
                      />
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
                        contentId={initialData?.id}
                      />
                    </Col>
                  </Row>

                  <KnowledgeFormActions
                    isMobile={isMobile}
                    isLoading={isLoading}
                    mode={mode}
                    buttonText={buttonText}
                    onCancel={onCancel}
                    onSaveDraft={handleSaveDraft}
                    onSubmitForReview={handleSubmitForReview}
                    showDraftButton={showDraftButton}
                    showSubmitButton={showSubmitButton}
                  />
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
