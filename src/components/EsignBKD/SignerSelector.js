import { useState, useEffect } from "react";
import {
  Modal,
  List,
  Button,
  Select,
  Avatar,
  Tag,
  Space,
  Typography,
  Radio,
  Empty,
  Card,
  Flex,
  Badge,
} from "antd";
import { PlusOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { useUserSearch } from "@/hooks/esign-bkd/useUsers";

const { Text } = Typography;

/**
 * Compact signer selector dengan Ant Design - Sequential View
 */
function SignerSelector({
  visible,
  onClose,
  onSave,
  initialSigners = [],
  initialReviewers = [],
}) {
  const [participants, setParticipants] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedType, setSelectedType] = useState("signer");

  // Use API hook
  const { userOptions, isLoading, handleSearch } = useUserSearch();

  // SYNC dengan initial values saat modal dibuka
  useEffect(() => {
    if (visible) {
      // Combine initial signers and reviewers
      const combined = [
        ...initialSigners.map((s, idx) => ({
          ...s,
          type: "signer",
          sequence: idx + 1,
        })),
        ...initialReviewers.map((r, idx) => ({
          ...r,
          type: "reviewer",
          sequence: initialSigners.length + idx + 1,
        })),
      ].sort((a, b) => a.sequence - b.sequence);

      setParticipants(combined);
    }
  }, [visible, initialSigners, initialReviewers]);

  // CUSTOM: Format options untuk tampilkan nama dan avatar saja
  const customOptions = userOptions.map((opt) => ({
    value: opt.value,
    label: (
      <Flex align="center" gap={8}>
        <Avatar
          size={24}
          src={opt.user.image || opt.user.avatar}
          icon={<UserOutlined />}
        />
        <Text style={{ fontSize: 13 }}>{opt.user.username}</Text>
      </Flex>
    ),
    user: opt.user,
  }));

  const addPerson = () => {
    if (!selectedUserId) return;

    const selectedOption = customOptions.find(
      (opt) => opt.value === selectedUserId
    );
    if (!selectedOption) return;

    const person = {
      id: selectedOption.user.id,
      name: selectedOption.user.username,
      image: selectedOption.user.image || selectedOption.user.avatar,
      nip: selectedOption.user.id,
      position: selectedOption.user.nama_jabatan || "Staff",
      type: selectedType,
      sequence: participants.length + 1, // Sequential order
    };

    // Check if already exists
    const exists = participants.some((p) => p.id === person.id);

    if (exists) {
      Modal.warning({
        title: "Sudah Ada",
        content: "Orang ini sudah ditambahkan",
      });
      return;
    }

    // Add to list
    setParticipants([...participants, person]);
    setSelectedUserId(null);
  };

  const removePerson = (id) => {
    // Remove and reorder sequence
    const filtered = participants.filter((p) => p.id !== id);
    const reordered = filtered.map((p, idx) => ({
      ...p,
      sequence: idx + 1,
    }));
    setParticipants(reordered);
  };

  const handleSave = () => {
    // Separate back to signers and reviewers WITH sequence_order
    const signers = participants
      .filter((p) => p.type === "signer")
      .map(({ type, ...rest }) => ({
        ...rest,
        sequence_order: rest.sequence, // Keep original sequence
      }));

    const reviewers = participants
      .filter((p) => p.type === "reviewer")
      .map(({ type, ...rest }) => ({
        ...rest,
        sequence_order: rest.sequence, // Keep original sequence
      }));

    onSave({ signers, reviewers });
    onClose();
  };

  const handleCancel = () => {
    setSelectedUserId(null);
    onClose();
  };

  const canSave = participants.length > 0;
  const signerCount = participants.filter((p) => p.type === "signer").length;
  const reviewerCount = participants.filter(
    (p) => p.type === "reviewer"
  ).length;

  return (
    <Modal
      title="Kelola Peserta Sequential"
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Batal
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={handleSave}
          disabled={!canSave}
        >
          Simpan ({participants.length} orang)
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* Add Person */}
        <Card size="small">
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Radio.Group
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              size="small"
              buttonStyle="solid"
            >
              <Radio.Button value="signer">Penandatangan</Radio.Button>
              <Radio.Button value="reviewer">Reviewer</Radio.Button>
            </Radio.Group>

            <Select
              showSearch
              placeholder="Cari nama..."
              style={{ width: "100%" }}
              options={customOptions}
              value={selectedUserId}
              onChange={setSelectedUserId}
              onSearch={handleSearch}
              loading={isLoading}
              filterOption={false}
              size="small"
            />

            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={addPerson}
              disabled={!selectedUserId}
              block
            >
              Tambah sebagai{" "}
              {selectedType === "signer" ? "Penandatangan" : "Reviewer"}
            </Button>
          </Space>
        </Card>

        {/* Sequential List */}
        <div>
          <Space size="small" style={{ marginBottom: 8 }}>
            <Text strong style={{ fontSize: 14 }}>
              Urutan Sequential
            </Text>
            <Tag color="blue">{signerCount} Penandatangan</Tag>
            <Tag>{reviewerCount} Reviewer</Tag>
          </Space>

          {participants.length === 0 ? (
            <Empty
              description="Belum ada peserta"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: "16px 0" }}
            />
          ) : (
            <List
              size="small"
              bordered
              dataSource={participants}
              renderItem={(person) => (
                <List.Item
                  style={{ padding: "12px" }}
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => removePerson(person.id)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge
                        count={person.sequence}
                        style={{
                          backgroundColor:
                            person.type === "signer" ? "#1890ff" : "#d9d9d9",
                        }}
                      >
                        <Avatar
                          src={person.image}
                          size="default"
                          icon={<UserOutlined />}
                        />
                      </Badge>
                    }
                    title={
                      <Space size="small">
                        <Text strong style={{ fontSize: 13 }}>
                          {person.name}
                        </Text>
                      </Space>
                    }
                    description={
                      <Tag
                        color={person.type === "signer" ? "blue" : "default"}
                        style={{ marginTop: 4, fontSize: 11 }}
                      >
                        {person.type === "signer"
                          ? "Penandatangan"
                          : "Reviewer"}
                      </Tag>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Info */}
        {participants.length > 0 && (
          <Card size="small" style={{ backgroundColor: "#f0f5ff" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 Dokumen akan diajukan secara sequential dari urutan 1 →{" "}
              {participants.length}
            </Text>
          </Card>
        )}
      </Space>
    </Modal>
  );
}

export default SignerSelector;
