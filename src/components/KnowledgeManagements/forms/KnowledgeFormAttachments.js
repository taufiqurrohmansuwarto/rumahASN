import { uploadKnowledgeContentAttachment } from "@/services/knowledge-management.services";
import { QuestionCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Flex, Form, message, Tooltip, Typography, Upload } from "antd";

const { Text } = Typography;

const KnowledgeFormAttachments = ({ 
  isMobile, 
  fileList, 
  setFileList,
  contentId = null // Will be provided when editing existing content
}) => {
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // If we have contentId (editing mode), use knowledge service upload
      if (contentId) {
        formData.append('content_id', contentId);
        const response = await uploadKnowledgeContentAttachment(formData);
        if (response?.data?.url) {
          onSuccess({
            data: { 
              url: response.data.url,
              filename: response.data.filename || file.name,
              mimetype: response.data.mimetype || file.type,
              size: response.data.size || file.size
            }
          }, file);
        } else {
          onError(new Error('Upload failed: No URL returned'));
        }
      } else {
        // For new content, we'll handle upload during form submission
        // Just mark as done for now with file data
        onSuccess({
          data: { 
            file: file, // Store the actual file for later upload
            url: URL.createObjectURL(file), // Temporary URL for preview
            filename: file.name,
            mimetype: file.type,
            size: file.size
          }
        }, file);
      }
    } catch (error) {
      message.error(`Upload gagal: ${error.message}`);
      onError(error);
    }
  };

  return (
    <Form.Item
      label={
        <Flex align="center" gap="small">
          <Text
            strong
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            📎 Lampiran
          </Text>
          <Tooltip
            title="Upload file pendukung seperti dokumen, gambar, atau file lainnya yang terkait dengan konten Anda. Max 10MB per file."
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
      style={{ marginBottom: isMobile ? "16px" : "20px" }}
    >
      <Upload
        customRequest={customUpload}
        fileList={fileList}
        onChange={handleUploadChange}
        multiple
        maxCount={5}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
        beforeUpload={(file) => {
          const isLt10M = file.size / 1024 / 1024 < 10;
          if (!isLt10M) {
            message.error('File harus kurang dari 10MB!');
          }
          return isLt10M;
        }}
      >
        <Button
          icon={<UploadOutlined />}
          style={{
            borderColor: "#FF4500",
            color: "#FF4500",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#fff2e8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Upload File
        </Button>
      </Upload>
    </Form.Item>
  );
};

export default KnowledgeFormAttachments;