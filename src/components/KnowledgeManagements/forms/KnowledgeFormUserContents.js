import {
  createKnowledgeContent,
  updateKnowledgeContent,
  uploadKnowledgeContentMedia,
  uploadKnowledgeContentMediaAdmin,
  uploadKnowledgeContentMediaCreate,
  uploadMultipleKnowledgeContentAttachments,
} from "@/services/knowledge-management.services";
import { EditOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, Col, Flex, Form, Grid, message, Row, Spin } from "antd";
import { useEffect, useState } from "react";
import KnowledgeFormActions from "./KnowledgeFormActions";
import KnowledgeFormAttachments from "./KnowledgeFormAttachments";
import KnowledgeFormCategory from "./KnowledgeFormCategory";
import KnowledgeFormContent from "./KnowledgeFormContent";
import KnowledgeFormHeader from "./KnowledgeFormHeader";
import KnowledgeFormMedia from "./KnowledgeFormMedia";
import KnowledgeFormReferences from "./KnowledgeFormReferences";
import KnowledgeFormSourceUrl from "./KnowledgeFormSourceUrl";
import KnowledgeFormSummary from "./KnowledgeFormSummary";
import KnowledgeFormTags from "./KnowledgeFormTags";
import KnowledgeFormTitle from "./KnowledgeFormTitle";
import KnowledgeFormType from "./KnowledgeFormType";

const { useBreakpoint } = Grid;

