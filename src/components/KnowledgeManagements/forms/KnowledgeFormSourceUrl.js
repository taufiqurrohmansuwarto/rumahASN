import { QuestionCircleOutlined, UploadOutlined, LinkOutlined, DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { Flex, Form, Input, Upload, Button, Radio, Typography, Tooltip, message, Space } from "antd";
import { useState } from "react";
import { 
  uploadKnowledgeContentMedia,
  uploadKnowledgeContentMediaCreate
} from "@/services/knowledge-management.services";

const { Text } = Typography;

const KnowledgeFormSourceUrl = ({ 
  isMobile, 
  contentType = "teks", 
  contentId = null, // For edit mode
  isEditing = false, // Whether we're in edit mode
  form = null, // Form instance to update source_url field
}) => {
  const [uploadMode, setUploadMode] = useState("url"); // "upload" atau "url"
  const [fileList, setFileList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Determine allowed file types based on content type
  const getAllowedFileTypes = (type) => {
    switch (type) {
      case "gambar":
        return {
          accept: "image/*",
          maxSize: 10, // MB
          types: ["JPG", "PNG", "GIF", "WEBP", "SVG"],
          description: "Format yang didukung: JPG, PNG, GIF, WEBP, SVG (maksimal 10MB)"
        };
      case "video":
        return {
          accept: "video/*",
          maxSize: 100, // MB
          types: ["MP4", "AVI", "MOV", "WMV", "FLV", "WEBM"],
          description: "Format yang didukung: MP4, AVI, MOV, WMV, FLV, WEBM (maksimal 100MB)"
        };
      case "audio":
        return {
          accept: "audio/*",
          maxSize: 50, // MB
          types: ["MP3", "WAV", "OGG", "AAC", "FLAC"],
          description: "Format yang didukung: MP3, WAV, OGG, AAC, FLAC (maksimal 50MB)"
        };
      default:
        return {
          accept: "*/*",
          maxSize: 10, // MB
          types: ["PDF", "DOC", "DOCX", "TXT", "RTF"],
          description: "Format yang didukung: PDF, DOC, DOCX, TXT, RTF (maksimal 10MB)"
        };
    }
  };

  const fileConfig = getAllowedFileTypes(contentType);

  // Custom upload handler for media files
  const handleMediaUpload = async ({ file, onSuccess, onError, onProgress }) => {
    try {
      setIsUploading(true);
      onProgress({ percent: 10 });

      const formData = new FormData();
      formData.append("media", file);

      let response;
      
      onProgress({ percent: 50 });
      
      if (isEditing && contentId) {
        // Edit mode: upload immediately to existing content
        response = await uploadKnowledgeContentMedia(contentId, formData);
      } else {
        // Create mode: upload to temporary location
        response = await uploadKnowledgeContentMediaCreate(formData);
      }

      onProgress({ percent: 100 });

      console.log("Upload response:", response);
      console.log("isEditing:", isEditing, "contentId:", contentId);
      
      if (response?.success && response?.data) {
        let mediaUrl;
        let mediaData;
        
        if (isEditing && contentId) {
          // Edit mode response structure:
          // { data: { media: { url, filename, ... } } }
          mediaUrl = response.data.media?.url;
          mediaData = response.data.media;
          console.log("Edit mode - extracted URL:", mediaUrl);
        } else {
          // Create mode response structure:
          // { data: { url, filename, ... } }
          mediaUrl = response.data.url;
          mediaData = response.data;
          console.log("Create mode - extracted URL:", mediaUrl);
        }
        
        if (mediaUrl) {
          // Update the form's source_url field
          if (form) {
            console.log("Updating form field source_url with:", mediaUrl);
            form.setFieldValue("source_url", mediaUrl);
            console.log("Form values after update:", form.getFieldsValue());
          } else {
            console.error("Form instance not available");
          }
          
          onSuccess(mediaData || response.data, file);
          message.success(`${file.name} berhasil diupload`);
        } else {
          console.error("No URL found in response");
          throw new Error("Upload gagal: Tidak ada URL yang dikembalikan");
        }
      } else {
        console.error("Invalid response structure:", response);
        throw new Error("Upload gagal: Response tidak valid");
      }
    } catch (error) {
      console.error("Media upload error:", error);
      message.error(`Upload gagal: ${error.message}`);
      onError(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadProps = {
    accept: fileConfig.accept,
    maxCount: 1,
    fileList,
    onChange: handleFileChange,
    customRequest: handleMediaUpload,
    beforeUpload: (file) => {
      const isValidSize = file.size / 1024 / 1024 < fileConfig.maxSize;
      if (!isValidSize) {
        message.error(`File tidak boleh lebih besar dari ${fileConfig.maxSize}MB!`);
        return false;
      }
      return true; // Allow upload
    },
    onRemove: () => {
      setFileList([]);
      // Clear the source_url field when file is removed
      if (form) {
        form.setFieldValue("source_url", "");
      }
    }
  };

  const getPlaceholderText = (type) => {
    switch (type) {
      case "gambar":
        return "https://example.com/gambar.jpg atau masukkan URL gambar";
      case "video":
        return "https://youtube.com/watch?v=... atau https://vimeo.com/...";
      case "audio":
        return "https://soundcloud.com/... atau https://example.com/audio.mp3";
      case "teks":
        return "https://example.com/artikel.html (opsional - URL referensi/sumber)";
      default:
        return "https://example.com/dokumen.pdf atau masukkan URL sumber";
    }
  };

  const getUrlValidationRules = (type) => {
    const baseRules = [
      { 
        type: "url", 
        message: "Format URL tidak valid! Pastikan dimulai dengan http:// atau https://" 
      }
    ];

    // For text content, URL is optional
    if (type === "teks") {
      return baseRules; // No required rule for text content
    }

    // Add specific validation for different content types
    switch (type) {
      case "video":
        return [
          ...baseRules,
          {
            pattern: /(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/i,
            message: "Untuk video, gunakan URL dari YouTube, Vimeo, atau Dailymotion"
          }
        ];
      default:
        return baseRules;
    }
  };

  // Show upload/URL options for media content, URL-only for text content
  const showUploadOption = ["gambar", "video", "audio"].includes(contentType);

  return (
    <Form.Item
      label={
        <Flex align="center" gap="small">
          <Text strong style={{ fontSize: isMobile ? "13px" : "14px" }}>
            {contentType === "teks" 
              ? "Sumber/Referensi (Opsional)" 
              : `Sumber ${contentType.charAt(0).toUpperCase() + contentType.slice(1)}`
            }
          </Text>
          <Tooltip
            title={contentType === "teks" 
              ? "URL referensi atau sumber artikel yang menjadi acuan konten Anda (opsional)."
              : showUploadOption 
                ? `Upload file ${contentType} dari komputer Anda atau masukkan URL dari sumber eksternal. URL berguna untuk konten dari YouTube, Vimeo, atau platform lainnya.`
                : `Masukkan URL sumber ${contentType} dari platform eksternal.`
            }
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
      {showUploadOption && (
        <div style={{ marginBottom: "12px" }}>
          <Radio.Group
            value={uploadMode}
            onChange={(e) => setUploadMode(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            <Radio.Button value="url">
              <LinkOutlined /> URL/Link
            </Radio.Button>
            <Radio.Button value="upload">
              <UploadOutlined /> Upload File
            </Radio.Button>
          </Radio.Group>
        </div>
      )}

      {(!showUploadOption || uploadMode === "url") ? (
        <Form.Item
          name="source_url"
          rules={getUrlValidationRules(contentType)}
          style={{ margin: 0 }}
        >
          <Input
            placeholder={getPlaceholderText(contentType)}
            prefix={<LinkOutlined style={{ color: "#FF4500" }} />}
            style={{
              borderRadius: "6px",
              fontSize: isMobile ? "13px" : "14px",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#FF4500";
              e.target.style.boxShadow = "0 0 0 2px rgba(255, 69, 0, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#d9d9d9";
              e.target.style.boxShadow = "none";
            }}
          />
        </Form.Item>
      ) : showUploadOption && uploadMode === "upload" ? (
        <div>
          <Upload.Dragger
            {...uploadProps}
            disabled={isUploading}
            style={{
              borderRadius: "6px",
              borderColor: isUploading ? "#FF4500" : "#d9d9d9",
              backgroundColor: isUploading ? "#fff2e8" : "#fafafa",
            }}
          >
            <div style={{ padding: isMobile ? "16px" : "24px" }}>
              {isUploading ? (
                <LoadingOutlined
                  style={{ 
                    fontSize: isMobile ? "24px" : "32px", 
                    color: "#FF4500",
                    marginBottom: "8px"
                  }} 
                />
              ) : (
                <UploadOutlined 
                  style={{ 
                    fontSize: isMobile ? "24px" : "32px", 
                    color: "#FF4500",
                    marginBottom: "8px"
                  }} 
                />
              )}
              <div>
                <Text style={{ fontSize: isMobile ? "13px" : "14px" }}>
                  {isUploading 
                    ? `Mengupload ${contentType}...`
                    : `Klik atau seret file ${contentType} ke area ini`
                  }
                </Text>
              </div>
              <div style={{ marginTop: "4px" }}>
                <Text type="secondary" style={{ fontSize: isMobile ? "11px" : "12px" }}>
                  {fileConfig.description}
                </Text>
              </div>
            </div>
          </Upload.Dragger>

          {fileList.length > 0 && (
            <div style={{ 
              marginTop: "8px",
              padding: "8px 12px",
              backgroundColor: fileList[0]?.status === "done" ? "#f6ffed" : "#f0f8ff",
              border: fileList[0]?.status === "done" ? "1px solid #b7eb8f" : "1px solid #bae7ff",
              borderRadius: "6px"
            }}>
              <Flex align="center" justify="space-between">
                <Space>
                  <Text style={{ 
                    fontSize: "12px", 
                    color: fileList[0]?.status === "done" ? "#52c41a" : "#1890ff" 
                  }}>
                    {fileList[0]?.status === "done" ? "✅" : "⏳"} 
                    {fileList[0]?.status === "done" 
                      ? `File berhasil diupload: ${fileList[0]?.name}`
                      : `Mengupload: ${fileList[0]?.name}`
                    }
                  </Text>
                </Space>
                {!isUploading && (
                  <Button 
                    type="text" 
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setFileList([]);
                      if (form) {
                        form.setFieldValue("source_url", "");
                      }
                    }}
                    style={{ color: "#ff4d4f" }}
                  />
                )}
              </Flex>
            </div>
          )}

          {/* Show uploaded URL in read-only field when file is uploaded successfully */}
          {fileList.length > 0 && fileList[0]?.status === "done" && (
            <Form.Item
              name="source_url"
              style={{ margin: "8px 0 0 0" }}
              label={
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  URL File yang Diupload:
                </Text>
              }
            >
              <Input
                readOnly
                size="small"
                style={{
                  backgroundColor: "#f5f5f5",
                  color: "#666",
                  fontSize: "12px"
                }}
                prefix={<LinkOutlined style={{ color: "#52c41a" }} />}
                placeholder="URL akan muncul setelah upload berhasil"
              />
            </Form.Item>
          )}
        </div>
      ) : null}

      <div style={{ 
        marginTop: "8px", 
        padding: "6px 8px",
        backgroundColor: "#f0f8ff",
        borderRadius: "4px",
        border: "1px solid #bae7ff"
      }}>
        <Text type="secondary" style={{ fontSize: "11px" }}>
          💡 <strong>Tips:</strong> {contentType === "teks" 
            ? "URL referensi dapat berupa artikel, berita, atau sumber yang menjadi acuan konten Anda."
            : showUploadOption
              ? `Untuk ${contentType === "video" ? "video YouTube/Vimeo" : contentType === "gambar" ? "gambar dari web" : "file eksternal"}, gunakan mode URL. Untuk file dari komputer, gunakan mode Upload (akan diupload saat menyimpan).`
              : `Masukkan URL sumber ${contentType} dari platform eksternal.`
          }
        </Text>
      </div>
    </Form.Item>
  );
};

export default KnowledgeFormSourceUrl;