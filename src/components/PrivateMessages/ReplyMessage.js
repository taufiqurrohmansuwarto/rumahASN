import {
  DeleteOutlined,
  DownOutlined,
  FileImageOutlined,
  LockOutlined,
  PaperClipOutlined,
  SendOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Input,
  Modal,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

const { TextArea } = Input;
const { Text } = Typography;

const ReplyMessage = ({ visible, onCancel, onSend, recipient }) => {
  const [replyContent, setReplyContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  const handleSend = () => {
    onSend(replyContent);
    setReplyContent("");
    setPreviewMode(false);
  };

  const recipientMenu = (
    <Dropdown.Menu>
      <Dropdown.Item key="1">Reply</Dropdown.Item>
      <Dropdown.Item key="2">Reply all</Dropdown.Item>
      <Dropdown.Item key="3">Forward</Dropdown.Item>
    </Dropdown.Menu>
  );

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Space align="start">
          <Avatar
            size={40}
            src={recipient.avatar}
            icon={!recipient.avatar && <UserOutlined />}
          />
          <Space direction="vertical" size={0}>
            <Dropdown menu={recipientMenu}>
              <Space>
                <Text strong>{recipient.name}</Text>
                <Text type="secondary">{`<${recipient.email}>`}</Text>
                {/* <DownOutlined /> */}
              </Space>
            </Dropdown>
            <Text type="secondary">to me</Text>
          </Space>
        </Space>

        {previewMode ? (
          <ReactMarkdown>{replyContent}</ReactMarkdown>
        ) : (
          <TextArea
            rows={10}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply here..."
            variant="borderless"
            autoSize={{ minRows: 10, maxRows: 20 }}
          />
        )}

        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Space>
            <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
              Send
            </Button>
            <Tooltip title="Attach files">
              <Button icon={<PaperClipOutlined />} />
            </Tooltip>
            <Tooltip title="Insert emoji">
              <Button icon={<SmileOutlined />} />
            </Tooltip>
            <Tooltip title="Insert image">
              <Button icon={<FileImageOutlined />} />
            </Tooltip>
            <Tooltip title="Toggle confidential mode">
              <Button icon={<LockOutlined />} />
            </Tooltip>
          </Space>
          <Space>
            <Button icon={<DeleteOutlined />} onClick={onCancel} />
            <Button onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? "Edit" : "Preview"}
            </Button>
          </Space>
        </Space>
      </Space>
    </Modal>
  );
};

export default ReplyMessage;