function KnowledgeFormUserContents({
  initialData = null,
  onSuccess = () => {},
  onCancel = () => {},
  mode = "user", // "user" | "admin"
  queryKeysToInvalidate = ["fetch-knowledge-user-contents"], // customizable query keys
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
  const [currentContentId, setCurrentContentId] = useState(
    initialData?.id || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentType, setContentType] = useState("teks");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const queryClient = useQueryClient();

  // Check if there are files still uploading or pending
  const hasUploadingFiles = fileList.some(
    (file) => file.status === "uploading"
  );
  const hasPendingFiles = fileList.some(
    (file) => file.response?.data?.isTemporary && !currentContentId
  );

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Determine if we're in edit mode
  const isEditing = !!initialData;

  // Dynamic button configuration based on mode and context
  const getButtonConfig = () => {
    if (mode === "admin") {
      // Admin has full control - can have multiple buttons based on needs
      return {
        showDraftButton: true,
        showSubmitButton: true,
        buttonText: {
          draft: customButtonText?.draft || "Simpan",
          submit:
            customButtonText?.submit || (isEditing ? "Perbarui" : "Publish"),
          cancel: customButtonText?.cancel || "Batal",
        },
      };
    } else {
      // User simplified flow: only 2 buttons (Cancel + Save/Submit)
      return {
        showDraftButton: false, // Remove draft button for users
        showSubmitButton: true,
        buttonText: {
          draft: "", // Not used for users
          submit:
            customButtonText?.submit ||
            (isEditing ? "Simpan Perubahan" : "Simpan"),
          cancel: customButtonText?.cancel || "Batal",
        },
      };
    }
  };

  const { showDraftButton, showSubmitButton, buttonText } = getButtonConfig();

  // Get success message based on mode and context
  const getSuccessMessage = () => {
    if (mode === "admin") {
      return isEditing
        ? "Konten berhasil diperbarui!"
        : "Konten berhasil dibuat!";
    } else {
      // User messages
      return isEditing
        ? "Perubahan berhasil disimpan!"
        : "Konten berhasil dibuat!";
    }
  };

  // Use custom mutations or default ones
  const defaultCreateMutation = useMutation(
    (data) => createKnowledgeContent(data),
    {
      onSuccess: (data) => {
        queryKeysToInvalidate.forEach((key) => {
          queryClient.invalidateQueries([key]);
        });
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
        queryKeysToInvalidate.forEach((key) => {
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

  const { mutate: createMutation, isLoading: createLoading } =
    createMutationHook();
  const { mutate: updateMutation, isLoading: updateLoading } =
    updateMutationHook();

  // Watch for type changes
  const watchedType = Form.useWatch("type", form);

  useEffect(() => {
    if (watchedType && watchedType !== contentType) {
      setContentType(watchedType);
    }
  }, [watchedType, contentType]);

  // Set initial data jika dalam mode edit
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
        form.setFieldValue("references", initialData.references);
      }

      if (initialData.attachments) {
        const mappedFiles = initialData.attachments.map(
          (attachment, index) => ({
            uid: `-${index}`,
            name: attachment.filename || attachment.name,
            status: "done",
            url: attachment.url,
            response: {
              data: { url: attachment.url },
            },
          })
        );
        setFileList(mappedFiles);
      }

      // Set media file if source_url exists and type is media
      if (
        initialData.source_url &&
        ["video", "audio", "gambar"].includes(initialData.type)
      ) {
        setMediaFile({
          uid: "existing-media",
          name: initialData.title || "Media File",
          status: "done",
          url: initialData.source_url,
          type: initialData.type,
        });
      }
    }
  }, [initialData, form]);

  const uploadAttachments = async (contentId, filesToUpload) => {
    if (filesToUpload.length === 0) return [];

    try {
      const response = await uploadMultipleKnowledgeContentAttachments(
        contentId,
        filesToUpload.map((fileData) => fileData.file)
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

  const uploadMediaFile = async (contentId, file, isCreate = false) => {
    if (!file || !["video", "audio", "gambar"].includes(contentType))
      return null;

    try {
      setIsMediaUploading(true);
      setMediaUploadProgress(0);

      const formData = new FormData();
      formData.append("media", file);

      let response;
      if (isCreate) {
        response = await uploadKnowledgeContentMediaCreate(formData);
      } else if (mode === "admin") {
        response = await uploadKnowledgeContentMediaAdmin(contentId, formData);
      } else {
        response = await uploadKnowledgeContentMedia(contentId, formData);
      }

      if (response?.success && response?.data?.url) {
        setMediaUploadProgress(100);
        return response.data.url;
      }

      throw new Error("Upload gagal: Tidak ada URL yang dikembalikan");
    } catch (error) {
      console.error("Media upload error:", error);
      throw error;
    } finally {
      setIsMediaUploading(false);
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
    setContentType("teks");
    setMediaFile(null);
    setMediaUploadProgress(0);
    setIsMediaUploading(false);
  };

  const handleFinish = async (values) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const isEditing = !!initialData;
      const filesToUpload = fileList
        .filter(
          (file) => file.status === "done" && file.response?.data?.isTemporary
        )
        .map((file) => file.response.data);

      const formData = {
        ...values,
        content,
        tags,
        references: values.references || [],
        // For users: always save as draft in create mode, maintain status in edit mode
        // For admins: maintain current behavior (can control status)
        ...(mode === "user" && !isEditing && { status: "draft" }),
      };

      let result;
      const contentId = isEditing ? initialData.id : null;

      // Step 1: Create or Update content
      if (isEditing) {
        const mutationData =
          mode === "admin"
            ? { id: contentId, payload: formData }
            : { id: contentId, data: formData };

        result = await new Promise((resolve, reject) => {
          updateMutation(mutationData, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      } else {
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject,
          });
        });

        if (result?.id) {
          setCurrentContentId(result.id);
        }
      }

      // Step 2: Handle media upload for create mode
      if (
        !isEditing &&
        mediaFile &&
        mediaFile.originFileObj &&
        ["video", "audio", "gambar"].includes(contentType) &&
        result?.id
      ) {
        try {
          const uploadedMediaUrl = await uploadMediaFile(
            result.id,
            mediaFile.originFileObj,
            false
          );
          if (uploadedMediaUrl) {
            // Update the content with new media URL
            const updateData = { source_url: uploadedMediaUrl };
            const mutationData =
              mode === "admin"
                ? { id: result.id, payload: updateData }
                : { id: result.id, data: updateData };

            await new Promise((resolve, reject) => {
              updateMutation(mutationData, {
                onSuccess: resolve,
                onError: reject,
              });
            });
          }
        } catch (error) {
          // Media upload failed, but content was saved successfully
          console.error("Media upload failed:", error);
        }
      }

      // Step 2b: Handle media upload for edit mode
      if (
        isEditing &&
        mediaFile &&
        mediaFile.originFileObj &&
        ["video", "audio", "gambar"].includes(contentType)
      ) {
        try {
          const uploadedMediaUrl = await uploadMediaFile(
            contentId,
            mediaFile.originFileObj,
            false
          );
          if (uploadedMediaUrl) {
            // Update the content with new media URL
            const updateData = { source_url: uploadedMediaUrl };
            const mutationData =
              mode === "admin"
                ? { id: contentId, payload: updateData }
                : { id: contentId, data: updateData };

            await new Promise((resolve, reject) => {
              updateMutation(mutationData, {
                onSuccess: resolve,
                onError: reject,
              });
            });
          }
        } catch (error) {
          // Media upload failed, but content was saved successfully
          console.error("Media upload failed:", error);
        }
      }

      // Step 3: Upload files if any
      const targetContentId = isEditing ? contentId : result?.id;
      if (filesToUpload.length > 0 && targetContentId) {
        await uploadAttachments(targetContentId, filesToUpload);
      }

      // Single success message
      message.success(getSuccessMessage());
      
      // Call onSuccess with result data for redirect
      onSuccess(result);

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
      const isEditing = !!initialData;
      const values = await form.validateFields();

      const filesToUpload = fileList
        .filter(
          (file) => file.status === "done" && file.response?.data?.isTemporary
        )
        .map((file) => file.response.data);

      const formData = {
        ...values,
        content,
        tags,
        references: values.references || [],
        // Status handling for draft save
        status: mode === "admin" ? initialData?.status || "draft" : "draft",
      };

      let result;
      const contentId = isEditing ? initialData.id : null;

      // Step 1: Create or Update content
      if (isEditing) {
        const mutationData =
          mode === "admin"
            ? { id: contentId, payload: formData }
            : { id: contentId, data: formData };

        result = await new Promise((resolve, reject) => {
          updateMutation(mutationData, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      } else {
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject,
          });
        });

        if (result?.id) {
          setCurrentContentId(result.id);
        }
      }

      // Step 2: Handle media upload for edit mode
      if (
        isEditing &&
        mediaFile &&
        mediaFile.originFileObj &&
        ["video", "audio", "gambar"].includes(contentType)
      ) {
        try {
          const uploadedMediaUrl = await uploadMediaFile(
            contentId,
            mediaFile.originFileObj,
            false
          );
          if (uploadedMediaUrl) {
            // Update the content with new media URL
            const updateData = { source_url: uploadedMediaUrl };
            const mutationData =
              mode === "admin"
                ? { id: contentId, payload: updateData }
                : { id: contentId, data: updateData };

            await new Promise((resolve, reject) => {
              updateMutation(mutationData, {
                onSuccess: resolve,
                onError: reject,
              });
            });
          }
        } catch (error) {
          // Media upload failed, but content was saved successfully
          console.error("Media upload failed:", error);
        }
      }

      // Step 3: Upload files if any
      const targetContentId = isEditing ? contentId : result?.id;
      if (filesToUpload.length > 0 && targetContentId) {
        await uploadAttachments(targetContentId, filesToUpload);
      }

      // Single success message
      const draftMessage = isEditing
        ? "Draft berhasil diperbarui!"
        : "Draft berhasil disimpan!";
      message.success(draftMessage);

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
      const isEditing = !!initialData;
      const values = await form.validateFields();

      const filesToUpload = fileList
        .filter(
          (file) => file.status === "done" && file.response?.data?.isTemporary
        )
        .map((file) => file.response.data);

      // Step 0: Handle media upload for create mode
      let mediaUrl = values.source_url;
      if (
        !isEditing &&
        mediaFile &&
        mediaFile.originFileObj &&
        ["video", "audio", "gambar"].includes(contentType)
      ) {
        try {
          mediaUrl = await uploadMediaFile(null, mediaFile.originFileObj, true);
        } catch (error) {
          setIsSubmitting(false);
          return;
        }
      }

      const formData = {
        ...values,
        content,
        tags,
        references: values.references || [],
        source_url: mediaUrl || values.source_url,
        // Status handling for submit
        status:
          mode === "admin"
            ? initialData?.status || "published"
            : "draft", // Users always stay draft, don't auto-submit for review
      };

      let result;
      const contentId = isEditing ? initialData.id : null;

      // Step 1: Create or Update content
      if (isEditing) {
        const mutationData =
          mode === "admin"
            ? { id: contentId, payload: formData }
            : { id: contentId, data: formData };

        result = await new Promise((resolve, reject) => {
          updateMutation(mutationData, {
            onSuccess: resolve,
            onError: reject,
          });
        });
      } else {
        result = await new Promise((resolve, reject) => {
          createMutation(formData, {
            onSuccess: resolve,
            onError: reject,
          });
        });

        if (result?.id) {
          setCurrentContentId(result.id);
        }
      }

      // Step 2: Handle media upload for create mode
      if (
        !isEditing &&
        mediaFile &&
        mediaFile.originFileObj &&
        ["video", "audio", "gambar"].includes(contentType) &&
        result?.id
      ) {
        try {
          const uploadedMediaUrl = await uploadMediaFile(
            result.id,
            mediaFile.originFileObj,
            false
          );
          if (uploadedMediaUrl) {
            // Update the content with new media URL
            const updateData = { source_url: uploadedMediaUrl };
            const mutationData =
              mode === "admin"
                ? { id: result.id, payload: updateData }
                : { id: result.id, data: updateData };

            await new Promise((resolve, reject) => {
              updateMutation(mutationData, {
                onSuccess: resolve,
                onError: reject,
              });
            });
          }
        } catch (error) {
          // Media upload failed, but content was saved successfully
          console.error("Media upload failed:", error);
        }
      }

      // Step 2b: Handle media upload for edit mode
      if (
        isEditing &&
        mediaFile &&
        mediaFile.originFileObj &&
        ["video", "audio", "gambar"].includes(contentType)
      ) {
        try {
          const uploadedMediaUrl = await uploadMediaFile(
            contentId,
            mediaFile.originFileObj,
            false
          );
          if (uploadedMediaUrl) {
            // Update the content with new media URL
            const updateData = { source_url: uploadedMediaUrl };
            const mutationData =
              mode === "admin"
                ? { id: contentId, payload: updateData }
                : { id: contentId, data: updateData };

            await new Promise((resolve, reject) => {
              updateMutation(mutationData, {
                onSuccess: resolve,
                onError: reject,
              });
            });
          }
        } catch (error) {
          // Media upload failed, but content was saved successfully
          console.error("Media upload failed:", error);
        }
      }

      // Step 3: Upload files if any
      const targetContentId = isEditing ? contentId : result?.id;
      if (filesToUpload.length > 0 && targetContentId) {
        await uploadAttachments(targetContentId, filesToUpload);
      }

      // Single success message
      message.success(getSuccessMessage());
      
      // Call onSuccess with result data for redirect
      onSuccess(result);

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

  const isLoading =
    createLoading ||
    updateLoading ||
    isSubmitting ||
    hasUploadingFiles ||
    isMediaUploading;

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
                      <KnowledgeFormType isMobile={isMobile} />
                      {["video", "audio", "gambar"].includes(contentType) ? (
                        <KnowledgeFormMedia
                          isMobile={isMobile}
                          contentType={contentType}
                          mediaFile={mediaFile}
                          setMediaFile={setMediaFile}
                          isUploading={isMediaUploading}
                          uploadProgress={mediaUploadProgress}
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
                  {(hasUploadingFiles ||
                    hasPendingFiles ||
                    isMediaUploading) && (
                    <div
                      style={{
                        marginBottom: 16,
                        padding: "8px 12px",
                        backgroundColor: "#f6f8fa",
                        borderRadius: "6px",
                        border: "1px solid #e1e8ed",
                      }}
                    >
                      <Row align="middle" gutter={8}>
                        <Col>
                          {hasUploadingFiles || isMediaUploading ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                color: "#1890ff",
                              }}
                            >
                              <Spin size="small" />
                              <span style={{ fontSize: "13px" }}>
                                {isMediaUploading
                                  ? "Mengupload media..."
                                  : "Mengupload file..."}
                              </span>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                color: "#52c41a",
                              }}
                            >
                              <span style={{ fontSize: "13px" }}>
                                📋 File siap diupload saat menyimpan
                              </span>
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
