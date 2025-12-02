import {
  useCreateLabel,
  useDeleteLabel,
  useEmailStats,
  useUpdateLabel,
  useUserLabels,
} from "@/hooks/useEmails";
import { layoutToken } from "@/styles/rasn.theme";
import { Center } from "@mantine/core";
import {
  IconAlertCircle,
  IconArchive,
  IconChevronDown,
  IconChevronUp,
  IconFile,
  IconInbox,
  IconLogout,
  IconPencil,
  IconPlus,
  IconSend,
  IconSettings,
  IconStar,
  IconTag,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import {
  Badge,
  Button,
  ColorPicker,
  Dropdown,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";
import MegaMenuTop from "./MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "./Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "./Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "./Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "./Notification/NotifikasiPrivateMessage";

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  { ssr: false }
);

const { Text } = Typography;

function GmailLayout({ children, active = "inbox", onCompose }) {
  const { data } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const [showMoreItems, setShowMoreItems] = useState(false);

  // Modal state for managing labels
  const [labelModal, setLabelModal] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [editingLabel, setEditingLabel] = useState(null);
  const [createLabelForm] = Form.useForm();
  const [editLabelForm] = Form.useForm();

  // Fetch email stats untuk unread counts
  const { data: emailStats } = useEmailStats();

  // Fetch user labels untuk sidebar
  const { data: labelsData } = useUserLabels();
  const customLabels =
    labelsData?.data?.filter((label) => !label.is_system) || [];

  // Mutations for label management
  const createLabelMutation = useCreateLabel();
  const updateLabelMutation = useUpdateLabel();
  const deleteLabelMutation = useDeleteLabel();

  // Handle compose button click
  const handleCompose = () => {
    if (onCompose) {
      onCompose();
    } else {
      router.push("/mails/compose");
    }
  };

  // Handle create label
  const handleCreateLabel = async (values) => {
    try {
      await createLabelMutation.mutateAsync(values);
      createLabelForm.resetFields();
      setActiveTab("manage");
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Handle edit label
  const handleEditLabel = async (values) => {
    try {
      await updateLabelMutation.mutateAsync({
        labelId: editingLabel.id,
        ...values,
      });
      editLabelForm.resetFields();
      setEditingLabel(null);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Handle delete label
  const handleDeleteLabel = async (labelId) => {
    try {
      await deleteLabelMutation.mutateAsync(labelId);
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Start editing a label
  const startEditLabel = (label) => {
    setEditingLabel(label);
    editLabelForm.setFieldsValue({
      name: label.name,
      color: label.color,
    });
    setActiveTab("edit");
  };

  // Handle modal close
  const handleLabelModalClose = () => {
    createLabelForm.resetFields();
    editLabelForm.resetFields();
    setEditingLabel(null);
    setActiveTab("create");
    setLabelModal(false);
  };

  // Menu items configuration dengan flat structure
  const getAllRoutes = () => {
    const mainRoutes = [
      {
        key: "/mails/inbox",
        path: "/mails/inbox",
        name:
          emailStats?.data?.unreadCount > 0 ? (
            <Space>
              Inbox
              <Badge count={emailStats.data.unreadCount} size="small" />
            </Space>
          ) : (
            "Kotak Masuk"
          ),
        icon: <IconInbox size={16} />,
      },
      {
        key: "/mails/starred",
        path: "/mails/starred",
        name: "Ditandai",
        icon: <IconStar size={16} />,
      },
      {
        key: "/mails/sent",
        path: "/mails/sent",
        name: "Terkirim",
        icon: <IconSend size={16} />,
      },
      {
        key: "/mails/drafts",
        path: "/mails/drafts",
        name:
          emailStats?.data?.draftCount > 0 ? (
            <Space>
              Drafts
              <Badge count={emailStats.data.draftCount} size="small" />
            </Space>
          ) : (
            "Draf"
          ),
        icon: <IconFile size={16} />,
      },
      {
        key: "/mails/trash",
        path: "/mails/trash",
        name: "Sampah",
        icon: <IconTrash size={16} />,
      },
      {
        key: "/mails/archive",
        path: "/mails/archive",
        name: "Arsip",
        icon: <IconArchive size={16} />,
      },
      {
        key: "/mails/spam",
        path: "/mails/spam",
        name: "Spam",
        icon: <IconAlertCircle size={16} />,
      },
    ];

    const moreRoutes = [
      {
        key: "more-divider",
        name: "More",
        icon: showMoreItems ? (
          <IconChevronUp size={16} />
        ) : (
          <IconChevronDown size={16} />
        ),
        path: "#",
      },
      ...(showMoreItems
        ? [
            {
              key: "/mails/important",
              path: "/mails/important",
              name: "Important",
              icon: <IconTag size={16} />,
            },
            ...customLabels.map((label) => ({
              key: `/mails/label/${label.id}`,
              path: `/mails/label/${label.id}`,
              name:
                label.count > 0 ? (
                  <Space>
                    {label.name}
                    <Badge count={label.count} size="small" />
                  </Space>
                ) : (
                  label.name
                ),
              icon: <IconTag size={16} style={{ color: label.color }} />,
            })),
            {
              key: "create-label",
              path: "#",
              name: "Create Label",
              icon: <IconPlus size={16} />,
            },
          ]
        : []),
    ];

    return [...mainRoutes, ...moreRoutes];
  };

  // Menu item click handler
  const handleMenuClick = ({ key }) => {
    if (key === "more-divider") {
      setShowMoreItems(!showMoreItems);
      return;
    }

    if (key === "create-label") {
      setLabelModal(true);
      setActiveTab("create");
      return;
    }

    const route = getAllRoutes().find((r) => r.key === key);
    if (route?.path && route.path !== "#") {
      router.push(route.path);
    }
  };

  return (
    <ProLayout
      title="Rumah ASN Mail"
      defaultCollapsed={collapsed}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      selectedKeys={[active]}
      logo={null}
      layout="mix"
      token={layoutToken}
      menuExtraRender={({ collapsed, isMobile }) => {
        if (!collapsed) {
          if (isMobile)
            return (
              <Button
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 8,
                  marginTop: 8,
                }}
                onClick={handleCompose}
                size="middle"
                block
                shape="round"
                type="primary"
                icon={<IconPencil size={16} />}
              >
                Tulis Email
              </Button>
            );
          else {
            return (
              <Center>
                <Button
                  style={{
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "center",
                  }}
                  onClick={handleCompose}
                  shape="round"
                  icon={<IconPencil size={16} />}
                  block
                  type="primary"
                >
                  Tulis Email
                </Button>
              </Center>
            );
          }
        } else {
          return (
            <Center>
              <Button
                onClick={handleCompose}
                shape="circle"
                size="middle"
                icon={<IconPencil size={16} />}
                type="primary"
              />
            </Center>
          );
        }
      }}
      actionsRender={() => [
        <NotifikasiPrivateMessage
          key="private-message"
          url="/mails"
          title="Inbox Pesan Pribadi"
        />,
        <NotifikasiForumKepegawaian
          key="forum-kepegawaian"
          url="forum-kepegawaian"
          title="Inbox Forum Kepegawaian"
        />,
        <MegaMenuTop key="mega-menu" url="" title="Menu" />,
      ]}
      avatarProps={{
        src: data?.user?.image,
        size: "large",
        render: (props, dom) => {
          return (
            <Space>
              <Dropdown
                menu={{
                  onClick: (e) => {
                    if (e.key === "logout") {
                      signOut();
                    }
                    if (e.key === "profile") {
                      router.push("/settings/profile");
                    }
                    if (e.key === "mail-settings") {
                      router.push("/mails/settings");
                    }
                  },
                  items: [
                    {
                      key: "profile",
                      icon: <IconUser size={16} />,
                      label: "Profil",
                    },
                    {
                      key: "mail-settings",
                      icon: <IconSettings size={16} />,
                      label: "Pengaturan Mail",
                    },
                    {
                      type: "divider",
                    },
                    {
                      key: "logout",
                      icon: <IconLogout size={16} />,
                      label: "Keluar",
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            </Space>
          );
        },
      }}
      route={{
        routes: getAllRoutes(),
      }}
      menuItemRender={(item, dom) => (
        <a onClick={() => handleMenuClick({ key: item.key })}>{dom}</a>
      )}
    >
      {children}

      {/* Label Management Modal */}
      <Modal
        title={
          <Space>
            <IconTag size={16} />
            Kelola Label
          </Space>
        }
        open={labelModal}
        onCancel={handleLabelModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "create",
              label: (
                <Space>
                  <IconPlus size={16} />
                  Buat Label
                </Space>
              ),
              children: (
                <Form
                  form={createLabelForm}
                  layout="vertical"
                  onFinish={handleCreateLabel}
                  initialValues={{
                    color: "#FF4500",
                  }}
                >
                  <Form.Item
                    name="name"
                    label="Nama Label"
                    rules={[
                      {
                        required: true,
                        message: "Nama label harus diisi",
                      },
                      {
                        min: 2,
                        message: "Nama label minimal 2 karakter",
                      },
                      {
                        max: 50,
                        message: "Nama label maksimal 50 karakter",
                      },
                      {
                        pattern: /^[a-zA-Z0-9\s\-_]+$/,
                        message:
                          "Nama label hanya boleh mengandung huruf, angka, spasi, dan tanda hubung",
                      },
                    ]}
                  >
                    <Input placeholder="Masukkan nama label..." size="large" />
                  </Form.Item>

                  <Form.Item
                    name="color"
                    label="Warna Label"
                    help="Pilih warna yang mudah dibedakan untuk mengkategorikan email"
                    getValueFromEvent={(color) => {
                      return color?.toHexString ? color.toHexString() : color;
                    }}
                  >
                    <ColorPicker
                      showText
                      format="hex"
                      size="large"
                      presets={[
                        {
                          label: "Rekomendasi",
                          colors: [
                            "#ff4d4f",
                            "#fa8c16",
                            "#faad14",
                            "#52c41a",
                            "#1890ff",
                            "#722ed1",
                            "#eb2f96",
                            "#13c2c2",
                            "#f5222d",
                            "#fa541c",
                            "#a0d911",
                            "#2f54eb",
                          ],
                        },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item dependencies={["name", "color"]} noStyle>
                    {({ getFieldValue }) => (
                      <div style={{ marginBottom: "16px" }}>
                        <Text
                          strong
                          style={{
                            marginBottom: "8px",
                            display: "block",
                          }}
                        >
                          Preview:
                        </Text>
                        <div
                          style={{
                            padding: "12px 16px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                            border: "1px solid #e8e8e8",
                          }}
                        >
                          <Space>
                            <IconTag
                              size={14}
                              style={{
                                color: getFieldValue("color") || "#FF4500",
                              }}
                            />
                            <Text>{getFieldValue("name") || "Nama Label"}</Text>
                          </Space>
                        </div>
                      </div>
                    )}
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                    <Space>
                      <Button onClick={() => createLabelForm.resetFields()}>
                        Reset
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={createLabelMutation.isLoading}
                        icon={<IconPlus size={16} />}
                      >
                        Buat Label
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "manage",
              label: (
                <Space>
                  <IconTag size={16} />
                  Kelola Label ({customLabels.length})
                </Space>
              ),
              children: (
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {customLabels.length > 0 ? (
                    <List
                      dataSource={customLabels}
                      renderItem={(label) => (
                        <List.Item
                          actions={[
                            <Button
                              key="edit"
                              type="text"
                              icon={<IconPencil size={16} />}
                              onClick={() => startEditLabel(label)}
                              title="Edit label"
                            />,
                            <Popconfirm
                              key="delete"
                              title="Hapus label ini?"
                              description="Label akan dihapus dari semua email"
                              onConfirm={() => handleDeleteLabel(label.id)}
                              okText="Ya, Hapus"
                              cancelText="Batal"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="text"
                                icon={<IconTrash size={16} />}
                                danger
                                title="Hapus label"
                                loading={deleteLabelMutation.isLoading}
                              />
                            </Popconfirm>,
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <IconTag
                                size={16}
                                style={{
                                  color: label.color,
                                }}
                              />
                            }
                            title={
                              <Space>
                                <Text strong>{label.name}</Text>
                                <Tag color={label.color}>{label.color}</Tag>
                              </Space>
                            }
                            description={
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                Dibuat{" "}
                                {new Date(label.created_at).toLocaleDateString(
                                  "id-ID"
                                )}
                              </Text>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Belum ada label custom"
                      style={{ margin: "40px 0" }}
                    >
                      <Button
                        type="primary"
                        icon={<IconPlus size={16} />}
                        onClick={() => setActiveTab("create")}
                      >
                        Buat Label Pertama
                      </Button>
                    </Empty>
                  )}
                </div>
              ),
            },
            ...(editingLabel
              ? [
                  {
                    key: "edit",
                    label: (
                      <Space>
                        <IconPencil size={16} />
                        Edit &quot;{editingLabel.name}&quot;
                      </Space>
                    ),
                    children: (
                      <Form
                        form={editLabelForm}
                        layout="vertical"
                        onFinish={handleEditLabel}
                      >
                        <Form.Item
                          name="name"
                          label="Nama Label"
                          rules={[
                            {
                              required: true,
                              message: "Nama label harus diisi",
                            },
                            {
                              min: 2,
                              message: "Nama label minimal 2 karakter",
                            },
                            {
                              max: 50,
                              message: "Nama label maksimal 50 karakter",
                            },
                            {
                              pattern: /^[a-zA-Z0-9\s\-_]+$/,
                              message:
                                "Nama label hanya boleh mengandung huruf, angka, spasi, dan tanda hubung",
                            },
                          ]}
                        >
                          <Input
                            placeholder="Masukkan nama label..."
                            size="large"
                          />
                        </Form.Item>

                        <Form.Item
                          name="color"
                          label="Warna Label"
                          getValueFromEvent={(color) => {
                            return color?.toHexString
                              ? color.toHexString()
                              : color;
                          }}
                        >
                          <ColorPicker
                            showText
                            format="hex"
                            size="large"
                            presets={[
                              {
                                label: "Rekomendasi",
                                colors: [
                                  "#ff4d4f",
                                  "#fa8c16",
                                  "#faad14",
                                  "#52c41a",
                                  "#1890ff",
                                  "#722ed1",
                                  "#eb2f96",
                                  "#13c2c2",
                                  "#f5222d",
                                  "#fa541c",
                                  "#a0d911",
                                  "#2f54eb",
                                ],
                              },
                            ]}
                          />
                        </Form.Item>

                        <Form.Item dependencies={["name", "color"]} noStyle>
                          {({ getFieldValue }) => (
                            <div style={{ marginBottom: "16px" }}>
                              <Text
                                strong
                                style={{
                                  marginBottom: "8px",
                                  display: "block",
                                }}
                              >
                                Preview:
                              </Text>
                              <div
                                style={{
                                  padding: "12px 16px",
                                  backgroundColor: "#f8f9fa",
                                  borderRadius: "6px",
                                  border: "1px solid #e8e8e8",
                                }}
                              >
                                <Space>
                                  <IconTag
                                    size={14}
                                    style={{
                                      color:
                                        getFieldValue("color") ||
                                        editingLabel.color,
                                    }}
                                  />
                                  <Text>
                                    {getFieldValue("name") || editingLabel.name}
                                  </Text>
                                </Space>
                              </div>
                            </div>
                          )}
                        </Form.Item>

                        <Form.Item
                          style={{ marginBottom: 0, textAlign: "right" }}
                        >
                          <Space>
                            <Button
                              onClick={() => {
                                setEditingLabel(null);
                                setActiveTab("manage");
                              }}
                            >
                              Batal
                            </Button>
                            <Button
                              type="primary"
                              htmlType="submit"
                              loading={updateLabelMutation.isLoading}
                              icon={<IconPencil size={16} />}
                            >
                              Perbarui Label
                            </Button>
                          </Space>
                        </Form.Item>
                      </Form>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Modal>
    </ProLayout>
  );
}

export default GmailLayout;
