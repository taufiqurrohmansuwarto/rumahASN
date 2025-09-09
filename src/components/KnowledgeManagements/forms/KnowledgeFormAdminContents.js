import { useUpdateAdminContent } from "@/hooks/knowledge-management/useAdminContentDetail";
import { EditOutlined } from "@ant-design/icons";
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

/**
 * Knowledge Form khusus untuk Admin
 * Menggunakan komponen yang sama dengan KnowledgeFormUserContents
 * Hanya untuk edit functionality dengan 2 tombol: "Perbarui Konten" dan "Batal Edit"
 */
function KnowledgeFormAdminContents({
  initialData = null,
  onSuccess = () => {},
  onCancel = () => {},
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

  // Check if there are files still uploading or pending
  const hasUploadingFiles = fileList.some(
    (file) => file.status === "uploading"
  );

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Update mutation for admin - use the admin-specific hook
  const updateMutation = useUpdateAdminContent(onSuccess);

  // Initialize form with initialData
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        title: initialData.title || "",
        summary: initialData.summary || "",
        category_id: initialData.category_id || undefined,
        type: initialData.type || "teks",
        source_url: initialData.source_url || "",
      });

      // Set content
      setContent(initialData.content || "");

      // Set tags
      const initialTags = Array.isArray(initialData.tags)
        ? initialData.tags
        : initialData.tags
        ? JSON.parse(initialData.tags)
        : [];
      setTags(initialTags);

      // Set content type
      setContentType(initialData.type || "teks");

      // Set media file if content type is video/audio/image and has source_url
      if (
        ["video", "audio", "gambar"].includes(initialData.type) &&
        initialData.source_url
      ) {
        setMediaFile({
          uid: "existing-media",
          name: "Media file",
          status: "done",
          url: initialData.source_url,
        });
      }

      // Set file list if there are attachments
      if (initialData.attachments && initialData.attachments.length > 0) {
        const formattedFiles = initialData.attachments.map((att, index) => ({
          uid: att.id || `${index}`,
          name: att.filename || att.name || "File",
          status: "done",
          url: att.url,
          response: {
            data: {
              filename: att.filename || att.name,
              url: att.url,
              id: att.id,
            },
          },
        }));
        setFileList(formattedFiles);
      }
    }
  }, [initialData, form]);

  // Handle submit for admin (triggered by KnowledgeFormActions)
  const handleSubmitForReview = async () => {
    if (isSubmitting || hasUploadingFiles) return;

    setIsSubmitting(true);

    try {
      // Validate form fields first
      const values = await form.validateFields();

      // Validate content separately since it's not a form field
      if (!content || content.trim() === "") {
        message.error("Konten harus diisi!");
        return;
      }

      const payload = {
        ...values,
        content,
        tags: JSON.stringify(tags),
        attachments: fileList
          .filter((file) => file.response?.data)
          .map((file) => ({
            filename: file.response.data.filename,
            url: file.response.data.url,
            id: file.response.data.id,
          })),
      };

      await updateMutation.mutateAsync({
        id: currentContentId,
        payload,
      });
    } catch (error) {
      console.error("Error updating content:", error);
      if (error.errorFields) {
        message.error("Mohon lengkapi semua field yang wajib diisi");
      } else {
        message.error(`Gagal memperbarui konten: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin-specific button configuration (only 2 buttons)
  const buttonConfig = {
    showDraftButton: false,
    showSubmitButton: true,
    buttonText: {
      submit: "Perbarui Konten",
      cancel: "Batal Edit",
    },
  };

  return (
    <>
      {(updateMutation.isLoading || isSubmitting || isMediaUploading) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <Spin size="large" />
        </div>
      )}

      <Card
        style={{
          borderRadius: "12px",
          border: "1px solid #EDEFF1",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Flex>
          {/* Icon Section */}
          {!isMobile && (
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "24px",
                minHeight: "100%",
              }}
            >
              <EditOutlined style={{ color: "#1890ff", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
            {/* Header */}
            <KnowledgeFormHeader
              isMobile={isMobile}
              customTitle="Edit Konten ASNPedia"
              customSubtitle="Perbarui informasi konten ASNPedia"
              titleColor="#1890ff"
            />

            <Form
              form={form}
              layout="vertical"
              disabled={updateMutation.isLoading || isSubmitting}
            >
              <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 16]}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                  {/* Title */}
                  <KnowledgeFormTitle isMobile={isMobile} />

                  {/* Type */}
                  <KnowledgeFormType
                    isMobile={isMobile}
                    contentType={contentType}
                    setContentType={setContentType}
                  />

                  {/* Media or Source URL based on content type */}
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

                  {/* Summary */}
                  <KnowledgeFormSummary isMobile={isMobile} />

                  {/* Content */}
                  <KnowledgeFormContent
                    isMobile={isMobile}
                    content={content}
                    setContent={setContent}
                  />
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                  {/* Category */}
                  <KnowledgeFormCategory isMobile={isMobile} />

                  {/* Tags */}
                  <KnowledgeFormTags
                    isMobile={isMobile}
                    tags={tags}
                    setTags={setTags}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                  />

                  {/* References */}
                  <KnowledgeFormReferences isMobile={isMobile} />

                  {/* Attachments */}
                  <KnowledgeFormAttachments
                    isMobile={isMobile}
                    fileList={fileList}
                    setFileList={setFileList}
                    contentId={currentContentId}
                  />
                </Col>
              </Row>

              {/* Form Actions */}
              <KnowledgeFormActions
                isMobile={isMobile}
                isLoading={isSubmitting || updateMutation.isLoading}
                mode="admin"
                showDraftButton={buttonConfig.showDraftButton}
                showSubmitButton={buttonConfig.showSubmitButton}
                buttonText={buttonConfig.buttonText}
                onCancel={onCancel}
                onSubmitForReview={handleSubmitForReview}
              />
            </Form>
          </div>
        </Flex>
      </Card>

      {/* Admin-specific styles - Blue theme */}
      <style jsx global>{`
        /* Form styles khusus admin - Blue theme untuk menghindari orange */
        .ant-form .ant-input:hover,
        .ant-form .ant-input:focus,
        .ant-form .ant-input-focused,
        .ant-form .ant-input-affix-wrapper:hover,
        .ant-form .ant-input-affix-wrapper:focus,
        .ant-form .ant-input-affix-wrapper-focused {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }

        .ant-form .ant-select:hover .ant-select-selector,
        .ant-form .ant-select-focused .ant-select-selector {
          border-color: #1890ff !important;
        }

        .ant-form .ant-btn-primary {
          background-color: #1890ff !important;
          border-color: #1890ff !important;
        }

        .ant-form .ant-btn-primary:hover {
          background-color: #40a9ff !important;
          border-color: #40a9ff !important;
        }

        /* Markdown editor styles */
        .ant-form .MarkdownEditor-root {
          border-color: #d9d9d9 !important;
        }

        .ant-form .MarkdownEditor-root:hover,
        .ant-form .MarkdownEditor-root:focus-within {
          border-color: #1890ff !important;
        }
      `}</style>
    </>
  );
}

export default KnowledgeFormAdminContents;
