import { useSaveDraft, useSendEmail } from "@/hooks/useEmails";
import { EyeOutlined, SaveOutlined, SendOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tabs,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import AttachmentUploader from "./AttachmentUploader";
import EmailEditor from "./EmailEditor";
import EmailPreview from "./EmailPreview";
import RecipientSelector from "./RecipientSelector";

const ComposeModal = ({
  visible = false,
  onClose,
  onSent,
  mode = "compose", // compose, reply, forward
  originalEmail = null,
  replyAll = false,
  title = "Tulis Email Baru",
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("compose");
  const [recipients, setRecipients] = useState({ to: [], cc: [], bcc: [] });
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const sendEmail = useSendEmail();
  const saveDraft = useSaveDraft();

  // Initialize form based on mode
  useEffect(() => {
    if (mode === "reply" && originalEmail) {
      // Tentukan penerima berdasarkan mode reply
      let toRecipients = [];

      if (replyAll) {
        // Jika reply all, sertakan semua penerima asli (to + cc) kecuali pengirim saat ini
        const allOriginalRecipients = [
          ...(originalEmail.recipients?.to || []),
          ...(originalEmail.recipients?.cc || []),
        ];

        // Tambahkan pengirim asli ke daftar penerima
        toRecipients = [
          {
            label:
              originalEmail.sender?.username || originalEmail.sender?.email,
            value: originalEmail.sender_id,
          },
          ...allOriginalRecipients,
        ];
      } else {
        // Jika reply biasa, hanya balas ke pengirim asli
        toRecipients = [
          {
            label:
              originalEmail.sender?.username || originalEmail.sender?.email,
            value: originalEmail.sender_id,
          },
        ];
      }

      // Set penerima email
      setRecipients({
        to: toRecipients,
        cc: [],
        bcc: [],
      });

      // Set subjek email dengan prefix "Re:" jika belum ada
      form.setFieldsValue({
        subject: originalEmail.subject.startsWith("Re: ")
          ? originalEmail.subject
          : `Re: ${originalEmail.subject}`,
      });

      // Set konten pesan dengan format quote dari email asli
      setMessageContent(
        `\n\n--- Pesan Asli ---\nDari: ${
          originalEmail.sender?.username
        }\nTanggal: ${dayjs(originalEmail.created_at).format(
          "DD MMMM YYYY HH:mm"
        )}\nSubjek: ${originalEmail.subject}\n\n${originalEmail.content}`
      );
    } else if (mode === "forward" && originalEmail) {
      form.setFieldsValue({
        subject: originalEmail.subject.startsWith("Fwd: ")
          ? originalEmail.subject
          : `Fwd: ${originalEmail.subject}`,
      });

      setMessageContent(
        `\n\n--- Pesan Diteruskan ---\nDari: ${
          originalEmail.sender?.username
        }\nTanggal: ${dayjs(originalEmail.created_at).format(
          "DD MMMM YYYY HH:mm"
        )}\nSubjek: ${originalEmail.subject}\n\n${originalEmail.content}`
      );

      if (originalEmail.attachments) {
        setAttachments(originalEmail.attachments);
      }
    }
  }, [mode, originalEmail, replyAll, form]);

  const handleSend = async (values) => {
    if (recipients.to.length === 0) {
      message.error("Mohon tambahkan minimal satu penerima");
      return;
    }

    try {
      await sendEmail.mutateAsync({
        ...values,
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: attachments.map((att) => att.response?.id || att.id),
        type: "personal",
        parentId:
          mode === "reply" || mode === "forward" ? originalEmail?.id : null,
      });

      message.success("Email berhasil dikirim!");
      handleClose();
      onSent?.();
    } catch (error) {
      message.error("Gagal mengirim email");
    }
  };

  const handleSaveDraft = async () => {
    const values = form.getFieldsValue();

    try {
      const payload = {
        ...values,
        content: messageContent,
        recipients: {
          to: recipients.to.map((r) => r.value),
          cc: recipients.cc.map((r) => r.value),
          bcc: recipients.bcc.map((r) => r.value),
        },
        attachments: attachments.map((att) => att.response?.id || att.id),
      };
      await saveDraft.mutateAsync(payload);
      message.success("Draft tersimpan");
    } catch (error) {
      message.error("Gagal menyimpan draft");
    }
  };

  const handleClose = () => {
    form.resetFields();
    setRecipients({ to: [], cc: [], bcc: [] });
    setAttachments([]);
    setMessageContent("");
    setActiveTab("compose");
    setShowCc(false);
    setShowBcc(false);
    setIsMarkdown(false);
    setIsMinimized(false);
    onClose?.();
  };

  const modalTitle = (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>{title}</span>
    </div>
  );

  const composeContent = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSend}
      initialValues={{
        priority: "normal",
      }}
    >
      {/* Recipients */}
      <RecipientSelector
        recipients={recipients}
        onChange={setRecipients}
        showCc={showCc}
        showBcc={showBcc}
        onToggleCc={() => setShowCc(true)}
        onToggleBcc={() => setShowBcc(true)}
      />

      {/* Subject and Priority */}
      <Row gutter={16}>
        <Col xs={24} md={18}>
          <Form.Item
            name="subject"
            label="Subjek"
            rules={[{ required: true, message: "Mohon isi subjek email" }]}
          >
            <Input placeholder="Subjek email..." size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="priority" label="Prioritas">
            <Select size="large">
              <Select.Option value="low">Rendah</Select.Option>
              <Select.Option value="normal">Normal</Select.Option>
              <Select.Option value="high">Tinggi</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Message Content */}
      <EmailEditor
        content={messageContent}
        onChange={setMessageContent}
        isMarkdown={isMarkdown}
        onToggleMarkdown={setIsMarkdown}
        rows={isMinimized ? 4 : 8}
      />

      {/* Attachments */}
      {!isMinimized && (
        <AttachmentUploader
          attachments={attachments}
          onChange={setAttachments}
        />
      )}
    </Form>
  );

  const tabItems = [
    {
      key: "compose",
      label: "Tulis",
      children: composeContent,
    },
    {
      key: "preview",
      label: (
        <Space>
          <EyeOutlined />
          Preview
        </Space>
      ),
      children: (
        <EmailPreview
          subject={form.getFieldValue("subject")}
          recipients={recipients}
          content={messageContent}
          attachments={attachments}
          isMarkdown={isMarkdown}
        />
      ),
    },
  ];

  return (
    <Modal
      title={modalTitle}
      open={visible}
      onCancel={handleClose}
      width={isMinimized ? 600 : 900}
      destroyOnHidden
      maskClosable={false}
      style={isMinimized ? { top: "auto", bottom: 0 } : {}}
      styles={{
        padding: isMinimized ? "12px" : "24px",
        maxHeight: isMinimized ? "300px" : "70vh",
        overflowY: "auto",
      }}
      footer={[
        <Button
          key="draft"
          icon={<SaveOutlined />}
          onClick={handleSaveDraft}
          loading={saveDraft.isLoading}
        >
          Simpan Draft
        </Button>,
        <Button key="cancel" onClick={handleClose}>
          Batal
        </Button>,
        <Button
          key="send"
          type="primary"
          icon={<SendOutlined />}
          onClick={() => form.submit()}
          loading={sendEmail.isLoading}
        >
          Kirim
        </Button>,
      ]}
    >
      {isMinimized ? (
        composeContent
      ) : (
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      )}
    </Modal>
  );
};

export default ComposeModal;
