import { Button, Modal } from "antd";
import { BranchesOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const CreateRevisionButton = ({
  onCreateRevision,
  isCreatingRevision,
  disabled = false,
}) => {
  const handleCreateRevision = () => {
    Modal.confirm({
      title: 'Buat Revisi Baru',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Apakah Anda yakin ingin membuat revisi baru untuk konten ini?</p>
          <p style={{ color: '#666', fontSize: '13px' }}>
            Revisi baru akan dibuat sebagai draft dan dapat Anda edit sebelum disubmit untuk review.
          </p>
        </div>
      ),
      okText: 'Ya, Buat Revisi',
      cancelText: 'Batal',
      okType: 'primary',
      onOk: () => {
        onCreateRevision();
      },
    });
  };

  return (
    <Button
      icon={<BranchesOutlined />}
      size="small"
      type="primary"
      loading={isCreatingRevision}
      disabled={disabled}
      onClick={handleCreateRevision}
    >
      Buat Revisi
    </Button>
  );
};

export default CreateRevisionButton;
