import { uploadKnowledgeContentAttachment, uploadMultipleKnowledgeContentAttachments } from "@/services/knowledge-management.services";
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
      if (contentId) {
        // Mode edit - upload immediately
        const formData = new FormData();
        formData.append('files', file);
        formData.append('content_id', contentId);
        
        const response = await uploadKnowledgeContentAttachment(contentId, formData);
        
        if (response?.success && response?.data?.length > 0) {
          const uploadedFile = response.data[0];
          
          onSuccess({
            success: true,
            data: {
              uid: uploadedFile.uid,
              url: uploadedFile.url,
              filename: uploadedFile.filename,
              size: uploadedFile.size,
              mimetype: uploadedFile.mimetype,
              status: 'done'
            }
          }, file);
          
          message.success(`File ${file.name} berhasil diupload!`);
        } else {
          throw new Error('Upload gagal: Format response tidak valid');
        }
      } else {
        // Mode create - store file untuk upload nanti
        onSuccess({
          data: { 
            uid: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            file: file,
            url: URL.createObjectURL(file),
            filename: file.name,
            mimetype: file.type,
            size: file.size,
            status: 'done',
            isTemporary: true
          }
        }, file);
      }
    } catch (error) {
      message.error(`Upload gagal: ${error.message}`);
      onError(error);
    }
  };

  // Batch upload semua pending files sekaligus
  const handleBatchUpload = async () => {
    if (!contentId) return;
    
    const pendingFiles = fileList
      .filter(file => file.response?.data?.isTemporary)
      .map(file => file.response.data.file);
    
    if (pendingFiles.length === 0) return;

    try {
      const response = await uploadMultipleKnowledgeContentAttachments(contentId, pendingFiles);
      
      if (response?.success && response?.data) {
        // Update fileList dengan uploaded files
        const updatedFileList = fileList.map(file => {
          if (file.response?.data?.isTemporary) {
            const uploadedFile = response.data.find(uploaded => 
              uploaded.name === file.response.data.filename
            );
            if (uploadedFile) {
              return {
                ...file,
                response: {
                  success: true,
                  data: {
                    ...uploadedFile,
                    isTemporary: false
                  }
                }
              };
            }
          }
          return file;
        });
        
        setFileList(updatedFileList);
        message.success(`${pendingFiles.length} file berhasil diupload!`);
      }
    } catch (error) {
      message.error(`Batch upload gagal: ${error.message}`);
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
            title="Upload maksimal 5 file pendukung. Setiap file maksimal 10MB."
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
        multiple={true}
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
          Upload Files (Max 5)
        </Button>
      </Upload>
      
      {/* Show batch upload button for pending files in edit mode */}
      {contentId && fileList.some(f => f.response?.data?.isTemporary) && (
        <Button 
          type="link" 
          onClick={handleBatchUpload}
          style={{ color: "#FF4500", marginTop: 8 }}
        >
          Upload Semua File Pending
        </Button>
      )}
    </Form.Item>
  );
};

export default KnowledgeFormAttachments;