import { useState, useMemo, useEffect } from "react";
import { Table, Button, Input, Badge, Modal, Select, Space } from "antd";
import { LockOutlined, UnlockOutlined, ExclamationCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { formatUsername } from "../utils/helpers";
import dayjs from "dayjs";

const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;

export const OperatorListTable = ({
  operators,
  isLoading,
  onToggleLock,
  onDelete,
  onLockAll,
  onUnlockAll,
  isLocking,
  isDeleting,
  isLockingAll,
  isUnlockingAll,
}) => {
  const [searchText, setSearchText] = useState("");
  const [lockFilter, setLockFilter] = useState("all"); // all, locked, unlocked
  const [loadingOperatorId, setLoadingOperatorId] = useState(null);
  const [deletingOperatorId, setDeletingOperatorId] = useState(null);

  // Filter operators berdasarkan search dan status lock
  const filteredOperators = useMemo(() => {
    if (!operators || !Array.isArray(operators)) return [];
    
    let filtered = operators;

    // Filter by lock status
    if (lockFilter === "locked") {
      filtered = filtered.filter((item) => item.is_locked === true);
    } else if (lockFilter === "unlocked") {
      filtered = filtered.filter((item) => item.is_locked === false || !item.is_locked);
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((item) => {
        const idParts = item.user_id?.split("|") || [];
        const username = formatUsername(item.user_id, item.user?.username);
        const unorId = item.unor_id || "";

        return (
          username.toLowerCase().includes(searchLower) ||
          unorId.toLowerCase().includes(searchLower) ||
          item.user?.username?.toLowerCase().includes(searchLower) ||
          (idParts.length > 1 && idParts[1].toLowerCase().includes(searchLower))
        );
      });
    }

    return filtered;
  }, [operators, searchText, lockFilter]);

  const handleToggleLock = (record) => {
    const isLocked = record.is_locked;
    const username = formatUsername(record.user_id, record.user?.username);

    confirm({
      title: `Konfirmasi ${isLocked ? "Unlock" : "Lock"} Operator`,
      icon: <ExclamationCircleOutlined />,
      content: `Apakah Anda yakin ingin ${isLocked ? "membuka lock" : "mengunci"} operator "${username}"?`,
      okText: "Ya",
      cancelText: "Batal",
      okType: isLocked ? "default" : "danger",
      onOk() {
        setLoadingOperatorId(record.id);
        onToggleLock({
          id: record.id,
          data: { is_locked: !isLocked },
        });
      },
    });
  };

  const handleLockAll = () => {
    confirm({
      title: "Konfirmasi Lock Semua Operator",
      icon: <ExclamationCircleOutlined />,
      content: `Apakah Anda yakin ingin mengunci semua operator? Tindakan ini akan mengunci semua operator yang terdaftar.`,
      okText: "Ya, Lock Semua",
      cancelText: "Batal",
      okType: "danger",
      onOk() {
        onLockAll();
      },
    });
  };

  const handleDelete = (record) => {
    const username = formatUsername(record.user_id, record.user?.username);

    confirm({
      title: "Konfirmasi Hapus Operator",
      icon: <ExclamationCircleOutlined />,
      content: `Apakah Anda yakin ingin menghapus operator "${username}"? Tindakan ini tidak dapat dibatalkan.`,
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk() {
        setDeletingOperatorId(record.id);
        onDelete({ id: record.id });
      },
    });
  };

  const handleUnlockAll = () => {
    confirm({
      title: "Konfirmasi Unlock Semua Operator",
      icon: <ExclamationCircleOutlined />,
      content: `Apakah Anda yakin ingin membuka lock semua operator? Tindakan ini akan membuka lock semua operator yang terdaftar.`,
      okText: "Ya, Unlock Semua",
      cancelText: "Batal",
      okType: "default",
      onOk() {
        onUnlockAll();
      },
    });
  };

  // Reset loading state ketika mutation selesai
  useEffect(() => {
    if (!isLocking && loadingOperatorId) {
      setLoadingOperatorId(null);
    }
    if (!isDeleting && deletingOperatorId) {
      setDeletingOperatorId(null);
    }
  }, [isLocking, isDeleting, loadingOperatorId, deletingOperatorId]);

  const columns = [
    {
      title: "No",
      key: "no",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Unit Organisasi ID",
      dataIndex: "unor_id",
      key: "unor_id",
      width: 150,
    },
    {
      title: "Nama Operator",
      key: "nama_operator",
      width: 300,
      render: (_, record) => {
        const username = formatUsername(
          record.user_id,
          record.user?.username
        );
        return (
          <div>
            <Text size="sm" fw={500}>
              {username}
            </Text>
            {record.user?.username && (
              <div style={{ marginTop: "2px" }}>
                <Text size="10px" c="dimmed">
                  {record.user.username}
                </Text>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "User ID",
      dataIndex: "user_id",
      key: "user_id",
      width: 250,
    },
    {
      title: "Status",
      key: "status",
      width: 120,
      render: (_, record) => {
        const isLocked = record.is_locked;
        return (
          <Badge
            color={isLocked ? "red" : "green"}
            text={isLocked ? "Locked" : "Unlocked"}
          />
        );
      },
    },
    {
      title: "Locked By",
      key: "locked_by",
      width: 200,
      render: (_, record) => {
        if (!record.is_locked) return "-";
        return <Text size="sm">{record.locked_by || "-"}</Text>;
      },
    },
    {
      title: "Username Pengunci",
      key: "pengunci_username",
      width: 250,
      render: (_, record) => {
        if (!record.is_locked) return "-";
        return (
          <Text size="sm">
            {record.pengunci?.username || record.locked_by || "-"}
          </Text>
        );
      },
    },
    {
      title: "Tanggal Lock",
      key: "locked_at",
      width: 180,
      render: (_, record) => {
        if (!record.is_locked || !record.locked_at) return "-";
        return dayjs(record.locked_at).format("DD/MM/YYYY HH:mm:ss");
      },
    },
    {
      title: "Tanggal Dibuat",
      key: "created_at",
      width: 180,
      render: (_, record) =>
        dayjs(record.created_at).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Aksi",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        const isLocked = record.is_locked;
        const isLoadingThisOperator = loadingOperatorId === record.id && isLocking;
        const isDeletingThisOperator = deletingOperatorId === record.id && isDeleting;
        
        return (
          <Space size="small">
            <Button
              type={isLocked ? "default" : "primary"}
              danger={isLocked}
              icon={isLocked ? <UnlockOutlined /> : <LockOutlined />}
              size="small"
              loading={isLoadingThisOperator}
              onClick={() => handleToggleLock(record)}
            >
              {isLocked ? "Unlock" : "Lock"}
            </Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={isDeletingThisOperator}
              onClick={() => handleDelete(record)}
            >
              Hapus
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ marginTop: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flex: 1, minWidth: "300px" }}>
          <Search
            placeholder="Cari operator (nama atau user_id)..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1, maxWidth: "400px" }}
          />
          <Select
            value={lockFilter}
            onChange={setLockFilter}
            style={{ width: 150 }}
            placeholder="Filter Status"
          >
            <Option value="all">Semua</Option>
            <Option value="locked">Sudah Lock</Option>
            <Option value="unlocked">Belum Lock</Option>
          </Select>
        </div>
        <Space>
          <Button
            type="primary"
            danger
            icon={<LockOutlined />}
            loading={isLockingAll}
            onClick={handleLockAll}
          >
            Lock Semua
          </Button>
          <Button
            type="default"
            icon={<UnlockOutlined />}
            loading={isUnlockingAll}
            onClick={handleUnlockAll}
          >
            Unlock Semua
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={filteredOperators}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1700 }}
        size="middle"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total.toLocaleString("id-ID")} operator`,
        }}
      />
    </div>
  );
};
