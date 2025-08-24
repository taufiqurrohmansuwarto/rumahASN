import { Input, Modal, Select, Space, Tag, Typography } from "antd";

const { Text } = Typography;
const { TextArea } = Input;

const StatusModal = ({
  visible,
  onCancel,
  onOk,
  content,
  selectedStatus,
  setSelectedStatus,
  statusReason,
  setStatusReason,
  getStatusInfo,
  statusOptions,
  loading
}) => {
  return (
    <Modal
      title="Ubah Status Konten"
      open={visible}
      onCancel={onCancel}
      onOk={onOk}
      okText="Simpan Status"
      cancelText="Batal"
      confirmLoading={loading}
      okButtonProps={{
        disabled:
          !selectedStatus ||
          selectedStatus === content.status ||
          (selectedStatus !== content.status && !statusReason.trim()),
      }}
      width={600}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <div>
          <Text
            style={{ display: "block", marginBottom: "8px", color: "#666" }}
          >
            Status saat ini:{" "}
            <Tag color={getStatusInfo(content.status).color}>
              {getStatusInfo(content.status).label}
            </Tag>
          </Text>
          <Text style={{ display: "block", marginBottom: "8px" }}>
            Pilih status baru:
          </Text>
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: "100%", marginBottom: "16px" }}
            size="large"
            placeholder="Pilih status baru"
            options={statusOptions.map((option) => ({
              ...option,
              label: (
                <div style={{ padding: "4px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "6px",
                      gap: "8px",
                    }}
                  >
                    <Tag
                      color={option.color}
                      style={{
                        minWidth: "8px",
                        textAlign: "center",
                        borderRadius: "50%",
                        margin: 0,
                      }}
                    >
                      ●
                    </Tag>
                    <Text strong style={{ fontSize: "14px" }}>
                      {option.label}
                    </Text>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      lineHeight: "1.4",
                      paddingLeft: "24px",
                      paddingRight: "8px",
                    }}
                  >
                    {option.description}
                  </div>
                </div>
              ),
            }))}
          />
        </div>

        {/* Reason Field */}
        <div>
          <Text style={{ display: "block", marginBottom: "8px" }}>
            Alasan perubahan status{" "}
            {selectedStatus && selectedStatus !== content.status
              ? "(Wajib diisi)"
              : "(Opsional)"}
            :
          </Text>
          <TextArea
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder={`Jelaskan alasan mengubah status dari ${getStatusInfo(
              content.status
            ).label.toLowerCase()} ke ${
              selectedStatus
                ? getStatusInfo(selectedStatus).label.toLowerCase()
                : "status baru"
            }...`}
            rows={4}
            maxLength={500}
            showCount
            style={{ width: "100%" }}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default StatusModal;