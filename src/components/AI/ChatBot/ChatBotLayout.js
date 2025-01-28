import ActionSettings from "@/components/ActionSettings";
import { BestieAIToken } from "@/components/GuestBook/GuestBookToken";
import { AssistantAIServices } from "@/services/assistant-ai.services";
import {
  CommentOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  FrownOutlined,
  LogoutOutlined,
  MehOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { Center, Group } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Dropdown,
  Form,
  Grid,
  Input,
  message,
  Modal,
  Rate,
  Space,
  Typography,
} from "antd";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const ellipsisText = (text) => {
  if (text.length > 15) {
    return text.slice(0, 15) + "...";
  }
  return text;
};

const ProLayout = dynamic(
  () => import("@ant-design/pro-components").then((mod) => mod?.ProLayout),
  {
    ssr: false,
  }
);

const MenuItem = ({ options, element }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isHovered, setIsHovered] = useState(false);

  const {
    mutateAsync: removeThreadMessages,
    isLoading: loadingRemoveThreadMessages,
  } = useMutation((data) => AssistantAIServices.deleteThreadMessages(data), {
    onSuccess: () => {
      router.push(`/chat-ai`);
      message.success("Berhasil menghapus riwayat chat");
      queryClient.invalidateQueries(["threads"]);
    },
  });

  const handleRemove = (id) => {
    Modal.confirm({
      cancelText: "Batal",
      okText: "Hapus",
      centered: true,
      title: "Hapus Percakapan",
      content: "Apakah anda yakin ingin menghapus percakapan ini?",
      onOk: async () => {
        await removeThreadMessages({ threadId: id });
      },
    });
  };

  return (
    <Group
      position="apart"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={options.path}>{element}</Link>
      {isHovered && (
        <Dropdown
          menu={{
            onClick: (e) => {
              if (e.key === "edit") {
                alert("edit");
              } else if (e.key === "delete") {
                handleRemove(options?.id);
              }
            },
            items: [
              {
                key: "edit",
                label: "Ubah Nama",
                icon: <EditOutlined />,
              },
              {
                danger: true,
                key: "delete",
                label: "Hapus",
                icon: <DeleteOutlined />,
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>
      )}
    </Group>
  );
};

const menuItemRender = (options, element) => {
  return <MenuItem options={options} element={element} />;
};

const ModalFeedback = ({ open, onClose }) => {
  const customIcons = {
    1: <FrownOutlined />,
    2: <FrownOutlined />,
    3: <MehOutlined />,
    4: <SmileOutlined />,
    5: <SmileOutlined />,
  };
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title="Rating Pengalaman kamu"
      centered
    >
      <Form form={form} layout="vertical">
        <Form.Item name="rating">
          <Rate character={({ index }) => customIcons[index + 1]} />
        </Form.Item>

        <Form.Item name="feedback">
          <Input.TextArea placeholder="Berikan feedback anda" rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const FooterRender = (props) => {
  const [openModalFeedback, setOpenModalFeedback] = useState(false);

  const handleOpenModalFeedback = () => {
    setOpenModalFeedback(true);
  };

  const handleCloseModalFeedback = () => {
    setOpenModalFeedback(false);
  };

  const breakPoint = Grid.useBreakpoint();
  if (props?.collapsed) return undefined;
  return (
    <div
      style={{
        textAlign: "center",
        paddingBlockStart: 12,
      }}
    >
      <ModalFeedback
        open={openModalFeedback}
        onClose={handleCloseModalFeedback}
      />
      <Space direction="vertical">
        <Button
          icon={<CommentOutlined />}
          type="primary"
          onClick={handleOpenModalFeedback}
        >
          Beri Feedback
        </Button>
        <Typography.Text
          style={{
            fontSize: breakPoint.xs ? 12 : 14,
          }}
          type="secondary"
        >
          © 2022 Rumah ASN
        </Typography.Text>
        <div>
          <Typography.Text
            style={{
              fontSize: breakPoint.xs ? 12 : 14,
            }}
            type="secondary"
          >
            BKD Provinsi Jawa Timur
          </Typography.Text>
        </div>
      </Space>
    </div>
  );
};

function ChatBotLayout({ children, active }) {
  const [collapsed, setCollapsed] = useState(true);
  const { data, status } = useSession();
  const router = useRouter();
  const threadId = router?.query?.threadId;
  const breakPoint = Grid.useBreakpoint();

  // Get threads for selected assistant
  const { data: threads, isFetching: loadingThreads } = useQuery(
    ["threads"],
    () => AssistantAIServices.getAssistantThreads(),
    {
      staleTime: 1000 * 60, // 1 minute
    }
  );

  const gotoNewChat = () => {
    router.push(`/chat-ai`);
  };

  return (
    <ProLayout
      loading={status === "loading" || loadingThreads}
      siderWidth={300}
      title=""
      route={{
        routes: threads?.map((thread) => ({
          id: thread.id,
          path: `/chat-ai/${thread.id}`,
          name: ellipsisText(thread?.title),
        })),
      }}
      logo={
        breakPoint?.xs
          ? null
          : "https://siasn.bkd.jatimprov.go.id:9000/public/bestie-ai-title.png"
      }
      defaultCollapsed={collapsed}
      layout="mix"
      navTheme="light"
      fixedHeader
      fixSiderbar
      collapsed={collapsed}
      onCollapse={setCollapsed}
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
                onClick={gotoNewChat}
                size="middle"
                block
                shape="round"
                type="primary"
                icon={<EditOutlined />}
              >
                Percakapan Baru
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
                  onClick={gotoNewChat}
                  shape="round"
                  icon={<EditOutlined />}
                  block
                  type="primary"
                >
                  Percakapan Baru
                </Button>
              </Center>
            );
          }
        } else {
          return (
            <Center>
              <Button
                onClick={gotoNewChat}
                shape="circle"
                size="middle"
                icon={<EditOutlined />}
                type="primary"
              />
            </Center>
          );
        }
      }}
      activeKey={`/chat-ai/${threadId}`}
      selectedKeys={[`/chat-ai/${threadId}`]}
      avatarProps={{
        src: data?.user?.image,
        size: "large",
        render: (props, dom) => {
          return (
            <Dropdown
              menu={{
                onClick: (e) => {
                  if (e.key === "logout") {
                    signOut();
                  }
                },
                items: [
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
          );
        },
      }}
      token={BestieAIToken}
      actionsRender={ActionSettings}
      menuItemRender={menuItemRender}
      menuFooterRender={FooterRender}
    >
      <>{children}</>
    </ProLayout>
  );
}

export default ChatBotLayout;
