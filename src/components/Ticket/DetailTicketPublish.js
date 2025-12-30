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
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Affix,
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Flex,
  FloatButton,
  Grid,
  Row,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { memo, useCallback, useMemo, useState } from "react";
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

// Static styles - defined outside component to prevent recreation
const CARD_STYLE = { borderRadius: 8 };
const CARD_ANSWER_STYLE = {
  borderRadius: 8,
  border: "2px solid #52c41a",
  background: "#f6ffed",
  transition: "all 0.2s ease",
};
const CARD_NORMAL_STYLE = {
  borderRadius: 8,
  border: "1px solid #f0f0f0",
  background: "white",
  transition: "all 0.2s ease",
};
const ANSWER_ICON_STYLE = { color: "#52c41a", fontSize: 16 };
const ANSWER_TEXT_STYLE = { color: "#52c41a", fontSize: 13 };
const STAFF_TAG_STYLE = { borderRadius: 4, fontSize: 11, fontWeight: 600 };
const DATETIME_TEXT_STYLE = { fontSize: 12 };
const AVATAR_STYLE = { border: "2px solid #f0f0f0", transition: "all 0.2s ease" };
const CONTENT_STYLE = { padding: "8px 0", lineHeight: 1.6 };
const MENU_STYLE = { borderRadius: 8 };
const DROPDOWN_BUTTON_STYLE = {
  color: "#8c8c8c",
  border: "1px solid #f0f0f0",
  borderRadius: 6,
  transition: "all 0.2s ease",
};
const DELETE_STYLE = { color: "#ff4d4f" };


// Isolated input component to prevent re-renders of parent
const NewTicketWrapper = memo(({ id, currentStatus, onSuccess }) => {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(null);

  const { mutate: createComment, isLoading: isLoadingCreate } = useMutation(
    (data) => createCommentCustomer(data),
    {
      onSettled: () => queryClient.invalidateQueries(["publish-ticket", id]),
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", id]);
        setValue("");
        message.success("✅ Komentar berhasil ditambahkan");
        onSuccess?.();
      },
      onError: () => message.error("❌ Gagal menambahkan komentar"),
    }
  );

  const handleSubmit = useCallback(() => {
    const data = {
      id,
      data: {
        comment: value,
      },
    };
    createComment(data);
  }, [id, value, createComment]);

  return (
    <NewTicket
      submitMessage={handleSubmit}
      currentStatus={currentStatus}
      value={value}
      setValue={setValue}
      loadingSubmit={isLoadingCreate}
    />
  );
});

NewTicketWrapper.displayName = "NewTicketWrapper";

