import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import {
  deleteComment,
  downvoteComment,
  getComments,
  upvoteComment,
} from "@/services/asn-connect-discussions.services";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CommentOutlined,
  MoreOutlined,
  RetweetOutlined,
  CaretUpFilled,
  CaretDownFilled,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dropdown,
  List,
  Modal,
  Space,
  Tooltip,
  message,
  Card,
  Flex,
  Avatar,
  Button,
  Typography,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import AvatarUser from "../Users/AvatarUser";
import UserText from "../Users/UserText";
import DiscussionCreateComment from "./DiscussionCreateComment";

const { Text: AntText } = Typography;

const UserComment = ({
  discussionId,
  comment,
  isReply = false,
  depth = 0,
  isLast = false,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEditId, setSelectedEditId] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const { data: currentUser } = useSession();
  const queryClient = useQueryClient();

  const handleAddComment = () => {
    setSelectedId(comment?.id);
  };

  const handleCancel = () => {
    setSelectedId(null);
  };

  const handleEdit = () => {
    if (selectedEditId) {
      setSelectedEditId(null);
    } else {
      setSelectedEditId(comment?.id);
    }
  };

  const handleCancelEdit = () => {
    setSelectedEditId(null);
  };

  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => deleteComment(data),
    {
      onSuccess: () => {
        message.success("Komentar berhasil dihapus");
      },
      onError: (error) => {
        message.error("Gagal menghapus komentar");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "asn-discussions-comment",
          discussionId,
        ]);
      },
    }
  );

  const { mutate: upvote, isLoading: isLoadingUpvote } = useMutation(
    (data) => upvoteComment(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries([
          "asn-discussions-comment",
          discussionId,
        ]);
      },
      onSuccess: () => {
        message.success("Komentar berhasil di-upvote");
      },
      onError: (error) => {
        message.error("Gagal upvote komentar");
      },
    }
  );

  const { mutate: downvote, isLoading: isLoadingDownvote } = useMutation(
    (data) => downvoteComment(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries([
          "asn-discussions-comment",
          discussionId,
        ]);
      },
      onSuccess: () => {
        message.success("Komentar berhasil di-downvote");
      },
      onError: (error) => {
        message.error("Gagal downvote komentar");
      },
    }
  );

  const handleUpvote = (e) => {
    e.stopPropagation();
    upvote({
      commentId: comment?.id,
      discussionId: discussionId,
    });
  };

  const handleDownvote = (e) => {
    e.stopPropagation();
    downvote({
      commentId: comment?.id,
      discussionId: discussionId,
    });
  };

  const handleHapus = () => {
    Modal.confirm({
      title: "Hapus komentar?",
      content: "Komentar akan dihapus secara permanen",
      okText: "Hapus",
      cancelText: "Batal",
      okType: "danger",
      onOk: async () => {
        await remove({
          discussionId: discussionId,
          commentId: comment?.id,
        });
      },
    });
  };

  const items = () => {
    const admin = currentUser?.user?.current_role === "admin";

    if (currentUser?.user?.id !== comment?.user?.custom_id && !admin) {
      return [{ label: "Laporkan", key: "lapor" }];
    } else
      return [
        { label: "Edit", key: "edit" },
        { label: "Hapus", key: "hapus" },
        { label: "Laporkan", key: "lapor" },
      ];
  };

  const handleDropdown = (item) => {
    switch (item.key) {
      case "edit":
        handleEdit();
        break;
      case "hapus":
        handleHapus();
        break;
      default:
        break;
    }
  };

  const voteScore =
    parseInt(comment?.upvote_count) - parseInt(comment?.downvote_count);
  const userVoteType = comment?.votes?.[0]?.vote_type;

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Tree Lines */}
      {depth > 0 && (
        <>
          {/* Vertical line for parent threads */}
          {Array.from({ length: depth - 1 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${12 + i * 24}px`,
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: "#EDEFF1",
                zIndex: 1,
              }}
            />
          ))}

          {/* Horizontal line to current comment */}
          <div
            style={{
              position: "absolute",
              left: `${12 + (depth - 1) * 24}px`,
              top: "16px",
              width: "12px",
              height: "1px",
              backgroundColor: "#EDEFF1",
              zIndex: 1,
            }}
          />

          {/* Vertical line for current level */}
          {!isLast && (
            <div
              style={{
                position: "absolute",
                left: `${12 + (depth - 1) * 24}px`,
                top: "16px",
                bottom: 0,
                width: "1px",
                backgroundColor: "#EDEFF1",
                zIndex: 1,
              }}
            />
          )}
        </>
      )}

      <div
        style={{
          marginBottom: "8px",
          marginLeft: depth > 0 ? `${24 * depth}px` : "0",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Card
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Flex>
            {/* Vote Section - Reddit Style */}
            <div
              style={{
                width: "32px",
                backgroundColor: "#F8F9FA",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: "8px 0",
                borderRight: "1px solid #EDEFF1",
              }}
            >
              <CaretUpFilled
                style={{
                  fontSize: 14,
                  color: userVoteType === "upvote" ? "#FF4500" : "#878A8C",
                  cursor: isLoadingUpvote ? "not-allowed" : "pointer",
                  padding: "2px",
                  opacity: isLoadingUpvote ? 0.6 : 1,
                  transition: "color 0.2s ease",
                }}
                onClick={!isLoadingUpvote ? handleUpvote : undefined}
              />
              <AntText
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color:
                    voteScore > 0
                      ? "#FF4500"
                      : voteScore < 0
                      ? "#7193FF"
                      : "#878A8C",
                  margin: "2px 0",
                  lineHeight: 1,
                  textAlign: "center",
                }}
              >
                {voteScore > 0 ? `+${voteScore}` : voteScore}
              </AntText>
              <CaretDownFilled
                onClick={!isLoadingDownvote ? handleDownvote : undefined}
                style={{
                  fontSize: 14,
                  color: userVoteType === "downvote" ? "#7193FF" : "#878A8C",
                  cursor: isLoadingDownvote ? "not-allowed" : "pointer",
                  padding: "2px",
                  opacity: isLoadingDownvote ? 0.6 : 1,
                  transition: "color 0.2s ease",
                }}
              />
            </div>

            {/* Content Section */}
            <div style={{ flex: 1, padding: "12px" }}>
              {/* Header with user info and actions */}
              <Flex
                justify="space-between"
                align="flex-start"
                style={{ marginBottom: "8px" }}
              >
                <Flex align="center" gap={6}>
                  {comment?.children && comment.children.length > 0 && (
                    <span
                      onClick={toggleCollapse}
                      style={{
                        cursor: "pointer",
                        color: "#787C7E",
                        fontSize: "12px",
                        fontWeight: "bold",
                        marginRight: "4px",
                        userSelect: "none",
                      }}
                    >
                      {collapsed ? "[+]" : "[-]"}
                    </span>
                  )}
                  <Avatar
                    size={20}
                    src={comment?.user?.image}
                    style={{ border: "1px solid #EDEFF1" }}
                  />
                  <AntText
                    style={{
                      fontSize: "12px",
                      color: "#1A1A1B",
                      fontWeight: 600,
                    }}
                  >
                    {comment?.user?.username}
                  </AntText>
                  <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
                  <Tooltip
                    title={dayjs(comment?.created_at).format(
                      "DD MMM YYYY HH:mm"
                    )}
                  >
                    <AntText
                      style={{
                        fontSize: "12px",
                        color: "#787C7E",
                      }}
                    >
                      {dayjs(comment?.created_at).locale("id").fromNow()}
                    </AntText>
                  </Tooltip>
                  {comment?.edited_at && (
                    <>
                      <span style={{ color: "#787C7E", fontSize: "12px" }}>
                        •
                      </span>
                      <AntText
                        style={{
                          fontSize: "12px",
                          color: "#787C7E",
                          fontStyle: "italic",
                        }}
                      >
                        diubah
                      </AntText>
                    </>
                  )}
                </Flex>

                <Dropdown
                  menu={{
                    items: items(),
                    onClick: handleDropdown,
                  }}
                  trigger={["click"]}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    style={{
                      color: "#787C7E",
                      fontSize: "12px",
                      padding: "2px 4px",
                      height: "auto",
                    }}
                  />
                </Dropdown>
              </Flex>

              {/* Content */}
              {selectedEditId === comment?.id ? (
                <div style={{ marginBottom: "8px" }}>
                  <DiscussionCreateComment
                    discussionId={discussionId}
                    commentId={comment?.id}
                    onCancel={handleCancelEdit}
                    content={comment?.content}
                    action="edit"
                    withBatal
                  />
                </div>
              ) : (
                <div
                  style={{
                    color: "#1A1A1B",
                    fontSize: "14px",
                    lineHeight: "18px",
                    marginBottom: "8px",
                  }}
                >
                  <ReactMarkdownCustom>{comment?.content}</ReactMarkdownCustom>
                </div>
              )}

              {/* Actions */}
              {selectedEditId !== comment?.id && (
                <Flex align="center" gap={12}>
                  <Flex
                    align="center"
                    gap={4}
                    style={{
                      color: "#787C7E",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "4px 6px",
                      borderRadius: "4px",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F8F9FA";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    onClick={handleAddComment}
                  >
                    <RetweetOutlined style={{ fontSize: "12px" }} />
                    <span>Balas</span>
                  </Flex>

                  {comment?.total_comment > 0 && (
                    <Flex align="center" gap={4}>
                      <CommentOutlined
                        style={{ fontSize: "12px", color: "#787C7E" }}
                      />
                      <AntText style={{ fontSize: "12px", color: "#787C7E" }}>
                        {comment?.total_comment}
                      </AntText>
                    </Flex>
                  )}

                  {collapsed &&
                    comment?.children &&
                    comment.children.length > 0 && (
                      <AntText
                        style={{
                          fontSize: "12px",
                          color: "#787C7E",
                          fontStyle: "italic",
                        }}
                      >
                        {comment.children.length} balasan tersembunyi
                      </AntText>
                    )}
                </Flex>
              )}

              {/* Reply Form */}
              {selectedId === comment?.id && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "4px",
                  }}
                >
                  <DiscussionCreateComment
                    discussionId={discussionId}
                    parentId={comment?.id}
                    data={comment?.user}
                    withBatal
                    onCancel={handleCancel}
                  />
                </div>
              )}
            </div>
          </Flex>
        </Card>

        {/* Nested Comments */}
        {!collapsed &&
          comment?.children?.map((item, index) => (
            <UserComment
              key={item?.id}
              discussionId={discussionId}
              comment={item}
              isReply={true}
              depth={depth + 1}
              isLast={index === comment.children.length - 1}
            />
          ))}
      </div>
    </div>
  );
};

const UserComments = ({ discussionId, data, loading }) => {
  if (loading) {
    return (
      <div>
        {[1, 2, 3].map((item) => (
          <Card
            key={item}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
              marginBottom: "12px",
            }}
            bodyStyle={{ padding: 0 }}
          >
            <Flex>
              <div
                style={{
                  width: "32px",
                  backgroundColor: "#F8F9FA",
                  padding: "8px",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: "#E5E7EB",
                    borderRadius: "2px",
                  }}
                ></div>
              </div>
              <div style={{ flex: 1, padding: "12px" }}>
                <div
                  style={{
                    width: "30%",
                    height: "12px",
                    backgroundColor: "#E5E7EB",
                    borderRadius: "2px",
                    marginBottom: "8px",
                  }}
                ></div>
                <div
                  style={{
                    width: "80%",
                    height: "14px",
                    backgroundColor: "#E5E7EB",
                    borderRadius: "2px",
                    marginBottom: "4px",
                  }}
                ></div>
                <div
                  style={{
                    width: "60%",
                    height: "14px",
                    backgroundColor: "#E5E7EB",
                    borderRadius: "2px",
                  }}
                ></div>
              </div>
            </Flex>
          </Card>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          textAlign: "center",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <AntText style={{ color: "#787C7E", fontSize: "14px" }}>
          Belum ada komentar. Jadilah yang pertama berkomentar!
        </AntText>
      </Card>
    );
  }

  return (
    <div>
      {data.map((item) => (
        <UserComment
          key={item?.id}
          discussionId={discussionId}
          comment={item}
        />
      ))}
    </div>
  );
};

const DiscussionsComments = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["asn-discussions-comment", id],
    () => getComments(id),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div>
      {/* Create Comment Form */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <DiscussionCreateComment discussionId={id} />
      </Card>

      {/* Comments List */}
      <UserComments loading={isLoading} data={data} discussionId={id} />
    </div>
  );
};

export default DiscussionsComments;
