import { StarOutlined } from "@ant-design/icons";
import { Button, Card, Divider, Space, Typography } from "antd";

const { Title, Text, Paragraph } = Typography;

// Dummy data
const dummyMessage = {
  subject: "We noticed a new login to your Todoist account",
  sender: "Todoist",
  senderEmail: "no-reply@todoist.com",
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
  return (
    <Card style={{ width: "100%" }}>
      {/* Message Header */}
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        <Title level={4}>{message?.subject}</Title>
        <Space style={{ justifyContent: "space-between", width: "100%" }}>
          <Space>
            <Text strong>{message?.sender}</Text>
            <Text type="secondary">{`<${message?.senderEmail}>`}</Text>
          </Space>
          <Text type="secondary">{message?.date}</Text>
        </Space>
        <Text type="secondary">to me</Text>
      </Space>

      {/* Action Buttons */}
      <Space style={{ marginTop: 16, marginBottom: 16 }}>
        <Button icon={<StarOutlined />} />
        <Button icon={<StarOutlined />}>Reply</Button>
        <Button icon={<StarOutlined />} />
        <Button icon={<StarOutlined />} />
        <Button icon={<StarOutlined />} />
        <Button icon={<StarOutlined />} />
      </Space>

      <Divider />

      {/* Message Content */}
      <Space direction="vertical" style={{ width: "100%" }} size="small">
        <Paragraph>
          <Text>Hi {message?.recipient},</Text>
        </Paragraph>
        <Paragraph>
          A new login was detected for your Todoist account:
          <br />
          <a href={`mailto:${message?.accountEmail}`}>
            {message?.accountEmail}
          </a>
        </Paragraph>
        <Card style={{ backgroundColor: "#f5f5f5", marginBottom: 16 }}>
          <Paragraph>
            Date: {message?.loginDate}
            <br />
            Device: {message?.loginDevice}
            <br />
            IP address: {message?.loginIp}
            <br />
            Location: {message?.loginLocation}
          </Paragraph>
        </Card>
        <Paragraph>
          Don&apos;t recognize this activity?{" "}
          <a href={message?.resetPasswordLink}>
            Reset your password immediately
          </a>
          .
          <br />
          Resetting your password will log you out on every device and issue a
          new API token.
        </Paragraph>
        <Paragraph>If this was you: Great! Enjoy Todoist.</Paragraph>
        <Paragraph>
          For any further help, <a href={message?.contactLink}>contact us</a>.
        </Paragraph>
        <Paragraph>
          Productively,
          <br />
          Todoist
        </Paragraph>
      </Space>
    </Card>
  );
};

export default InboxMessageDetail;
