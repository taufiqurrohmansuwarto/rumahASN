import { renderMarkdown, uploadFile } from "@/utils/client-utils";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { MarkdownEditor } from "@primer/react/drafts";
import { Flex, Form, Tooltip, Typography } from "antd";

const { Text } = Typography;

const KnowledgeFormContent = ({ isMobile, content, setContent }) => {
  return (
    <Form.Item
      label={
        <Flex align="center" gap="small">
          <Text
            strong
            style={{ fontSize: isMobile ? "13px" : "14px" }}
          >
            Konten
          </Text>
          <Tooltip
            title="Tulis konten yang lengkap dan terstruktur. Gunakan format markdown untuk styling. Sertakan langkah-langkah detail, gambar pendukung, dan contoh jika diperlukan. Konten yang baik akan membantu rekan kerja memahami topik dengan mudah."
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
      rules={[
        { required: true, message: "Konten harus diisi!" },
      ]}
    >
      <div
        style={{
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          overflow: "hidden",
        }}
      >
        <MarkdownEditor
          value={content}
          fullHeight
          acceptedFileTypes={[
            "image/*",
            ".doc",
            ".docx",
            ".xls",
            ".xlsx",
            ".txt",
            ".pdf",
          ]}
          onChange={setContent}
          placeholder="Jelaskan konten knowledge dengan detail, serta lampirkan file pendukung jika diperlukan."
          onRenderPreview={renderMarkdown}
          onUploadFile={uploadFile}
          mentionSuggestions={null}
        />
      </div>
    </Form.Item>
  );
};

export default KnowledgeFormContent;