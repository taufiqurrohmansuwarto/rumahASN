import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Popconfirm,
  message,
  Tabs,
  Tag,
  Avatar,
  Space,
  Spin,
  Typography,
  Flex,
  Breadcrumb,
} from "antd";
import {
  IconTrash,
  IconPlus,
  IconSettings,
  IconUsers,
  IconEye,
  IconColumns,
  IconTags,
} from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import LayoutKanban from "@/components/Kanban/LayoutKanban";
import MemberSelector from "@/components/Kanban/MemberSelector";
import {
  getProject,
  updateProject,
  deleteProject,
  getMembers,
  addMember,
  updateMember,
  removeMember,
  getWatchers,
  addWatcher,
  removeWatcher,
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
} from "../../../services/kanban.services";

const { TextArea } = Input;
const { Text, Title } = Typography;

function ProjectSettingsPage() {
  const router = useRouter();
  const { projectId } = router.query;
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch project
  const { data: project, isLoading } = useQuery(
    ["kanban-project", projectId],
    () => getProject(projectId),
    {
      enabled: !!projectId,
      onSuccess: (data) => {
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          icon: data.icon,
          color: data.color,
          visibility: data.visibility,
        });
      },
    }
  );

  // Fetch members
  const { data: members } = useQuery(
    ["kanban-members", projectId],
    () => getMembers(projectId),
    { enabled: !!projectId }
  );

  // Fetch watchers
  const { data: watchers } = useQuery(
    ["kanban-watchers", projectId],
    () => getWatchers(projectId),
    { enabled: !!projectId }
  );

  // Fetch columns
  const { data: columns } = useQuery(
    ["kanban-columns", projectId],
    () => getColumns(projectId),
    { enabled: !!projectId }
  );

  // Fetch labels
  const { data: labels } = useQuery(
    ["kanban-labels", projectId],
    () => getLabels(projectId),
    { enabled: !!projectId }
  );

  // Mutations
  const { mutate: update, isLoading: isUpdating } = useMutation(
    (data) => updateProject({ projectId, ...data }),
    {
      onSuccess: () => {
        message.success("Project berhasil diupdate");
        queryClient.invalidateQueries(["kanban-project", projectId]);
      },
      onError: () => message.error("Gagal mengupdate project"),
    }
  );

  const { mutate: remove, isLoading: isDeleting } = useMutation(
    () => deleteProject(projectId),
    {
      onSuccess: () => {
        message.success("Project berhasil dihapus");
        router.push("/kanban");
      },
      onError: () => message.error("Gagal menghapus project"),
    }
  );

  const { mutate: addMemberMutation } = useMutation(
    (data) => addMember({ projectId, ...data }),
    {
      onSuccess: () => {
        message.success("Member berhasil ditambahkan");
        queryClient.invalidateQueries(["kanban-members", projectId]);
      },
      onError: (err) =>
        message.error(err?.response?.data?.message || "Gagal menambah member"),
    }
  );

  const { mutate: removeMemberMutation } = useMutation(
    (memberId) => removeMember({ projectId, memberId }),
    {
      onSuccess: () => {
        message.success("Member berhasil dihapus");
        queryClient.invalidateQueries(["kanban-members", projectId]);
      },
      onError: () => message.error("Gagal menghapus member"),
    }
  );

  const { mutate: addWatcherMutation } = useMutation(
    (data) => addWatcher({ projectId, ...data }),
    {
      onSuccess: () => {
        message.success("Watcher berhasil ditambahkan");
        queryClient.invalidateQueries(["kanban-watchers", projectId]);
      },
      onError: (err) =>
        message.error(err?.response?.data?.message || "Gagal menambah watcher"),
    }
  );

  const { mutate: removeWatcherMutation } = useMutation(
    (watcherId) => removeWatcher({ projectId, watcherId }),
    {
      onSuccess: () => {
        message.success("Watcher berhasil dihapus");
        queryClient.invalidateQueries(["kanban-watchers", projectId]);
      },
      onError: () => message.error("Gagal menghapus watcher"),
    }
  );

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: "50vh" }}>
        <Spin size="large" />
      </Flex>
    );
  }

  const isOwner = project?.my_role === "owner";
  const canEdit = project?.can_edit;

  const memberColumns = [
    {
      title: "User",
      dataIndex: "user",
      render: (user) => (
        <Space size={8}>
          <Avatar src={user?.image} size={32}>
            {user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Text>{user?.username}</Text>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role) => (
        <Tag
          color={
            role === "owner" ? "blue" : role === "admin" ? "green" : "default"
          }
        >
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      render: (_, record) =>
        record.role !== "owner" && canEdit ? (
          <Popconfirm
            title="Hapus member ini?"
            onConfirm={() => removeMemberMutation(record.id)}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true, size: "small" }}
            cancelButtonProps={{ size: "small" }}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<IconTrash size={14} />}
            />
          </Popconfirm>
        ) : null,
    },
  ];

  const watcherColumns = [
    {
      title: "User",
      dataIndex: "user",
      render: (user) => (
        <Space size={8}>
          <Avatar src={user?.image} size={32}>
            {user?.username?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Text>{user?.username}</Text>
        </Space>
      ),
    },
    {
      title: "Dapat Komentar",
      dataIndex: "can_comment",
      render: (val) => (
        <Tag color={val ? "green" : "default"}>{val ? "Ya" : "Tidak"}</Tag>
      ),
    },
    {
      title: "Lihat Report",
      dataIndex: "can_view_reports",
      render: (val) => (
        <Tag color={val ? "green" : "default"}>{val ? "Ya" : "Tidak"}</Tag>
      ),
    },
    {
      title: "Aksi",
      render: (_, record) =>
        canEdit ? (
          <Popconfirm
            title="Hapus watcher ini?"
            onConfirm={() => removeWatcherMutation(record.id)}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true, size: "small" }}
            cancelButtonProps={{ size: "small" }}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<IconTrash size={14} />}
            />
          </Popconfirm>
        ) : null,
    },
  ];

  const tabItems = [
    {
      key: "general",
      label: (
        <Space size={4}>
          <IconSettings size={14} />
          <span>Umum</span>
        </Space>
      ),
      children: (
        <Card size="small">
          <Form form={form} layout="vertical" onFinish={update} size="small">
            <Form.Item
              name="name"
              label="Nama Project"
              rules={[{ required: true, message: "Nama project wajib diisi" }]}
            >
              <Input disabled={!canEdit} />
            </Form.Item>
            <Form.Item name="description" label="Deskripsi">
              <TextArea rows={3} disabled={!canEdit} />
            </Form.Item>
            <Form.Item name="visibility" label="Visibilitas">
              <Select
                disabled={!canEdit}
                style={{ width: 200 }}
                options={[
                  { value: "private", label: "Private" },
                  { value: "team", label: "Team" },
                ]}
              />
            </Form.Item>
            {canEdit && (
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Simpan
              </Button>
            )}
          </Form>

          {isOwner && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: "1px solid #f0f0f0",
              }}
            >
              <Text
                type="danger"
                strong
                style={{ display: "block", marginBottom: 8 }}
              >
                Zona Berbahaya
              </Text>
              <Popconfirm
                title="Yakin ingin menghapus project ini?"
                description="Semua data akan hilang dan tidak dapat dikembalikan."
                onConfirm={() => remove()}
                okText="Hapus"
                cancelText="Batal"
                okButtonProps={{ danger: true }}
              >
                <Button danger loading={isDeleting}>
                  Hapus Project
                </Button>
              </Popconfirm>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: "members",
      label: (
        <Space size={4}>
          <IconUsers size={14} />
          <span>Anggota</span>
        </Space>
      ),
      children: (
        <Card size="small">
          {canEdit && (
            <div style={{ marginBottom: 16 }}>
              <MemberSelector
                placeholder="Tambah anggota..."
                excludeIds={members?.map((m) => m.user?.custom_id) || []}
                onChange={(userId) => {
                  if (userId) {
                    addMemberMutation({ user_id: userId, role: "member" });
                  }
                }}
              />
            </div>
          )}
          <Table
            dataSource={members}
            columns={memberColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      ),
    },
    {
      key: "watchers",
      label: (
        <Space size={4}>
          <IconEye size={14} />
          <span>Pemantau</span>
        </Space>
      ),
      children: (
        <Card size="small">
          <Text
            type="secondary"
            style={{ display: "block", marginBottom: 12, fontSize: 12 }}
          >
            Pemantau dapat melihat progress dan laporan tanpa bisa mengedit
            task.
          </Text>
          {canEdit && (
            <div style={{ marginBottom: 16 }}>
              <MemberSelector
                placeholder="Tambah pemantau..."
                excludeIds={[
                  ...(members?.map((m) => m.user?.custom_id) || []),
                  ...(watchers?.map((w) => w.user?.custom_id) || []),
                ]}
                onChange={(userId) => {
                  if (userId) {
                    addWatcherMutation({ user_id: userId });
                  }
                }}
              />
            </div>
          )}
          <Table
            dataSource={watchers}
            columns={watcherColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Pengaturan - {project?.name} - Rumah ASN</title>
      </Head>

      <PageContainer
        loading={isLoading}
        title={`Pengaturan - ${project?.name || ""}`}
        subTitle="Kelola pengaturan project"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/kanban">Kanban</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={`/kanban/${projectId}`}>
                {project?.name || "Project"}
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Pengaturan</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <LayoutKanban projectId={projectId} active="settings">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            tabPosition="left"
            style={{ minHeight: 400 }}
            size="small"
          />
        </LayoutKanban>
      </PageContainer>
    </>
  );
}

ProjectSettingsPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

ProjectSettingsPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ProjectSettingsPage;