const CommentTicket = memo(({ item, agent, customer, admin }) => {
  const queryClient = useQueryClient();
  const screens = useBreakpoint();
  const [comment, setComment] = useState(null);
  const [editId, setEditId] = useState(null);
  const router = useRouter();
  const ticketId = router.query?.id;

  // Memoize responsive config
  const responsiveConfig = useMemo(() => {
    const isMobile = !screens.md;
    return {
      isMobile,
      avatarSize: isMobile ? 32 : 40,
      padding: isMobile ? 12 : 16,
    };
  }, [screens.md]);

  // Memoize card style based on is_answer
  const cardStyle = useMemo(() => {
    return item?.is_answer ? CARD_ANSWER_STYLE : CARD_NORMAL_STYLE;
  }, [item?.is_answer]);

  const handleAccEdit = useCallback(() => {
    setEditId(item?.id);
    setComment(item?.commentMarkdown);
  }, [item?.id, item?.commentMarkdown]);

  const handleCancelEdit = useCallback(() => {
    setEditId(null);
    setComment(null);
  }, []);

  const { mutate: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => hapusCommentCustomer(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
        message.success("✅ Berhasil menghapus komentar");
      },
      onError: () => message.error("❌ Gagal menghapus komentar"),
    }
  );

  const { mutate: editData, isLoading: isLoadingEdit } = useMutation(
    (data) => updateCommentCustomer(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
        setEditId(null);
        setComment(null);
        message.success("✅ Berhasil mengubah komentar");
      },
      onError: () => message.error("❌ Gagal mengubah komentar"),
    }
  );

  const { mutate: markAnswer } = useMutation(
    (data) => markAnswerTicket(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
        message.success("✅ Berhasil menandai jawaban");
      },
      onError: () => message.error("❌ Gagal menandai jawaban"),
    }
  );

  const { mutate: unmarkAnswer } = useMutation(
    (data) => unmarkAnswerTicket(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", ticketId]);
        message.success("✅ Berhasil membatalkan tanda jawaban");
      },
      onError: () => message.error("❌ Gagal membatalkan tanda jawaban"),
    }
  );

  const handleMarkAnswer = useCallback(() => {
    markAnswer({ id: ticketId, commentId: item?.id });
  }, [ticketId, item?.id, markAnswer]);

  const handleUnmarkAnswer = useCallback(() => {
    unmarkAnswer({ id: ticketId, commentId: item?.id });
  }, [ticketId, item?.id, unmarkAnswer]);

  const handleHapus = useCallback(() => {
    hapus({ ticketId, commentId: item?.id });
  }, [ticketId, item?.id, hapus]);

  const handleUpdate = useCallback(() => {
    editData({
      ticketId,
      commentId: item?.id,
      data: { comment },
    });
  }, [ticketId, item?.id, comment, editData]);

  // Create dropdown menu items using Ant Design v5 API
  const dropdownMenuItems = useMemo(
    () => ({
      items: [
        {
          key: "mark-answer",
          label: (
            <RestrictedContent name="mark-answer" attributes={{ agent }}>
              <Flex align="center" gap={8}>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span>
                  {item?.is_answer
                    ? "Hapus Tanda Jawaban"
                    : "Tandai Sebagai Jawaban"}
                </span>
              </Flex>
            </RestrictedContent>
          ),
          onClick: item?.is_answer ? handleUnmarkAnswer : handleMarkAnswer,
        },
        {
          key: "edit-comment",
          label: (
            <RestrictedContent name="edit-comment" attributes={{ comment: item }}>
              <Flex align="center" gap={8}>
                <EditOutlined style={{ color: "#1890ff" }} />
                <span>Edit Komentar</span>
              </Flex>
            </RestrictedContent>
          ),
          onClick: handleAccEdit,
        },
        {
          key: "remove-comment",
          danger: true,
          label: (
            <RestrictedContent name="remove-comment" attributes={{ comment: item }}>
              <Flex align="center" gap={8}>
                <DeleteOutlined />
                <span>Hapus Komentar</span>
              </Flex>
            </RestrictedContent>
          ),
          onClick: handleHapus,
        },
      ],
      style: MENU_STYLE,
    }),
    [agent, item, handleMarkAnswer, handleUnmarkAnswer, handleAccEdit, handleHapus]
  );

  // Memoize comment actions
  const commentActions = useMemo(
    () => [
      <SimpleEmojiPicker ticketId={ticketId} comment={item} key="emoji" />,
      <ReactionsEmoji key="reaction-emoji" reactions={item?.reactions} />,
    ],
    [ticketId, item]
  );


  const isEditing = item?.id === editId && item?.id !== null;

  if (isEditing) {
    return (
      <Card size="small" style={CARD_STYLE}>
        <NewTicket
          handleCancel={handleCancelEdit}
          setValue={setComment}
          loadingSubmit={isLoadingEdit}
          value={comment}
          submitMessage={handleUpdate}
          withCancel={true}
        />
      </Card>
    );
  }

  return (
    <>
      {item?.type === "comment" && item?.id !== null && (
        <Card size="small" style={cardStyle}>
          <Flex justify="space-between" align="flex-start" gap={8}>
            <Flex flex={1} vertical gap={8} style={{ overflow: "hidden" }}>
              {item?.is_answer && (
                <Flex align="center" gap={8}>
                  <CheckCircleOutlined style={ANSWER_ICON_STYLE} />
                  <Text strong style={ANSWER_TEXT_STYLE}>
                    ✅ Jawaban Terpilih
                  </Text>
                </Flex>
              )}

              <Comment
                actions={commentActions}
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
                          style={STAFF_TAG_STYLE}
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
                      <Text type="secondary" style={DATETIME_TEXT_STYLE}>
                        {item?.is_edited
                          ? formatDateFromNow(item?.updated_at)
                          : formatDateFromNow(item?.created_at)}
                      </Text>
                      {item?.is_edited && (
                        <Text type="secondary" style={DATETIME_TEXT_STYLE}>
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
                      style={AVATAR_STYLE}
                    />
                  </Link>
                }
                content={
                  <div style={CONTENT_STYLE}>
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
              menu={dropdownMenuItems}
              getPopupContainer={(triggerNode) => triggerNode.parentNode}
            >
              <Button
                type="text"
                icon={<EllipsisOutlined />}
                size="small"
                style={DROPDOWN_BUTTON_STYLE}
              />
            </Dropdown>
          </Flex>
        </Card>
      )}
      <TimelineTicket timelineItems={item?.timelineItems} />
    </>
  );
});

