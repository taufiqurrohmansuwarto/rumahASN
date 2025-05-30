import {
  useCreateLabel,
  useDeleteLabel,
  useEmailStats,
  useUpdateLabel,
  useUserLabels,
} from "@/hooks/useEmails";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  FolderOutlined,
  InboxOutlined,
  LogoutOutlined,
  MailOutlined,
  PlusOutlined,
  SearchOutlined,
  SendOutlined,
  SettingOutlined,
  StarOutlined,
  TagOutlined,
  UpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { ProLayout } from "@ant-design/pro-components";
import {
  Badge,
  Button,
  ColorPicker,
  ConfigProvider,
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
import frFR from "antd/lib/locale/id_ID";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { gmailToken } from "src/styles/gmail.styles";
import MegaMenuTop from "./MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "./Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "./Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "./Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "./Notification/NotifikasiPrivateMessage";

const { Search } = Input;
const { Text } = Typography;

function GmailLayout({
  children,
  active = "inbox",
  onCompose,
  onSearch,
  showSearchBar = true,
}) {
  const { data } = useSession();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
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

  // Handle search
  const handleSearch = (value) => {
    if (onSearch) {
      onSearch(value);
    } else {
      if (value.trim()) {
        router.push(`/mails/search?q=${encodeURIComponent(value)}`);
      }
    }
  };

  // Handle create label
  const handleCreateLabel = async (values) => {
    try {
      await createLabelMutation.mutateAsync(values);
      createLabelForm.resetFields();
      setActiveTab("manage"); // Switch to manage tab after creation
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
    // Main items (selalu visible)
    const mainRoutes = [
      {
        key: "/mails/inbox",
        path: "/mails/inbox",
        name:
          emailStats?.data?.unreadCount > 0 ? (
            <Space>
              Inbox
              <Badge
                count={emailStats.data.unreadCount}
                size="small"
                style={{ backgroundColor: "#1a73e8" }}
              />
            </Space>
          ) : (
            "Kotak Masuk"
          ),
        icon: <InboxOutlined />,
      },
      {
        key: "/mails/starred",
        path: "/mails/starred",
        name: "Ditandai",
        icon: <StarOutlined />,
      },
      {
        key: "/mails/sent",
        path: "/mails/sent",
        name: "Terkirim",
        icon: <SendOutlined />,
      },
      {
        key: "/mails/drafts",
        path: "/mails/drafts",
        name:
          emailStats?.data?.draftCount > 0 ? (
            <Space>
              Drafts
              <Badge
                count={emailStats.data.draftCount}
                size="small"
                style={{ backgroundColor: "#1890ff" }}
              />
            </Space>
          ) : (
            "Draf"
          ),
        icon: <FileOutlined />,
      },
      {
        key: "/mails/trash",
        path: "/mails/trash",
        name: "Sampah",
        icon: <DeleteOutlined />,
      },
      {
        key: "/mails/archive",
        path: "/mails/archive",
        name: "Arsip",
        icon: <FolderOutlined />,
      },
      {
        key: "/mails/spam",
        path: "/mails/spam",
        name: "Spam",
        icon: <ExclamationCircleOutlined />,
      },
    ];

    // More section items (conditional)
    const moreRoutes = [
      {
        key: "more-divider",
        name: "More",
        icon: showMoreItems ? <UpOutlined /> : <DownOutlined />,
        path: "#",
      },
      ...(showMoreItems
        ? [
            {
              key: "/mails/important",
              path: "/mails/important",
              name: "Important",
              icon: <TagOutlined style={{ color: "#ff4d4f" }} />,
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
              icon: <TagOutlined style={{ color: label.color }} />,
            })),
            {
              key: "create-label",
              path: "#",
              name: "Create Label",
              icon: <PlusOutlined />,
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

    // Find route and navigate
    const route = getAllRoutes().find((r) => r.key === key);
    if (route?.path && route.path !== "#") {
      router.push(route.path);
    }
  };

  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      <ConfigProvider locale={frFR}>
        <ProLayout
          token={gmailToken}
          title="Mail ASN"
          logo={<MailOutlined style={{ color: "#1a73e8" }} />}
          // Layout configuration
          layout="mix"
          navTheme="light"
          colorPrimary="#1a73e8"
          fixedHeader
          fixSiderbar
          // Collapse configuration
          collapsed={collapsed}
          onCollapse={setCollapsed}
          // Menu configuration dengan flat structure
          route={{
            routes: getAllRoutes(),
          }}
          selectedKeys={[active]}
          onMenuHeaderClick={(e) => console.log("Menu header clicked", e)}
          menuItemRender={(item, dom) => (
            <div onClick={() => handleMenuClick({ key: item.key })}>{dom}</div>
          )}
          // Header content dengan search
          headerContentRender={() => {
            if (showSearchBar) {
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Search
                    placeholder="Cari email..."
                    allowClear
                    onSearch={handleSearch}
                    style={{
                      maxWidth: 400,
                      marginLeft: 24,
                      marginRight: "auto",
                    }}
                    enterButton={<SearchOutlined />}
                  />
                </div>
              );
            }
            return null;
          }}
          // Menu extra render untuk compose button
          menuExtraRender={({ collapsed, isMobile }) => {
            if (collapsed) {
              return (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Button
                    onClick={handleCompose}
                    shape="circle"
                    size="large"
                    icon={<EditOutlined />}
                    type="primary"
                  />
                </div>
              );
            } else {
              return (
                <div style={{ padding: "0 16px", marginBottom: 16 }}>
                  <Button
                    onClick={handleCompose}
                    shape="round"
                    icon={<EditOutlined />}
                    block
                    type="primary"
                    size="large"
                    style={{ fontWeight: "500" }}
                  >
                    Tulis Email
                  </Button>
                </div>
              );
            }
          }}
          // Actions render
          actionsRender={() => [
            <NotifikasiKepegawaian
              key="kepegawaian"
              url="kepegawaian"
              title="Inbox Kepegawaian"
            />,
            <NotifikasiPrivateMessage
              key="private-message"
              url="/mails"
              title="Inbox Pesan Pribadi"
            />,
            <NotifikasiASNConnect
              key="asn-connect"
              url="asn-connect"
              title="Inbox ASN Connect"
            />,
            <NotifikasiForumKepegawaian
              key="forum-kepegawaian"
              url="forum-kepegawaian"
              title="Inbox Forum Kepegawaian"
            />,
            <Button
              key="mail-settings"
              type="text"
              icon={<SettingOutlined />}
              onClick={() => router.push("/mails/settings")}
              title="Pengaturan Mail"
            />,
            <MegaMenuTop key="mega-menu" url="" title="Menu" />,
          ]}
          // Avatar props
          avatarProps={{
            src: data?.user?.image,
            size: "large",
            render: (props, dom) => (
              <Dropdown
                menu={{
                  onClick: (e) => {
                    if (e.key === "logout") signOut();
                    if (e.key === "profile") router.push("/settings/profile");
                    if (e.key === "mail-settings")
                      router.push("/mails/settings");
                  },
                  items: [
                    {
                      key: "profile",
                      icon: <UserOutlined />,
                      label: "Profil",
                    },
                    {
                      key: "mail-settings",
                      icon: <SettingOutlined />,
                      label: "Pengaturan Mail",
                    },
                    {
                      type: "divider",
                    },
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "Keluar",
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            ),
          }}
          // Token untuk styling
        >
          {children}

          {/* Label Management Modal */}
          <Modal
            title={
              <Space>
                <TagOutlined style={{ color: "#1a73e8" }} />
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
                      <PlusOutlined />
                      Buat Label
                    </Space>
                  ),
                  children: (
                    <Form
                      form={createLabelForm}
                      layout="vertical"
                      onFinish={handleCreateLabel}
                      initialValues={{
                        color: "#1a73e8",
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
                        <Input
                          placeholder="Masukkan nama label..."
                          size="large"
                          style={{ borderRadius: "6px" }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="color"
                        label="Warna Label"
                        help="Pilih warna yang mudah dibedakan untuk mengkategorikan email"
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
                          style={{ width: "100%" }}
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
                                <TagOutlined
                                  style={{
                                    color: getFieldValue("color") || "#1a73e8",
                                    fontSize: "14px",
                                  }}
                                />
                                <Text>
                                  {getFieldValue("name") || "Nama Label"}
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
                            onClick={() => createLabelForm.resetFields()}
                            style={{ borderRadius: "6px" }}
                          >
                            Reset
                          </Button>
                          <Button
                            type="primary"
                            htmlType="submit"
                            loading={createLabelMutation.isLoading}
                            icon={<PlusOutlined />}
                            style={{ borderRadius: "6px" }}
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
                      <TagOutlined />
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
                                  icon={<EditOutlined />}
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
                                    icon={<DeleteOutlined />}
                                    danger
                                    title="Hapus label"
                                    loading={deleteLabelMutation.isLoading}
                                  />
                                </Popconfirm>,
                              ]}
                            >
                              <List.Item.Meta
                                avatar={
                                  <TagOutlined
                                    style={{
                                      color: label.color,
                                      fontSize: "16px",
                                    }}
                                  />
                                }
                                title={
                                  <Space>
                                    <Text strong>{label.name}</Text>
                                    <Tag
                                      color={label.color}
                                      style={{
                                        fontSize: "12px",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      {label.color}
                                    </Tag>
                                  </Space>
                                }
                                description={
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                  >
                                    Dibuat{" "}
                                    {new Date(
                                      label.created_at
                                    ).toLocaleDateString("id-ID")}
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
                            icon={<PlusOutlined />}
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
                            <EditOutlined />
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
                                style={{ borderRadius: "6px" }}
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
                                style={{ width: "100%" }}
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
                                      <TagOutlined
                                        style={{
                                          color:
                                            getFieldValue("color") ||
                                            editingLabel.color,
                                          fontSize: "14px",
                                        }}
                                      />
                                      <Text>
                                        {getFieldValue("name") ||
                                          editingLabel.name}
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
                                  style={{ borderRadius: "6px" }}
                                >
                                  Batal
                                </Button>
                                <Button
                                  type="primary"
                                  htmlType="submit"
                                  loading={updateLabelMutation.isLoading}
                                  icon={<EditOutlined />}
                                  style={{ borderRadius: "6px" }}
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
      </ConfigProvider>
    </div>
  );
}

export default GmailLayout;
