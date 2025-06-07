import { deleteComment, getComments } from "@/services/socmed.services";
import {
  MoreOutlined,
  HeartFilled,
  CommentOutlined,
  EditOutlined,
  DeleteOutlined,
  FlagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Flex,
  List,
  Modal,
  Row,
  Skeleton,
  Space,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import SocmedCreateComment from "./SocmedCreateComment";
import SocmedEditComment from "./SocmedEditComment";
import { useRouter } from "next/router";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import AvatarUser from "../Users/AvatarUser";
import UserText from "../Users/UserText";
import { mineLike, personLikes } from "@/utils/client-utils";

dayjs.locale("id");
dayjs.extend(relativeTime);

const { Text: AntText } = Typography;

const UserComment = ({ comment, depth = 0 }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEditId, setSelectedEditId] = useState(null);

  const { data: currentUser } = useSession();
  const queryClient = useQueryClient();

  const handleAddComment = () => {
    setSelectedId(comment?.id);
  };

  const handleCancel = () => {
    setSelectedId(null);
  };

  const handleEdit = () => {
    setSelectedEditId(comment?.id);
  };

  const handleCancelEdit = () => {
    setSelectedEditId(null);
  };

  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => deleteComment(data),
    {
      onSuccess: () => {
        message.success("Komentar berhasil dihapus");
        queryClient.invalidateQueries(["socmed-comments"]);
      },
      onError: (error) => {
        message.error("Gagal menghapus komentar");
      },
    }
  );

  const handleHapus = () => {
    Modal.confirm({
      title: "Hapus Komentar",
      content: "Apakah Anda yakin ingin menghapus komentar ini?",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okButtonProps: {
        danger: true,
        style: { backgroundColor: "#FF4500", borderColor: "#FF4500" },
      },
      onOk: async () => {
        await remove({
          postId: comment?.post_id,
          commentId: comment?.id,
        });
      },
    });
  };

  const dropdownItems = () => {
    if (currentUser?.user?.id !== comment?.user_id) {
      return [
        {
          key: "lapor",
          icon: <FlagOutlined />,
          label: "Laporkan Komentar",
        },
      ];
    } else {
      return [
        {
          key: "edit",
          icon: <EditOutlined />,
          label: "Edit Komentar",
        },
        {
          key: "hapus",
          icon: <DeleteOutlined />,
          label: "Hapus Komentar",
          danger: true,
        },
        {
          type: "divider",
        },
        {
          key: "lapor",
          icon: <FlagOutlined />,
          label: "Laporkan Komentar",
        },
      ];
    }
  };

  const handleDropdown = (item) => {
    switch (item.key) {
      case "edit":
        handleEdit();
        break;
      case "hapus":
        handleHapus();
        break;
      case "lapor":
        message.info("Fitur laporan akan segera tersedia");
        break;
      default:
        break;
    }
  };

  return (
    <div
      style={{
        marginLeft: depth > 0 ? `${depth * 24}px` : 0,
        marginBottom: "8px",
      }}
    >
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          padding: 0,
          overflow: "hidden",
          transition: "border-color 0.2s ease",
        }}
        bodyStyle={{ padding: 0 }}
        hoverable
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#898989";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#EDEFF1";
        }}
      >
        <Flex>
          {/* Vote Section - Simplified for comments */}
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
            <CommentOutlined
              style={{
                fontSize: 12,
                color: "#878A8C",
                padding: "2px",
              }}
            />
          </div>

          {/* Content Section */}
          <Flex vertical style={{ flex: 1, padding: "8px 12px" }}>
            {/* Comment Meta */}
            <Flex align="center" gap={6} style={{ marginBottom: "8px" }}>
              <AvatarUser
                src={comment?.user?.image}
                userId={comment?.user?.custom_id}
                user={comment?.user}
                size={16}
              />
              <UserText
                text={comment?.user?.username}
                userId={comment?.user?.custom_id}
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                  fontWeight: 500,
                }}
              />
              <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
              <Tooltip
                title={dayjs(comment?.created_at).format("DD MMM YYYY HH:mm")}
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
            </Flex>

            {/* Comment Content */}
            {selectedEditId === comment?.id ? (
              <div style={{ marginBottom: "12px" }}>
                <SocmedEditComment
                  comment={comment}
                  onCancel={handleCancelEdit}
                  withBatal
                />
              </div>
            ) : (
              <div
                style={{
                  color: "#1A1A1B",
                  fontSize: "14px",
                  lineHeight: "18px",
                  marginBottom: "12px",
                }}
              >
                <ReactMarkdownCustom>{comment?.comment}</ReactMarkdownCustom>
              </div>
            )}

            {/* Actions */}
            {selectedEditId !== comment?.id && (
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={16}>
                  <Flex
                    align="center"
                    gap={4}
                    style={{
                      color: "#787C7E",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: "4px 6px",
                      borderRadius: "2px",
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
                    <CommentOutlined style={{ fontSize: "12px" }} />
                    <span>Balas</span>
                  </Flex>
                </Flex>

                <Dropdown
                  menu={{
                    items: dropdownItems(),
                    onClick: handleDropdown,
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    size="small"
                    style={{
                      color: "#878A8C",
                      border: "none",
                      padding: "2px",
                      fontSize: "12px",
                    }}
                  />
                </Dropdown>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Card>

      {/* Reply Form */}
      {selectedId === comment?.id && (
        <div style={{ marginTop: "8px", marginLeft: "24px" }}>
          <SocmedCreateComment
            parentId={comment?.id}
            data={comment?.user}
            withBatal
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Nested Comments */}
      {comment?.children?.map((item) => (
        <UserComment key={item?.id} comment={item} depth={depth + 1} />
      ))}
    </div>
  );
};

const PostHeader = ({ post }) => {
  const { data: currentUser } = useSession();
  const router = useRouter();

  // Dummy like functionality for post display
  const isUserLiked = mineLike(currentUser?.user?.id, post?.likes);
  const likesCount = post?.likes_count || 0;

  return (
    <Card
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        marginBottom: "16px",
        padding: 0,
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex style={{ minHeight: "80px" }}>
        {/* Vote Section - Reddit Style */}
        <div
          style={{
            width: "40px",
            backgroundColor: "#F8F9FA",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "8px 0",
            borderRight: "1px solid #EDEFF1",
          }}
        >
          <HeartFilled
            style={{
              fontSize: 16,
              color: isUserLiked ? "#FF4500" : "#878A8C",
              padding: "4px",
            }}
          />
          <AntText
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: isUserLiked ? "#FF4500" : "#878A8C",
              margin: "4px 0",
              lineHeight: 1,
            }}
          >
            {likesCount}
          </AntText>
        </div>

        {/* Content Section */}
        <Flex vertical style={{ flex: 1, padding: "12px 16px" }}>
          {/* Post Meta */}
          <Flex align="center" gap={6} style={{ marginBottom: "12px" }}>
            <AvatarUser
              src={post?.user?.image}
              userId={post?.user?.custom_id}
              user={post?.user}
              size={24}
            />
            <UserText
              text={post?.user?.username}
              userId={post?.user?.custom_id}
              style={{
                fontSize: "14px",
                color: "#787C7E",
                fontWeight: 600,
              }}
            />
            <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
            <Tooltip
              title={dayjs(post?.created_at).format("DD MMM YYYY HH:mm")}
            >
              <AntText
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                }}
              >
                {dayjs(post?.created_at).locale("id").fromNow()}
              </AntText>
            </Tooltip>
          </Flex>

          {/* Post Content */}
          <div
            style={{
              color: "#1A1A1B",
              fontSize: "16px",
              lineHeight: "22px",
              marginBottom: "16px",
            }}
          >
            <ReactMarkdownCustom>{post?.content}</ReactMarkdownCustom>
          </div>

          {/* Post Stats */}
          <Flex align="center" gap={16}>
            <Flex align="center" gap={4}>
              <CommentOutlined style={{ fontSize: "14px", color: "#787C7E" }} />
              <AntText
                style={{
                  fontSize: "12px",
                  color: "#787C7E",
                  fontWeight: 700,
                }}
              >
                {post?.comments_count || 0} Komentar
              </AntText>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

const UserComments = ({ postId }) => {
  const { data, isLoading } = useQuery(
    ["socmed-comments", postId],
    () => getComments(postId),
    {}
  );

  if (isLoading) {
    return (
      <div>
        {[1, 2, 3].map((item) => (
          <Card
            key={item}
            style={{
              marginBottom: "8px",
              border: "1px solid #EDEFF1",
              borderRadius: "4px",
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
                <Skeleton.Avatar size={16} />
              </div>
              <Flex vertical style={{ flex: 1, padding: "12px" }} gap={8}>
                <Skeleton.Input style={{ width: "30%" }} active size="small" />
                <Skeleton
                  paragraph={{ rows: 2, width: ["100%", "70%"] }}
                  active
                />
                <Skeleton.Input style={{ width: "20%" }} active size="small" />
              </Flex>
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
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          backgroundColor: "#FFFFFF",
          textAlign: "center",
        }}
        bodyStyle={{ padding: "48px 32px" }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div
            style={{
              fontSize: "36px",
              color: "#D1D5DB",
              marginBottom: "8px",
            }}
          >
            💬
          </div>
          <AntText style={{ color: "#787C7E", fontSize: "16px" }}>
            Belum ada komentar
          </AntText>
          <AntText
            type="secondary"
            style={{ fontSize: "14px", color: "#9CA3AF" }}
          >
            Jadilah yang pertama untuk berkomentar
          </AntText>
        </Space>
      </Card>
    );
  }

  return (
    <div>
      {data.map((item) => (
        <UserComment key={item?.id} comment={item} depth={0} />
      ))}
    </div>
  );
};

function SocmedComments({ post, id }) {
  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Post Header */}
      {post && <PostHeader post={post} />}

      {/* Comment Form */}
      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
        bodyStyle={{ padding: "16px" }}
      >
        <SocmedCreateComment />
      </Card>

      {/* Comments List */}
      <UserComments postId={id} />

      <style jsx global>{`
        .ant-card-hoverable:hover {
          border-color: #898989 !important;
        }

        .ant-dropdown-menu-item-danger {
          color: #ff4757 !important;
        }

        .ant-dropdown-menu-item-danger:hover {
          background-color: #fff2f0 !important;
        }
      `}</style>
    </div>
  );
}

export default SocmedComments;
