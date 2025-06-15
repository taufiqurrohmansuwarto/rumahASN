import {
  createCommentCustomer,
  detailPublishTickets,
  hapusCommentCustomer,
  markAnswerTicket,
  unmarkAnswerTicket,
  updateCommentCustomer,
} from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
import { formatDate } from "@/utils/index";
import { Comment } from "@ant-design/compatible";
import {
  EllipsisOutlined,
  FireOutlined,
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Affix,
  Avatar,
  FloatButton,
  Col,
  Divider,
  Dropdown,
  Menu,
  Row,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
  Card,
  Flex,
  Grid,
  Button,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useMemo } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import RestrictedContent from "../RestrictedContent";
import SimpleEmojiPicker from "../SimpleEmojiPicker";
import ChangeTicketDescription from "../TicketProps/ChangeDescription";
import ChangeTicketTitle from "../TicketProps/ChangeTicketTitle";
import ReactionsEmoji from "../TicketProps/ReactionsEmoji";
import TicketsRecommendations from "../TicketProps/TicketsRecommendations";
import TimelineTicket from "../TicketProps/TimelineTicket";
import NewTicket from "./NewTicket";
import SideRight from "./SideRight";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const ActionWrapper = ({ attributes, name, ...props }) => {
  return (
    <RestrictedContent attributes={attributes} name={name} {...props}>
      <Menu.Item {...props}>{props.children}</Menu.Item>
    </RestrictedContent>
  );
};

