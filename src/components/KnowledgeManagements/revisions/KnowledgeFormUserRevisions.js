import {
  useUpdateRevision,
  useUploadRevisionMedia,
  useUploadRevisionAttachments,
  useDeleteRevisionAttachment,
} from "@/hooks/knowledge-management/useRevisions";
import { BranchesOutlined } from "@ant-design/icons";
import {
  Card,
  Col,
  Flex,
  Form,
  Grid,
  Row,
  Spin,
  Input,
  message,
  Radio,
  Typography,
} from "antd";
import { useEffect, useState, useCallback } from "react";
import KnowledgeFormActions from "../forms/KnowledgeFormActions";
import KnowledgeFormAttachments from "../forms/KnowledgeFormAttachments";
import KnowledgeFormCategory from "../forms/KnowledgeFormCategory";
import KnowledgeFormContent from "../forms/KnowledgeFormContent";
import KnowledgeFormHeader from "../forms/KnowledgeFormHeader";
import KnowledgeFormMedia from "../forms/KnowledgeFormMedia";
import KnowledgeFormReferences from "../forms/KnowledgeFormReferences";
import KnowledgeFormSummary from "../forms/KnowledgeFormSummary";
import KnowledgeFormTags from "../forms/KnowledgeFormTags";
import KnowledgeFormTitle from "../forms/KnowledgeFormTitle";
import KnowledgeFormType from "../forms/KnowledgeFormType";

const { useBreakpoint } = Grid;
const { TextArea } = Input;
const { Text } = Typography;

