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
  Spin,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import KnowledgeFormHeader from "./KnowledgeFormHeader";
import KnowledgeFormTitle from "./KnowledgeFormTitle";
import KnowledgeFormSummary from "./KnowledgeFormSummary";
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
  const [currentContentId, setCurrentContentId] = useState(initialData?.id || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Check if there are files still uploading or pending
  const hasUploadingFiles = fileList.some(file => file.status === 'uploading');
  const hasPendingFiles = fileList.some(file => file.response?.data?.isTemporary && !currentContentId);

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
        summary: initialData.summary,
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
        return response.data;
      }
      
      return [];
    } catch (error) {
      message.error(`Upload attachments gagal: ${error.message}`);
      throw error;
    }
  };

  const resetForm = () => {
    form.resetFields();
    setContent("");
    setTags([]);
    setInputValue("");
    setFileList([]);
    setCurrentContentId(null);
    setIsSubmitting(false);
  };

  const handleFinish = async (values) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const filesToUpload = fileList
        .filter(file => file.status === 'done' && file.response?.data?.isTemporary)
        .map(file => file.response.data);

      const formData = {
        ...values,
        content,
        tags,
        references: values.references || [],
      };


      let result;
      const isEditing = !!initialData;
      const contentId = isEditing ? initialData.id : null;

      // Step 1: Create or Update content
      if (isEditing) {
        const mutationData = mode === "admin" 
          ? { id: contentId, payload: formData }
          : { id: contentId, data: formData };
        
        result = await new Promise((resolve, reject) => {
          updateMutation(mutationData, {
            onSuccess: resolve,
            onError: reject
          });
        });
      } else {
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject
          });
        });
        
        if (result?.id) {
          setCurrentContentId(result.id);
        }
      }

      // Step 2: Upload files if any
      const targetContentId = isEditing ? contentId : result?.id;
      if (filesToUpload.length > 0 && targetContentId) {
        await uploadAttachments(targetContentId, filesToUpload);
      }

      // Single success message
      const successMessage = isEditing 
        ? "Konten berhasil diperbarui!"
        : "Konten berhasil dibuat!";
      
      message.success(successMessage);
      
      // Reset form only for create mode
      if (!isEditing) {
        resetForm();
      }
    } catch (error) {
      message.error(`Gagal menyimpan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      
      const filesToUpload = fileList
        .filter(file => file.status === 'done' && file.response?.data?.isTemporary)
        .map(file => file.response.data);

      const formData = {
        ...values,
        content,
        status: mode === "admin" ? (initialData?.status || "draft") : "draft",
        tags,
        references: values.references || [],
      };


      let result;
      const isEditing = !!initialData;
      const contentId = isEditing ? initialData.id : null;

      // Step 1: Create or Update content
      if (isEditing) {
        const mutationData = mode === "admin" 
          ? { id: contentId, payload: formData }
          : { id: contentId, data: formData };
        
        result = await new Promise((resolve, reject) => {
          updateMutation(mutationData, {
            onSuccess: resolve,
            onError: reject
          });
        });
      } else {
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject
          });
        });
        
        if (result?.id) {
          setCurrentContentId(result.id);
        }
      }

      // Step 2: Upload files if any
      const targetContentId = isEditing ? contentId : result?.id;
      if (filesToUpload.length > 0 && targetContentId) {
        await uploadAttachments(targetContentId, filesToUpload);
      }

      // Single success message
      const successMessage = isEditing 
        ? "Draft berhasil diperbarui!"
        : "Draft berhasil disimpan!";
      
      message.success(successMessage);
      
      // Reset form only for create mode
      if (!isEditing) {
        resetForm();
      }
    } catch (error) {
      if (error.errorFields) {
        message.warning("Mohon lengkapi field yang wajib diisi");
      } else {
        message.error(`Gagal menyimpan draft: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const values = await form.validateFields();
      
      const filesToUpload = fileList
        .filter(file => file.status === 'done' && file.response?.data?.isTemporary)
        .map(file => file.response.data);

      const formData = {
        ...values,
        content,
        status: mode === "admin" ? (initialData?.status || "published") : "pending",
        tags,
        references: values.references || [],
      };

      let result;
      const isEditing = !!initialData;
      const contentId = isEditing ? initialData.id : null;

      // Step 1: Create or Update content
      if (isEditing) {
        const mutationData = mode === "admin" 
          ? { id: contentId, payload: formData }
          : { id: contentId, data: formData };
        
        result = await new Promise((resolve, reject) => {
          updateMutation(mutationData, {
            onSuccess: resolve,
            onError: reject
          });
        });
      } else {
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject
          });
        });
        
        if (result?.id) {
          setCurrentContentId(result.id);
        }
      }

      // Step 2: Upload files if any
      const targetContentId = isEditing ? contentId : result?.id;
      if (filesToUpload.length > 0 && targetContentId) {
        await uploadAttachments(targetContentId, filesToUpload);
      }

      // Single success message
      const successMessage = mode === "admin" 
        ? "Konten berhasil dipublikasi!"
        : "Konten berhasil dikirim untuk review!";
      
      message.success(successMessage);
      
      // Reset form only for create mode
      if (!isEditing) {
        resetForm();
      }
    } catch (error) {
      if (error.errorFields) {
        message.error("Mohon lengkapi semua field yang wajib diisi");
      } else {
        message.error(`Gagal mengirim untuk review: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  const isLoading = createLoading || updateLoading || isSubmitting || hasUploadingFiles;

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
                      <KnowledgeFormSummary isMobile={isMobile} />
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
                        contentId={currentContentId}
                      />
                    </Col>
                  </Row>

                  {/* Status Info */}
                  {(hasUploadingFiles || hasPendingFiles) && (
                    <div style={{ 
                      marginBottom: 16, 
                      padding: "8px 12px",
                      backgroundColor: "#f6f8fa",
                      borderRadius: "6px",
                      border: "1px solid #e1e8ed"
                    }}>
                      <Row align="middle" gutter={8}>
                        <Col>
                          {hasUploadingFiles ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1890ff" }}>
                              <Spin size="small" />
                              <span style={{ fontSize: "13px" }}>Mengupload file...</span>
                            </div>
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#52c41a" }}>
                              <span style={{ fontSize: "13px" }}>📋 File siap diupload saat menyimpan</span>
                            </div>
                          )}
                        </Col>
                      </Row>
                    </div>
                  )}

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