CommentTicket.displayName = "CommentTicket";

// Static styles for DetailTicketPublish
const CONTAINER_MOBILE_STYLE = { padding: "16px", background: "#fafafa" };
const CONTAINER_DESKTOP_STYLE = { padding: "24px", background: "#fafafa" };
const MAX_WIDTH_STYLE = { maxWidth: 1200, margin: "0 auto" };
const AFFIX_CARD_STYLE = { borderRadius: 8, background: "white" };
const DESCRIPTION_CARD_STYLE = { marginTop: 8, marginBottom: 8 };
const COMMENT_CARD_STYLE = { borderRadius: 8 };

const DetailTicketPublish = ({ id }) => {
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
    {
      refetchOnWindowFocus: false,
    }
  );

  // Memoize container style
  const containerStyle = useMemo(
    () => (responsiveConfig.isMobile ? CONTAINER_MOBILE_STYLE : CONTAINER_DESKTOP_STYLE),
    [responsiveConfig.isMobile]
  );

  // Memoize sidebar style
  const sidebarStyle = useMemo(
    () => ({
      position: responsiveConfig.isMobile ? "static" : "sticky",
      top: responsiveConfig.isMobile ? "auto" : 100,
    }),
    [responsiveConfig.isMobile]
  );

  // Memoize comments list to prevent unnecessary re-renders
  const commentsList = useMemo(
    () =>
      data?.data?.map((item) => (
        <CommentTicket
          key={item?.id || item?.custom_id}
          customer={data?.customer}
          agent={data?.agent}
          admin={data?.admin}
          item={item}
        />
      )),
    [data?.data, data?.customer, data?.agent, data?.admin]
  );

  return (
    <div style={containerStyle}>
      <Skeleton loading={isLoading}>
        <Head>
          <title>{data?.title}</title>
        </Head>
        {data && (
          <>
            <FloatButton.BackTop />
            <div style={MAX_WIDTH_STYLE}>
              <Row gutter={[8, 16]}>
                <Col span={24}>
                  <Affix offsetTop={54}>
                    <Card size="small" style={AFFIX_CARD_STYLE}>
                      <ChangeTicketTitle
                        name="edit-ticket-title"
                        attributes={{ ticket: data }}
                        ticket={data}
                      />
                    </Card>
                  </Affix>
                </Col>
              </Row>

              <Row gutter={responsiveConfig.gutter}>
                <Col
                  md={responsiveConfig.contentSpan}
                  xs={24}
                  order={responsiveConfig.isMobile ? 2 : 1}
                >
                  <Flex vertical gap={8}>
                    <Card size="small" style={DESCRIPTION_CARD_STYLE}>
                      <ChangeTicketDescription item={data} />
                    </Card>

                    {commentsList}

                    <RestrictedContent
                      name="create-comment"
                      attributes={{ ticket: data }}
                    >
                      <Card
                        size="small"
                        title="💬 Tambah Komentar"
                        style={COMMENT_CARD_STYLE}
                      >
                        <NewTicketWrapper
                          id={id}
                          currentStatus={data?.status_code}
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
                  <div style={sidebarStyle}>
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

export default memo(DetailTicketPublish);
