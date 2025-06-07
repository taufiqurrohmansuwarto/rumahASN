import { PaperClipOutlined } from "@ant-design/icons";
import { Typography, Upload } from "antd";

const { Text } = Typography;

const AttachmentUploader = ({
  fileList,
  onChange,
  maxFiles = 5,
  maxSize = 10, // MB
  acceptedTypes = [".jpg", ".jpeg", ".png", ".pdf", ".doc", ".docx"],
  compact = false,
}) => {
  const uploadProps = {
    multiple: true,
    fileList,
    onChange,
    beforeUpload: () => false, // Prevent auto upload
    maxCount: maxFiles,
  };

  if (compact) {
    return (
      <Upload.Dragger
        {...uploadProps}
        style={{
          padding: "16px",
          backgroundColor: "#FAFAFA",
          border: "2px dashed #EDEFF1",
          borderRadius: "6px",
          minHeight: "80px",
        }}
      >
        <p className="ant-upload-drag-icon">
          <PaperClipOutlined style={{ fontSize: "20px", color: "#787C7E" }} />
        </p>
        <p
          className="ant-upload-text"
          style={{
            fontSize: "13px",
            margin: "4px 0 2px 0",
            color: "#1A1A1B",
          }}
        >
          Drag file atau klik untuk upload
        </p>
        <p
          className="ant-upload-hint"
          style={{ fontSize: "11px", color: "#787C7E", margin: 0 }}
        >
          Max {maxSize}MB, {maxFiles} files
        </p>
      </Upload.Dragger>
    );
  }

  return (
    <div style={{ marginBottom: "24px" }}>
      <Text
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#1A1A1B",
          display: "block",
          marginBottom: "8px",
        }}
      >
        Lampiran (Opsional)
      </Text>

      <Upload.Dragger
        {...uploadProps}
        style={{
          padding: "20px",
          backgroundColor: "#FAFAFA",
          border: "2px dashed #EDEFF1",
          borderRadius: "6px",
        }}
      >
        <p className="ant-upload-drag-icon">
          <PaperClipOutlined style={{ fontSize: "24px", color: "#787C7E" }} />
        </p>
        <p
          className="ant-upload-text"
          style={{
            fontSize: "14px",
            margin: "8px 0 4px 0",
            color: "#1A1A1B",
          }}
        >
          Klik atau drag file ke sini
        </p>
        <p
          className="ant-upload-hint"
          style={{ fontSize: "12px", color: "#787C7E", margin: 0 }}
        >
          Screenshot, dokumen, atau file pendukung lainnya (Max {maxSize}MB,{" "}
          {maxFiles} files)
        </p>
      </Upload.Dragger>

      <Text style={{ fontSize: "11px", color: "#787C7E", marginTop: "4px" }}>
        Tipe file yang didukung: {acceptedTypes.join(", ")}
      </Text>
    </div>
  );
};

export default AttachmentUploader;
