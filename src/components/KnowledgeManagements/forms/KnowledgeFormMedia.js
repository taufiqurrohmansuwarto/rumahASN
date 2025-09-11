import { InboxOutlined, PlayCircleOutlined, SoundOutlined, PictureOutlined } from "@ant-design/icons";
import { Upload, Typography, Progress, Alert, Space } from "antd";
import { useState } from "react";

const { Text } = Typography;
const { Dragger } = Upload;

function KnowledgeFormMedia({ 
  isMobile, 
  contentType, 
  mediaFile, 
  setMediaFile, 
  isUploading, 
  setIsUploading,
  uploadProgress,
  setUploadProgress,
  uploadMutation,
  contentId,
  revisionId
}) {
  const [error, setError] = useState(null);

  // Get media type configuration
  const getMediaConfig = () => {
    switch (contentType) {
      case 'video':
        return {
          icon: <PlayCircleOutlined style={{ fontSize: 48, color: '#ff4500' }} />,
          title: 'Upload Video',
          accept: 'video/*',
          description: 'Drag & drop video atau klik untuk browse',
          maxSize: 100, // MB
          formats: 'MP4, AVI, MOV, WMV'
        };
      case 'audio':
        return {
          icon: <SoundOutlined style={{ fontSize: 48, color: '#ff4500' }} />,
          title: 'Upload Audio',
          accept: 'audio/*',
          description: 'Drag & drop audio atau klik untuk browse',
          maxSize: 50, // MB
          formats: 'MP3, WAV, AAC, OGG'
        };
      case 'gambar':
        return {
          icon: <PictureOutlined style={{ fontSize: 48, color: '#ff4500' }} />,
          title: 'Upload Gambar',
          accept: 'image/*',
          description: 'Drag & drop gambar atau klik untuk browse',
          maxSize: 10, // MB
          formats: 'JPG, PNG, GIF, WEBP'
        };
      default:
        return {
          icon: <InboxOutlined style={{ fontSize: 48, color: '#ff4500' }} />,
          title: 'Upload File',
          accept: '*',
          description: 'Drag & drop file atau klik untuk browse',
          maxSize: 10, // MB
          formats: 'Semua format'
        };
    }
  };

  const config = getMediaConfig();

  const beforeUpload = (file) => {
    const isValidType = file.type.startsWith(contentType + '/') || contentType === 'gambar' && file.type.startsWith('image/');
    if (!isValidType) {
      setError(`File harus berformat ${config.formats}`);
      return false;
    }

    const isLtMaxSize = file.size / 1024 / 1024 < config.maxSize;
    if (!isLtMaxSize) {
      setError(`File harus lebih kecil dari ${config.maxSize}MB`);
      return false;
    }

    setError(null);
    return false; // Prevent automatic upload
  };

  const handleChange = async (info) => {
    const { fileList } = info;
    
    if (fileList.length > 0) {
      const file = fileList[0];
      
      // If we have uploadMutation and ids, upload immediately
      if (uploadMutation && contentId && revisionId && file.originFileObj) {
        try {
          setIsUploading(true);
          setUploadProgress(0);
          
          const formData = new FormData();
          formData.append('media', file.originFileObj);
          formData.append('type', contentType);
          
          const result = await uploadMutation.mutateAsync({
            contentId,
            versionId: revisionId,
            data: formData
          });
          
          // Update file with uploaded URL
          const uploadedFile = {
            ...file,
            url: result.url,
            status: 'done',
            response: result
          };
          
          setMediaFile(uploadedFile);
          setUploadProgress(100);
          setError(null);
        } catch (error) {
          setError(error.message || 'Upload gagal');
          setMediaFile(null);
        } finally {
          setIsUploading(false);
        }
      } else {
        // Just store file for later upload
        setMediaFile(file);
        setError(null);
      }
    } else {
      setMediaFile(null);
    }
  };

  const handleRemove = () => {
    setMediaFile(null);
    setError(null);
  };

  return (
    <div style={{ marginBottom: isMobile ? "16px" : "24px" }}>
      <Text
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: 500,
          color: "#1a1a1b",
          fontSize: isMobile ? "14px" : "14px",
        }}
      >
        {config.title} *
      </Text>

      {error && (
        <Alert
          message={error}
          type="error"
          style={{ marginBottom: 16 }}
          showIcon
        />
      )}

      <Dragger
        accept={config.accept}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onRemove={handleRemove}
        fileList={mediaFile ? [mediaFile] : []}
        maxCount={1}
        style={{
          backgroundColor: "#fafafa",
          border: "1px dashed #d9d9d9",
          borderRadius: "8px",
          padding: isMobile ? "16px" : "20px",
        }}
        disabled={isUploading}
      >
        <div style={{ textAlign: "center" }}>
          {config.icon}
          <p style={{ 
            margin: "16px 0 8px",
            fontSize: isMobile ? "14px" : "16px",
            fontWeight: 500,
            color: "#1a1a1b"
          }}>
            {config.description}
          </p>
          <p style={{ 
            margin: 0,
            fontSize: "12px",
            color: "#666",
            lineHeight: 1.4
          }}>
            Format: {config.formats} • Max: {config.maxSize}MB
          </p>
        </div>
      </Dragger>

      {/* Upload Progress */}
      {isUploading && (
        <div style={{ marginTop: 16 }}>
          <Progress 
            percent={uploadProgress} 
            status="active"
            strokeColor="#ff4500"
            size="small"
          />
          <Text style={{ fontSize: "12px", color: "#666" }}>
            Mengupload media...
          </Text>
        </div>
      )}

      {/* Media Preview */}
      {mediaFile && mediaFile.url && (
        <div style={{ 
          marginTop: 16,
          padding: 12,
          backgroundColor: "#f6f8fa",
          borderRadius: 8,
          border: "1px solid #e1e8ed"
        }}>
          <Space align="center">
            {config.icon}
            <div>
              <Text strong style={{ fontSize: "13px" }}>
                {mediaFile.name || 'Media File'}
              </Text>
              <br />
              <Text style={{ fontSize: "12px", color: "#666" }}>
                {mediaFile.url ? 'Tersimpan' : 'Siap diupload'}
              </Text>
            </div>
          </Space>
        </div>
      )}

      <div style={{ 
        marginTop: 8,
        fontSize: "11px", 
        color: "#888",
        lineHeight: 1.3
      }}>
        {uploadMutation && contentId && revisionId 
          ? "Tip: File akan diupload langsung setelah dipilih"
          : "Tip: File akan diupload saat menyimpan konten"
        }
      </div>
    </div>
  );
}

export default KnowledgeFormMedia;