const CommentTicket = ({ item, agent, customer, admin }) => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const [comment, setComment] = useState(null);
  const [id, setId] = useState(null);

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      avatarSize: isMobile ? 32 : 40,
      padding: isMobile ? 12 : 16,
    };
  }, [screens.md]);

  const handleAccEdit = () => {
    setId(item?.id);
    setComment(item?.commentMarkdown);
  };

  const handleCancelEdit = () => {
    setId(null);
  };

  const router = useRouter();

  const { mutate: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => hapusCommentCustomer(data),
    {
      onSuccess: () => {
        const id = router.query?.id;
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("✅ Berhasil menghapus komentar");
      },
      onError: () => message.error("❌ Gagal menghapus komentar"),
    }
  );

  const { mutate: editData, isLoading: isLoadingEdit } = useMutation(
    (data) => updateCommentCustomer(data),
    {
      onSuccess: () => {
        const id = router.query?.id;
        queryClient.invalidateQueries(["publish-ticket", id]);
        setId(null);
        setComment(null);
        message.success("✅ Berhasil mengubah komentar");
      },
      onError: () => message.error("❌ Gagal mengubah komentar"),
    }
  );

  const { mutate: markAnswer, isLoading: isLoadingMarkAnswer } = useMutation(
    (data) => markAnswerTicket(data),
    {
      onSuccess: () => {
        const id = router.query?.id;
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("✅ Berhasil menandai jawaban");
      },
      onError: () => message.error("❌ Gagal menandai jawaban"),
    }
  );

  const { mutate: unmarkAnswer, isLoading: isLoadingUnmarkAnswer } =
    useMutation((data) => unmarkAnswerTicket(data), {
      onSuccess: () => {
        const id = router.query?.id;
        queryClient.invalidateQueries(["publish-ticket", id]);
        message.success("✅ Berhasil membatalkan tanda jawaban");
      },
      onError: () => message.error("❌ Gagal membatalkan tanda jawaban"),
    });

  const handleMarkAnswer = () => {
    const data = {
      id: router.query?.id,
      commentId: item?.id,
    };
    markAnswer(data);
  };

  const handleUnmarkAnswer = () => {
    const data = {
      id: router.query?.id,
      commentId: item?.id,
    };
    unmarkAnswer(data);
  };

  const handleHapus = () => {
    const data = {
      ticketId: router.query?.id,
      commentId: item?.id,
    };

    hapus(data);
  };

  const handleUpdate = async () => {
    const data = {
      ticketId: router.query?.id,
      commentId: item?.id,
      data: {
        comment,
      },
    };

    editData(data);
  };

  return (
    <>
      {item?.id === id && item?.id !== null ? (
        <Card
          size="small"
          style={{
            marginTop: 16,
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <NewTicket
            handleCancel={handleCancelEdit}
            setValue={setComment}
            loadingSubmit={isLoadingEdit}
            value={comment}
            submitMessage={handleUpdate}
            withCancel={true}
          />
        </Card>
      ) : (
        <>
          {item?.type === "comment" && item?.id !== null && (
            <Card
              size="small"
              style={{
                marginTop: 16,
                marginBottom: 16,
                borderRadius: 8,
                border: item?.is_answer
                  ? "2px solid #52c41a"
                  : "1px solid #f0f0f0",
                background: item?.is_answer ? "#f6ffed" : "white",
                boxShadow: item?.is_answer
                  ? "0 4px 12px rgba(82, 196, 26, 0.15)"
                  : "0 2px 8px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!item?.is_answer) {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0,0,0,0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!item?.is_answer) {
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(0,0,0,0.06)";
                }
              }}
            >
              <Flex justify="space-between" align="flex-start" gap={12}>
                <Flex flex={1} vertical gap={8}>
                  {item?.is_answer && (
                    <Flex align="center" gap={8} style={{ marginBottom: 8 }}>
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", fontSize: 16 }}
                      />
                      <Text strong style={{ color: "#52c41a", fontSize: 13 }}>
                        ✅ Jawaban Terpilih
                      </Text>
                    </Flex>
                  )}

                  <Comment
                    actions={[
                      <SimpleEmojiPicker
                        ticketId={router?.query?.id}
                        comment={item}
                        key="emoji"
                      />,
                      <ReactionsEmoji
                        key="reaction-emoji"
                        reactions={item?.reactions}
                      />,
                    ]}
                    author={
                      <Link href={`/users/${item?.user?.custom_id}`}>
                        <Flex align="center" gap={8}>
                          <Typography.Link style={{ fontWeight: 600 }}>
                            {item?.user?.username}
                          </Typography.Link>
                          {(item?.user?.current_role === "agent" ||
                            item?.user?.current_role === "admin") && (
                            <Tag
                              icon={<FireOutlined />}
                              color="orange"
                              style={{
                                borderRadius: 4,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            >
                              🔥 Staff BKD
                            </Tag>
                          )}
                        </Flex>
                      </Link>
                    }
                    datetime={
                      <Tooltip title={formatDate(item?.created_at)}>
                        <Flex align="center" gap={4}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {item?.is_edited
                              ? formatDateFromNow(item?.updated_at)
                              : formatDateFromNow(item?.created_at)}
                          </Text>
                          {item?.is_edited && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              • ✏️ diedit
                            </Text>
                          )}
                        </Flex>
                      </Tooltip>
                    }
                    avatar={
                      <Link href={`/users/${item?.user?.custom_id}`}>
                        <Avatar
                          src={item?.user?.image}
                          size={responsiveConfig.avatarSize}
                          style={{
                            border: "2px solid #f0f0f0",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#1890ff";
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#f0f0f0";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        />
                      </Link>
                    }
                    content={
                      <div
                        style={{
                          padding: "8px 0",
                          lineHeight: 1.6,
                        }}
                      >
                        <ReactMarkdownCustom>
                          {item?.commentMarkdown}
                        </ReactMarkdownCustom>
                      </div>
                    }
                  />
                </Flex>

                <Dropdown
                  trigger={["click"]}
                  placement="bottomRight"
                  overlay={
                    <Menu
                      style={{
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      <ActionWrapper
                        key="mark-answer"
                        name="mark-answer"
                        attributes={{ agent }}
                      >
                        <Flex
                          align="center"
                          gap={8}
                          onClick={
                            item?.is_answer
                              ? handleUnmarkAnswer
                              : handleMarkAnswer
                          }
                        >
                          <CheckCircleOutlined style={{ color: "#52c41a" }} />
                          <span>
                            {item?.is_answer
                              ? "❌ Hapus Tanda Jawaban"
                              : "✅ Tandai Sebagai Jawaban"}
                          </span>
                        </Flex>
                      </ActionWrapper>
                      <ActionWrapper
                        key="edit-comment"
                        name="edit-comment"
                        attributes={{ comment: item }}
                      >
                        <Flex align="center" gap={8} onClick={handleAccEdit}>
                          <EditOutlined style={{ color: "#1890ff" }} />
                          <span>✏️ Edit Komentar</span>
                        </Flex>
                      </ActionWrapper>
                      <ActionWrapper
                        key="remove-comment"
                        name="remove-comment"
                        attributes={{ comment: item }}
                      >
                        <Flex
                          align="center"
                          gap={8}
                          onClick={handleHapus}
                          style={{ color: "#ff4d4f" }}
                        >
                          <DeleteOutlined />
                          <span>🗑️ Hapus Komentar</span>
                        </Flex>
                      </ActionWrapper>
                    </Menu>
                  }
                >
                  <Button
                    type="text"
                    icon={<EllipsisOutlined />}
                    size="small"
                    style={{
                      color: "#8c8c8c",
                      border: "1px solid #f0f0f0",
                      borderRadius: 6,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#1890ff";
                      e.currentTarget.style.borderColor = "#1890ff";
                      e.currentTarget.style.background = "#f0f9ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#8c8c8c";
                      e.currentTarget.style.borderColor = "#f0f0f0";
                      e.currentTarget.style.background = "transparent";
                    }}
                  />
                </Dropdown>
              </Flex>
            </Card>
          )}
          <TimelineTicket timelineItems={item?.timelineItems} />
        </>
      )}
    </>
  );
};

const DetailTicketPublish = ({ id }) => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;

    return {
      isMobile,
      gutter: isMobile ? [16, 16] : [32, 32],
      sidebarSpan: isMobile ? 24 : 6,
      contentSpan: isMobile ? 24 : 18,
    };
  }, [screens.md]);

  const { data, isLoading } = useQuery(
    ["publish-ticket", id],
    () => detailPublishTickets(id),
    {}
  );

  const { mutate: createComment, isLoading: isLoadingCreate } = useMutation(
    (data) => createCommentCustomer(data),
    {
      onSettled: () => queryClient.invalidateQueries(["publish-ticket", id]),
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", id]);
        setValue("");
        message.success("✅ Komentar berhasil ditambahkan");
      },
      onError: () => message.error("❌ Gagal menambahkan komentar"),
    }
  );

  const handleSubmit = () => {
    const data = {
      id,
      data: {
        comment: value,
      },
    };
    createComment(data);
  };

  const [value, setValue] = useState(null);

  return (
    <div
      style={{
        padding: responsiveConfig.isMobile ? "16px" : "24px",
        background: "#fafafa",
        minHeight: "100vh",
      }}
    >
      <Skeleton loading={isLoading}>
        <Head>
          <title>{data?.title}</title>
        </Head>
        {data && (
          <>
            <FloatButton.BackTop />
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <Row gutter={[8, 16]}>
                <Col span={24}>
                  <Affix offsetTop={40}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        background: "white",
                      }}
                    >
                      <ChangeTicketTitle
                        name="edit-ticket-title"
                        attributes={{ ticket: data }}
                        ticket={data}
                      />
                    </Card>
                  </Affix>
                </Col>
              </Row>

              <Row gutter={responsiveConfig.gutter} style={{ marginTop: 24 }}>
                <Col
                  md={responsiveConfig.contentSpan}
                  xs={24}
                  order={responsiveConfig.isMobile ? 2 : 1}
                >
                  <Flex vertical gap={16}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <ChangeTicketDescription item={data} />
                    </Card>

                    {data?.data?.map((item, index) => {
                      return (
                        <CommentTicket
                          key={item?.id || item?.custom_id}
                          customer={data?.customer}
                          agent={data?.agent}
                          admin={data?.admin}
                          item={item}
                        />
                      );
                    })}

                    <RestrictedContent
                      name="create-comment"
                      attributes={{ ticket: data }}
                    >
                      <Card
                        size="small"
                        title="💬 Tambah Komentar"
                        style={{
                          borderRadius: 8,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                          marginTop: 16,
                        }}
                      >
                        <NewTicket
                          submitMessage={handleSubmit}
                          currentStatus={data?.status_code}
                          value={value}
                          setValue={setValue}
                          loadingSubmit={isLoadingCreate}
                        />
                      </Card>
                    </RestrictedContent>

                    <TicketsRecommendations />
                  </Flex>
                </Col>

                <Col
                  md={responsiveConfig.sidebarSpan}
                  xs={24}
                  order={responsiveConfig.isMobile ? 1 : 2}
                >
                  <div
                    style={{
                      position: responsiveConfig.isMobile ? "static" : "sticky",
                      top: responsiveConfig.isMobile ? "auto" : 100,
                    }}
                  >
                    <SideRight item={data} />
                  </div>
                </Col>
              </Row>
            </div>
          </>
        )}
      </Skeleton>
    </div>
  );
};

export default DetailTicketPublish;
