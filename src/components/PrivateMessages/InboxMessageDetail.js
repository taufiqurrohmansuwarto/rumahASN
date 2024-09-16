import {
  DeleteOutlined,
  MoreOutlined,
  PrinterOutlined,
  SendOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  message,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import ReplyMessage from "./ReplyMessage";

const { Title, Text, Paragraph } = Typography;

// Dummy data
const dummyMessage = {
  subject: "We noticed a new login to your Todoist account",
  sender: "Todoist",
  senderEmail: "no-reply@todoist.com",
  senderAvatar: null, // URL to avatar image, null for default icon
  date: "10 Sept 2024, 07:47 (1 day ago)",
  recipient: "Iput",
  accountEmail: "taufiqurrohman.suwarto@gmail.com",
  loginDate: "10 Sep 2024 7:47 AM",
  loginDevice: "Android v11532, undefined undefined",
  loginIp: "2404:c0:9c90::1f76:6181",
  loginLocation: "Indonesia (This location may not be exact)",
  resetPasswordLink: "#",
  contactLink: "#",
};

const InboxMessageDetail = ({ message = dummyMessage }) => {
  const [replyVisible, setReplyVisible] = useState(false);

  const handleReply = () => {
    setReplyVisible(true);
  };

  const recipient = {
    name: "Iput",
    email: "taufiqurrohman.suwarto@gmail.com",
    avatar:
      "https://lh3.googleusercontent.com/a/ACg8ocLQbvjH7A3VfNzGBDgcPd4Noy7Ey685NYAkGTwMmSOowptfVNts=s40-p",
  };

  const handleSendReply = (content) => {
    console.log("Sending reply:", content);
    message.success("Reply sent successfully!");
    setReplyVisible(false);
  };
  return (
    <Card style={{ width: "100%" }}>
      {/* Message Header */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Title level={4}>{message.subject}</Title>
        </Col>
        <Col xs={24} sm={12}>
          <Space align="start">
            <Avatar
              size={40}
              src={message.senderAvatar}
              icon={!message.senderAvatar && <UserOutlined />}
            />
            <Space direction="vertical" size={0}>
              <Space wrap>
                <Text strong>{message.sender}</Text>
                <Text type="secondary">{`<${message.senderEmail}>`}</Text>
              </Space>
              <Text type="secondary">to me</Text>
            </Space>
          </Space>
        </Col>
        <Col xs={24} sm={12} style={{ textAlign: "right" }}>
          <Text type="secondary">{message.date}</Text>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Row style={{ marginTop: 16, marginBottom: 16 }}>
        <Col xs={24}>
          <Space wrap>
            <Button icon={<StarOutlined />} />
            <Button icon={<SendOutlined />} onClick={handleReply}>
              Reply
            </Button>
            <Button icon={<StarOutlined />} />
            <Button icon={<PrinterOutlined />} />
            <Button icon={<DeleteOutlined />} />
            <Button icon={<MoreOutlined />} />
          </Space>
        </Col>
      </Row>

      <Divider />

      {/* Message Content */}
      <Row>
        <Col xs={24}>
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Paragraph>
              <Text>Hi {message.recipient},</Text>
            </Paragraph>
            <Paragraph>
              A new login was detected for your Todoist account:
              <br />
              <a href={`mailto:${message.accountEmail}`}>
                {message.accountEmail}
              </a>
            </Paragraph>
            <Card style={{ backgroundColor: "#f5f5f5", marginBottom: 16 }}>
              <Paragraph>
                Date: {message.loginDate}
                <br />
                Device: {message.loginDevice}
                <br />
                IP address: {message.loginIp}
                <br />
                Location: {message.loginLocation}
              </Paragraph>
            </Card>
            <Paragraph>
              <a href={message.resetPasswordLink}>
                Reset your password immediately
              </a>
              .
              <br />
              Resetting your password will log you out on every device and issue
              a new API token.
            </Paragraph>
            <Paragraph>If this was you: Great! Enjoy Todoist.</Paragraph>
            <Paragraph>
              For any further help, <a href={message.contactLink}>contact us</a>
              .
            </Paragraph>
            <Paragraph>
              Productively,
              <br />
              Todoist
            </Paragraph>
          </Space>
        </Col>
      </Row>
      <ReplyMessage
        visible={replyVisible}
        onCancel={() => setReplyVisible(false)}
        recipient={recipient}
        onSend={handleSendReply}
      />
    </Card>
  );
};

export default InboxMessageDetail;
