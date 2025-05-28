// components/mail/EmailList/EmailListModals.js
import { DeleteOutlined } from "@ant-design/icons";
import { Modal, Space, Typography } from "antd";

const { Text } = Typography;

const EmailListModals = ({
  folder = "inbox",
  bulkDeleteModal = false,
  selectedEmails = [],
  isLoading = false,
  onConfirmBulkDelete,
  onCancelBulkDelete,
}) => {
  const handleConfirm = () => {
    onConfirmBulkDelete?.();
  };

  const handleCancel = () => {
    onCancelBulkDelete?.();
  };

  // Get context-specific messaging based on folder
  const getModalContent = () => {
    const isTrash = folder === "trash";
    const isPermanent = isTrash;

    return {
      title: isPermanent
        ? "Konfirmasi Hapus Permanen"
        : "Konfirmasi Hapus Email",
      description: isPermanent
        ? "Email akan dihapus secara permanen dan tidak dapat dipulihkan."
        : "Email yang dihapus akan dipindahkan ke folder Trash dan dapat dipulihkan dalam 30 hari.",
      okText: isPermanent ? "Ya, Hapus Permanen" : "Ya, Hapus Sekarang",
    };
  };

  const modalContent = getModalContent();

  return (
    <>
      {/* Bulk Delete Confirmation Modal */}
      <Modal
        title={
          <Space>
            <DeleteOutlined style={{ color: "#ff4d4f" }} />
            {modalContent.title}
          </Space>
        }
        open={bulkDeleteModal}
        onOk={handleConfirm}
        onCancel={handleCancel}
        okText={modalContent.okText}
        cancelText="Batal"
        okButtonProps={{
          danger: true,
          loading: isLoading,
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text style={{ fontSize: "16px" }}>
            Anda akan menghapus{" "}
            <Text strong>{selectedEmails.length} email</Text>.
          </Text>
          <br />
          <br />
          <Text type="secondary">{modalContent.description}</Text>
        </div>
      </Modal>

      {/* Future modals can be added here */}
      {/* e.g., Bulk Archive Modal, Bulk Move Modal, etc. */}
    </>
  );
};

export default EmailListModals;
