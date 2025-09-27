import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Alert,
  Card,
  Row,
  Col,
  message,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  SignatureOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import {
  useReviewDocument,
  useMarkForTte,
  useSignDocument,
  useRejectDocument,
} from "@/hooks/esign-bkd";

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const ReviewModal = ({ open, onCancel, document, onSuccess }) => {
  const [form] = Form.useForm();
  const { mutateAsync: reviewDocument, isLoading } = useReviewDocument();

  const handleFinish = async (values) => {
    try {
      await reviewDocument({ id: document.id, data: values });
      message.success("Review berhasil dikirim");
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error(error?.response?.data?.message || "Review gagal dikirim");
    }
  };

  return (
    <Modal
      title="Review Dokumen"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Card size="small" className="mb-4">
        <Title level={5}>{document?.title}</Title>
        <Text type="secondary">{document?.description}</Text>
      </Card>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="action"
          label="Keputusan Review"
          rules={[{ required: true, message: "Pilih keputusan review!" }]}
        >
          <Select placeholder="Pilih keputusan">
            <Option value="approve">Setujui</Option>
            <Option value="request_changes">Minta Perubahan</Option>
            <Option value="reject">Tolak</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Catatan"
          rules={[{ required: true, message: "Catatan wajib diisi!" }]}
        >
          <TextArea
            placeholder="Berikan catatan review..."
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="text-right">
          <Space>
            <Button onClick={onCancel}>Batal</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<CheckOutlined />}
            >
              Kirim Review
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

const SignModal = ({ open, onCancel, document, onSuccess }) => {
  const [form] = Form.useForm();
  const { mutateAsync: signDocument, isLoading } = useSignDocument();

  const handleFinish = async (values) => {
    try {
      await signDocument({ id: document.id, data: values });
      message.success("Dokumen berhasil ditandatangani");
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error(error?.response?.data?.message || "Tanda tangan gagal");
    }
  };

  return (
    <Modal
      title="Tanda Tangan Elektronik"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Card size="small" className="mb-4">
        <Title level={5}>{document?.title}</Title>
        <Text type="secondary">{document?.description}</Text>
      </Card>

      <Alert
        message="Tanda Tangan Digital"
        description="Dengan menandatangani dokumen ini, Anda menyetujui isi dokumen dan bertanggung jawab secara hukum."
        type="info"
        showIcon
        className="mb-4"
      />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="passphrase"
          label="Passphrase"
          rules={[
            { required: true, message: "Passphrase wajib diisi!" },
            { min: 6, message: "Passphrase minimal 6 karakter!" },
          ]}
          help="Masukkan passphrase untuk konfirmasi tanda tangan"
        >
          <Input.Password placeholder="Masukkan passphrase" autoComplete="off" />
        </Form.Item>

        <Form.Item name="signature_reason" label="Alasan Tanda Tangan">
          <Input placeholder="Alasan menandatangani dokumen (opsional)" />
        </Form.Item>

        <Form.Item name="signature_location" label="Lokasi">
          <Input placeholder="Lokasi tanda tangan (opsional)" />
        </Form.Item>

        <div className="text-right">
          <Space>
            <Button onClick={onCancel}>Batal</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<SignatureOutlined />}
              danger
            >
              Tanda Tangan
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

const MarkForTteModal = ({ open, onCancel, document, onSuccess }) => {
  const [form] = Form.useForm();
  const { mutateAsync: markForTte, isLoading } = useMarkForTte();

  const handleFinish = async (values) => {
    try {
      await markForTte({ id: document.id, data: values });
      message.success("Dokumen berhasil di-mark untuk TTE");
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error(error?.response?.data?.message || "Mark untuk TTE gagal");
    }
  };

  return (
    <Modal
      title="Mark untuk TTE"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Card size="small" className="mb-4">
        <Title level={5}>{document?.title}</Title>
        <Text type="secondary">{document?.description}</Text>
      </Card>

      <Alert
        message="Delegasi Tanda Tangan"
        description="Dokumen akan di-mark untuk ditandatangani oleh petugas TTE yang berwenang."
        type="warning"
        showIcon
        className="mb-4"
      />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="delegate_to"
          label="Delegasikan ke"
          rules={[{ required: true, message: "Pilih petugas TTE!" }]}
        >
          <Select placeholder="Pilih petugas TTE">
            <Option value="tte_officer_1">Petugas TTE 1</Option>
            <Option value="tte_officer_2">Petugas TTE 2</Option>
            <Option value="auto">Otomatis (Sistem)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Catatan"
          rules={[{ required: true, message: "Catatan wajib diisi!" }]}
        >
          <TextArea
            placeholder="Catatan untuk petugas TTE..."
            rows={3}
            maxLength={300}
            showCount
          />
        </Form.Item>

        <div className="text-right">
          <Space>
            <Button onClick={onCancel}>Batal</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<SendOutlined />}
            >
              Mark untuk TTE
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

const RejectModal = ({ open, onCancel, document, onSuccess }) => {
  const [form] = Form.useForm();
  const { mutateAsync: rejectDocument, isLoading } = useRejectDocument();

  const handleFinish = async (values) => {
    try {
      await rejectDocument({ id: document.id, data: values });
      message.success("Dokumen berhasil ditolak");
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      message.error(error?.response?.data?.message || "Penolakan gagal");
    }
  };

  return (
    <Modal
      title="Tolak Dokumen"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Card size="small" className="mb-4">
        <Title level={5}>{document?.title}</Title>
        <Text type="secondary">{document?.description}</Text>
      </Card>

      <Alert
        message="Penolakan Dokumen"
        description="Dokumen akan ditolak dan dikembalikan ke pemohon untuk diperbaiki."
        type="error"
        showIcon
        className="mb-4"
      />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="rejection_reason"
          label="Alasan Penolakan"
          rules={[{ required: true, message: "Alasan penolakan wajib diisi!" }]}
        >
          <Select placeholder="Pilih alasan penolakan">
            <Option value="incomplete_document">Dokumen tidak lengkap</Option>
            <Option value="incorrect_format">Format tidak sesuai</Option>
            <Option value="invalid_content">Konten tidak valid</Option>
            <Option value="missing_requirement">Persyaratan tidak terpenuhi</Option>
            <Option value="other">Lainnya</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="notes"
          label="Catatan Penolakan"
          rules={[{ required: true, message: "Catatan penolakan wajib diisi!" }]}
        >
          <TextArea
            placeholder="Jelaskan detail penolakan..."
            rows={4}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="text-right">
          <Space>
            <Button onClick={onCancel}>Batal</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<CloseOutlined />}
              danger
            >
              Tolak Dokumen
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

function WorkflowActions({ document, onRefresh }) {
  const [modals, setModals] = useState({
    review: false,
    sign: false,
    markForTte: false,
    reject: false,
  });

  const openModal = (type) => {
    setModals({ ...modals, [type]: true });
  };

  const closeModal = (type) => {
    setModals({ ...modals, [type]: false });
  };

  const handleSuccess = (type) => {
    closeModal(type);
    onRefresh?.();
  };

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Button
            block
            size="large"
            icon={<EditOutlined />}
            onClick={() => openModal("review")}
          >
            Review
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button
            block
            size="large"
            type="primary"
            icon={<SignatureOutlined />}
            onClick={() => openModal("sign")}
          >
            Tanda Tangan
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button
            block
            size="large"
            icon={<SendOutlined />}
            onClick={() => openModal("markForTte")}
          >
            Mark TTE
          </Button>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Button
            block
            size="large"
            danger
            icon={<CloseOutlined />}
            onClick={() => openModal("reject")}
          >
            Tolak
          </Button>
        </Col>
      </Row>

      <ReviewModal
        open={modals.review}
        onCancel={() => closeModal("review")}
        document={document}
        onSuccess={() => handleSuccess("review")}
      />

      <SignModal
        open={modals.sign}
        onCancel={() => closeModal("sign")}
        document={document}
        onSuccess={() => handleSuccess("sign")}
      />

      <MarkForTteModal
        open={modals.markForTte}
        onCancel={() => closeModal("markForTte")}
        document={document}
        onSuccess={() => handleSuccess("markForTte")}
      />

      <RejectModal
        open={modals.reject}
        onCancel={() => closeModal("reject")}
        document={document}
        onSuccess={() => handleSuccess("reject")}
      />
    </>
  );
}

export default WorkflowActions;