function KnowledgeFormUserRevisions({
  revisionData = null,
  onSuccess = () => {},
  onCancel = () => {},
  contentId = null,
}) {
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [content, setContent] = useState("");
  const [fileList, setFileList] = useState([]);
  const [contentType, setContentType] = useState("teks");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUploadProgress, setMediaUploadProgress] = useState(0);
  const [isMediaUploading, setIsMediaUploading] = useState(false);
  const [changeNotes, setChangeNotes] = useState("");
  const [mediaInputMode, setMediaInputMode] = useState("upload"); // "upload" or "url"

  // Store data per content type to preserve when switching
  const [savedMediaData, setSavedMediaData] = useState({
    gambar: { mode: "upload", file: null, url: "" },
    video: { mode: "upload", file: null, url: "" },
    audio: { mode: "upload", file: null, url: "" },
  });

  // Check if there are files still uploading, removing, or pending
  const hasUploadingFiles = fileList.some(
    (file) => file.status === "uploading" || file.status === "removing"
  );

  // Responsive breakpoints
  const screens = useBreakpoint();
  const isMobile = screens.xs;

  // Button configuration for revision - simplified like user form
  const buttonConfig = {
    showDraftButton: false, // Only one action button
    showSubmitButton: true,
    buttonText: {
      draft: "", // Not used
      submit: "Simpan Perubahan",
      cancel: "Batal",
    },
  };

  const { showDraftButton, showSubmitButton, buttonText } = buttonConfig;

  // Helper functions for saving/restoring media data per content type
  const saveCurrentMediaData = useCallback(
    (type, currentMode, currentFile) => {
      if (["video", "audio", "gambar"].includes(type)) {
        const currentUrl = form.getFieldValue("source_url") || "";
        setSavedMediaData((prev) => ({
          ...prev,
          [type]: {
            mode: currentMode || "upload",
            file: currentFile || null,
            url: currentUrl,
          },
        }));
      }
    },
    [form]
  );

  const restoreMediaData = useCallback(
    (type) => {
      if (["video", "audio", "gambar"].includes(type)) {
        const saved = savedMediaData[type];
        setMediaInputMode(saved.mode);
        setMediaFile(saved.file);
        form.setFieldValue("source_url", saved.url);
      }
    },
    [savedMediaData, form]
  );

  // Watch for type changes
  const watchedType = Form.useWatch("type", form);

  useEffect(() => {
    if (watchedType && watchedType !== contentType) {
      const previousType = contentType;

      // Save current media data before switching
      saveCurrentMediaData(previousType, mediaInputMode, mediaFile);

      setContentType(watchedType);

      // Handle data when switching between types
      if (["video", "audio", "gambar"].includes(watchedType)) {
        // Restore saved data for the new type
        restoreMediaData(watchedType);
      } else {
        // Switching to text, clear current form data
        setMediaFile(null);
        form.setFieldValue("source_url", "");
        setMediaInputMode("upload");
      }
    }
  }, [
    watchedType,
    contentType,
    form,
    saveCurrentMediaData,
    restoreMediaData,
    mediaInputMode,
    mediaFile,
  ]);

  // Set initial data from revision
  useEffect(() => {
    if (revisionData) {
      form.setFieldsValue({
        title: revisionData.title,
        summary: revisionData.summary,
        category_id: revisionData.category_id,
        type: revisionData.type || "teks",
        source_url: revisionData.source_url || "",
      });

      if (revisionData.content) {
        setContent(revisionData.content);
      }

      if (revisionData.type) {
        setContentType(revisionData.type);
      }

      if (revisionData.tags) {
        setTags(revisionData.tags);
      }

      if (revisionData.references) {
        form.setFieldValue("references", revisionData.references);
      }

      if (revisionData.change_summary) {
        setChangeNotes(revisionData.change_summary);
      }

      // Handle attachments - revision format
      if (revisionData.attachments && Array.isArray(revisionData.attachments)) {
        const mappedFiles = revisionData.attachments.map(
          (attachment, index) => ({
            uid: attachment.id || `-${index}`,
            name: attachment.name || attachment.filename,
            status: "done",
            url: attachment.url,
            size: attachment.size,
            type: attachment.mime,
            response: {
              data: {
                url: attachment.url,
                id: attachment.id,
              },
            },
          })
        );
        setFileList(mappedFiles);
      }

      // Handle media file for non-text content
      if (
        revisionData.source_url &&
        ["video", "audio", "gambar"].includes(revisionData.type)
      ) {
        // Check if source_url is from uploaded file or external URL
        // If it contains our domain/upload path, it's uploaded file, otherwise it's URL
        const isUploadedFile =
          revisionData.source_url.includes("/uploads/") ||
          revisionData.source_url.includes(window.location.origin);

        if (isUploadedFile) {
          setMediaInputMode("upload");
          setMediaFile({
            uid: "existing-media",
            name: revisionData.title || "Media File",
            status: "done",
            url: revisionData.source_url,
            type: revisionData.type,
          });
        } else {
          setMediaInputMode("url");
          // Set source_url in form for URL input
          form.setFieldValue("source_url", revisionData.source_url);
        }
      }
    }
  }, [revisionData, form]);

  // Use revision hooks
  const updateRevisionMutation = useUpdateRevision();
  const uploadMediaMutation = useUploadRevisionMedia();
  const uploadAttachmentsMutation = useUploadRevisionAttachments();
  const deleteAttachmentMutation = useDeleteRevisionAttachment();

  // Handle delete attachment
  const handleDeleteAttachment = async (uploadId) => {
    try {
      // Show loading state for the specific file being deleted
      setFileList((prevFileList) =>
        prevFileList.map((file) => {
          const fileId = file.response?.data?.uid || file.response?.data?.id;
          if (fileId === uploadId) {
            return { ...file, status: "removing" };
          }
          return file;
        })
      );

      await deleteAttachmentMutation.mutateAsync({
        contentId,
        versionId: revisionData?.id,
        uploadId,
      });

      // On success, remove the file from fileList
      setFileList((prevFileList) =>
        prevFileList.filter((file) => {
          const fileId = file.response?.data?.uid || file.response?.data?.id;
          return fileId !== uploadId;
        })
      );
    } catch (error) {
      console.error("Error deleting attachment:", error);
      // Revert loading state on error
      setFileList((prevFileList) =>
        prevFileList.map((file) => {
          const fileId = file.response?.data?.uid || file.response?.data?.id;
          if (fileId === uploadId) {
            return { ...file, status: "done" };
          }
          return file;
        })
      );
    }
  };

  // Handle save changes (update draft)
  const handleSaveChanges = async () => {
    if (hasUploadingFiles) {
      message.warning("Mohon tunggu hingga upload file selesai");
      return;
    }

    try {
      const formValues = await form.validateFields();

      // Get current attachment state (existing files that are still in fileList)
      const currentAttachments = fileList
        .filter(
          (file) => file.response?.data && !file.response.data.isTemporary
        )
        .map((file) => ({
          id: file.response.data.uid || file.response.data.id,
          name: file.response.data.filename || file.response.data.name,
          size: file.response.data.size,
          mime: file.response.data.mimetype || file.response.data.mime,
          url: file.response.data.url,
        }));

      const formData = {
        ...formValues,
        content,
        tags,
        references: formValues.references || [],
        change_summary: changeNotes,
        attachments: currentAttachments, // Send current attachment state untuk sync deletions
      };

      // Note: Attachments are now uploaded individually, no batch upload needed

      // Update revision content
      updateRevisionMutation.mutate(
        {
          contentId,
          versionId: revisionData?.id,
          data: formData,
        },
        {
          onSuccess: (data) => {
            onSuccess(data);
          },
        }
      );
    } catch (error) {
      console.error("Form validation error:", error);
      if (error.errorFields) {
        message.warning("Mohon periksa field yang wajib diisi");
      }
    }
  };

  if (!revisionData) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <Spin size="large" />
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
                    style={{ color: "#FF4500", fontSize: "18px" }}
                  />
                </div>
              )}

              {/* Content Section */}
              <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
                <KnowledgeFormHeader
                  isMobile={isMobile}
                  initialData={revisionData}
                  customTitle={`Edit Revisi v${revisionData.version}`}
                  customSubtitle="Perbarui konten revisi dan simpan perubahan"
                />

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveChanges}
                >
                  <Row gutter={[isMobile ? 12 : 24, isMobile ? 12 : 16]}>
                    <Col xs={24} lg={16}>
                      <KnowledgeFormTitle isMobile={isMobile} />
                      <KnowledgeFormType isMobile={isMobile} />

                      {/* Conditional content based on type */}
                      {["video", "audio", "gambar"].includes(contentType) ? (
                        <>
                          {/* Media Input Mode Selector */}
                          <Card
                            style={{
                              backgroundColor: "#FFFFFF",
                              border: "1px solid #EDEFF1",
                              borderRadius: isMobile ? "8px" : "12px",
                              marginBottom: isMobile ? "12px" : "16px",
                            }}
                            styles={{
                              body: { padding: isMobile ? "12px" : "16px" },
                            }}
                          >
                            <div style={{ marginBottom: "12px" }}>
                              <Text
                                strong
                                style={{
                                  fontSize: "14px",
                                  color: "#374151",
                                  display: "block",
                                }}
                              >
                                Pilih Cara Input{" "}
                                {contentType === "gambar"
                                  ? "Gambar"
                                  : contentType === "video"
                                  ? "Video"
                                  : "Audio"}
                              </Text>
                              <Text
                                style={{
                                  fontSize: "12px",
                                  color: "#6B7280",
                                  marginTop: "2px",
                                  display: "block",
                                }}
                              >
                                Upload file atau masukkan URL dari sumber
                                eksternal
                              </Text>
                            </div>
                            <Radio.Group
                              value={mediaInputMode}
                              onChange={(e) => {
                                const newMode = e.target.value;

                                // Save current data for current content type
                                saveCurrentMediaData(
                                  contentType,
                                  mediaInputMode,
                                  mediaFile
                                );

                                setMediaInputMode(newMode);

                                // Clear opposite data when switching modes
                                if (newMode === "upload") {
                                  // Switching to upload, clear URL
                                  form.setFieldValue("source_url", "");
                                } else {
                                  // Switching to URL, clear uploaded file
                                  setMediaFile(null);
                                }
                              }}
                              style={{ width: "100%" }}
                            >
                              <Radio value="upload">📁 Upload File</Radio>
                              <Radio value="url" style={{ marginLeft: "16px" }}>
                                🔗 Masukkan URL
                              </Radio>
                            </Radio.Group>
                          </Card>

                          {/* Conditional Input Based on Mode */}
                          {mediaInputMode === "upload" ? (
                            <KnowledgeFormMedia
                              isMobile={isMobile}
                              contentType={contentType}
                              mediaFile={mediaFile}
                              setMediaFile={setMediaFile}
                              isUploading={isMediaUploading}
                              setIsUploading={setIsMediaUploading}
                              uploadProgress={mediaUploadProgress}
                              setUploadProgress={setMediaUploadProgress}
                              uploadMutation={uploadMediaMutation}
                              contentId={contentId}
                              revisionId={revisionData?.id}
                            />
                          ) : (
                            <Card
                              style={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #EDEFF1",
                                borderRadius: isMobile ? "8px" : "12px",
                                marginBottom: isMobile ? "12px" : "16px",
                              }}
                              styles={{
                                body: { padding: isMobile ? "12px" : "16px" },
                              }}
                            >
                              <Form.Item
                                name="source_url"
                                label={
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "14px",
                                      color: "#374151",
                                    }}
                                  >
                                    URL{" "}
                                    {contentType === "gambar"
                                      ? "Gambar"
                                      : contentType === "video"
                                      ? "Video"
                                      : "Audio"}
                                  </Text>
                                }
                                rules={[
                                  {
                                    type: "url",
                                    message:
                                      "Format URL tidak valid! Pastikan dimulai dengan http:// atau https://",
                                  },
                                ]}
                                style={{ margin: 0 }}
                              >
                                <Input
                                  placeholder={
                                    contentType === "gambar"
                                      ? "https://example.com/gambar.jpg"
                                      : contentType === "video"
                                      ? "https://youtube.com/watch?v=... atau https://vimeo.com/..."
                                      : "https://soundcloud.com/... atau https://example.com/audio.mp3"
                                  }
                                  style={{
                                    borderRadius: "6px",
                                    fontSize: isMobile ? "13px" : "14px",
                                  }}
                                />
                              </Form.Item>
                            </Card>
                          )}
                        </>
                      ) : (
                        <KnowledgeFormContent
                          content={content}
                          setContent={setContent}
                          isMobile={isMobile}
                        />
                      )}

                      <KnowledgeFormSummary isMobile={isMobile} />
                      <KnowledgeFormReferences isMobile={isMobile} />
                      <KnowledgeFormAttachments
                        isMobile={isMobile}
                        fileList={fileList}
                        setFileList={setFileList}
                        contentId={contentId}
                        revisionId={revisionData?.id}
                        uploadMutation={uploadAttachmentsMutation}
                        onDeleteFile={handleDeleteAttachment}
                      />

                      {/* Change Notes */}
                      <Card
                        style={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #EDEFF1",
                          borderRadius: isMobile ? "8px" : "12px",
                          marginTop: isMobile ? "12px" : "16px",
                        }}
                        styles={{
                          body: { padding: isMobile ? "12px" : "16px" },
                        }}
                      >
                        <div style={{ marginBottom: "12px" }}>
                          <label
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#374151",
                              display: "block",
                            }}
                          >
                            Catatan Perubahan
                          </label>
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#6B7280",
                              marginTop: "2px",
                              display: "block",
                            }}
                          >
                            Jelaskan perubahan yang Anda buat (opsional)
                          </span>
                        </div>
                        <TextArea
                          value={changeNotes}
                          onChange={(e) => setChangeNotes(e.target.value)}
                          placeholder="Misal: Menambahkan informasi terbaru, memperbaiki kesalahan penulisan, dst..."
                          rows={3}
                          style={{
                            resize: "vertical",
                            minHeight: "80px",
                          }}
                        />
                      </Card>
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
                    </Col>
                  </Row>
                </Form>

                {/* Actions */}
                <div style={{ marginTop: "24px" }}>
                  <KnowledgeFormActions
                    showDraftButton={showDraftButton}
                    showSubmitButton={showSubmitButton}
                    buttonText={buttonText}
                    onSaveDraft={() => {}} // Not used
                    onSubmitForReview={handleSaveChanges}
                    onCancel={onCancel}
                    isLoading={updateRevisionMutation.isLoading}
                    hasUploadingFiles={hasUploadingFiles}
                  />
                </div>
              </div>
            </Flex>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default KnowledgeFormUserRevisions;
