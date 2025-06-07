import { parseMarkdown, uploadFiles } from "@/services/index";
import {
  deletePost,
  getPosts,
  likePost,
  updatePost,
} from "@/services/socmed.services";
import {
  CommentOutlined,
  HeartFilled,
  HeartOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  FlagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { MarkdownEditor } from "@primer/react/drafts";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Flex,
  List,
  Modal,
  Row,
  Space,
  Tooltip,
  Typography,
  message,
  Skeleton,
} from "antd";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import SocmedPostsFilter from "./SocmedPostsFilter";
import { mineLike, personLikes } from "@/utils/client-utils";
import AvatarUser from "../Users/AvatarUser";
import UserText from "../Users/UserText";

const { Text: AntText } = Typography;

const uploadFile = async (file) => {
  try {
    const formData = new FormData();

    // if file not image png, jpg, jpeg, gif
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      return;
    } else {
      formData.append("file", file);
      const result = await uploadFiles(formData);
      return {
        url: result?.data,
        file,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

const renderMarkdown = async (markdown) => {
  if (!markdown) return;
  const result = await parseMarkdown(markdown);
  return result?.html;
};

function SocmedEditPost({ post, edit, isLoading, cancel }) {
  const [value, setValue] = useState(post?.content);

  const handleCancel = () => {
    cancel();
  };

  const handleFinish = () => {
    if (!value) {
      return;
    } else {
      edit({
        id: post?.id,
        data: {
          content: value,
        },
      });
    }
  };

  return (
    <Card
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        border: "1px solid #EDEFF1",
        borderRadius: "4px",
        marginBottom: "8px",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Flex>
        {/* Vote Section - Placeholder for edit mode */}
        <div
          style={{
            width: "40px",
            backgroundColor: "#F8F9FA",
            borderRight: "1px solid #EDEFF1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "120px",
          }}
        >
          <EditOutlined style={{ color: "#FF4500", fontSize: "16px" }} />
        </div>

        {/* Edit Content */}
        <div style={{ flex: 1, padding: "12px" }}>
          {/* User Info */}
          <Flex align="center" gap={8} style={{ marginBottom: "12px" }}>
            <Avatar size={20} src={post?.user?.image} />
            <AntText
              style={{
                fontSize: "12px",
                color: "#787C7E",
                fontWeight: 500,
              }}
            >
              {post?.user?.username}
            </AntText>
            <span style={{ color: "#787C7E", fontSize: "12px" }}>•</span>
            <AntText
              style={{
                fontSize: "12px",
                color: "#787C7E",
              }}
            >
              sedang mengedit
            </AntText>
          </Flex>

          {/* Editor */}
          <MarkdownEditor
            acceptedFileTypes={[
              "image/png",
              "image/jpg",
              "image/jpeg",
              "image/gif",
            ]}
            value={value}
            onChange={setValue}
            onRenderPreview={renderMarkdown}
            onUploadFile={uploadFile}
            savedReplies={false}
            mentionSuggestions={false}
          >
            <MarkdownEditor.Actions>
              <MarkdownEditor.ActionButton
                variant="danger"
                size="medium"
                onClick={handleCancel}
              >
                Batal
              </MarkdownEditor.ActionButton>
              <MarkdownEditor.ActionButton
                disabled={!value || isLoading}
                variant="primary"
                size="medium"
                onClick={handleFinish}
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </MarkdownEditor.ActionButton>
            </MarkdownEditor.Actions>
          </MarkdownEditor>
        </div>
      </Flex>
    </Card>
  );
}

const PostCard = ({ post, currentUser }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState(null);

  const handleEdit = () => {
    setSelectedId(post?.id);
  };

  const handleCancelEdit = () => {
    setSelectedId(null);
  };

  const gotoDetailPost = () => {
    router.push(`/asn-connect/asn-updates/all/${post?.id}`);
  };

  const { mutate: like, isLoading: isLoadingLike } = useMutation(
    (data) => likePost(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["socmed-posts"]);
        queryClient.invalidateQueries(["my-socmed-posts"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["socmed-posts"]);
      },
    }
  );

  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => deletePost(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["socmed-posts"]);
        message.success("Post berhasil dihapus");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["socmed-posts"]);
      },
    }
  );

  const { mutate: edit, isLoading: isLoadingEdit } = useMutation(
    (data) => updatePost(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["socmed-posts"]);
        message.success("Post berhasil diperbarui");
        setSelectedId(null);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["socmed-posts"]);
      },
    }
  );

  const handleLike = () => {
    like(post?.id);
  };

  const handleHapus = () => {
    Modal.confirm({
      title: "Hapus Post",
      content: "Apakah anda yakin ingin menghapus post ini?",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okButtonProps: {
        danger: true,
        style: { backgroundColor: "#FF4500", borderColor: "#FF4500" },
      },
      onOk: async () => {
        await hapus(post?.id);
      },
    });
  };

  const dropdownItems = () => {
    if (currentUser?.id !== post?.user_id) {
      return [
        {
          key: "lapor",
          icon: <FlagOutlined />,
          label: "Laporkan Post",
        },
      ];
    } else {
      return [
        {
          key: "edit",
          icon: <EditOutlined />,
          label: "Edit Post",
        },
        {
          key: "hapus",
          icon: <DeleteOutlined />,
          label: "Hapus Post",
          danger: true,
        },
        {
          type: "divider",
        },
        {
          key: "lapor",
          icon: <FlagOutlined />,
          label: "Laporkan Post",
        },
      ];
    }
  };

  const handleClickDropdown = (item) => {
    if (item.key === "edit") {
      handleEdit();
    } else if (item.key === "hapus") {
      handleHapus();
    } else if (item.key === "lapor") {
      message.info("Fitur laporan akan segera tersedia");
    }
  };

  const isUserLiked = mineLike(currentUser?.user?.id, post?.likes);
  const likesCount = post?.likes_count || 0;

  return (
    <>
      {selectedId === post?.id ? (
        <SocmedEditPost
          post={post}
          cancel={handleCancelEdit}
          edit={edit}
          isLoading={isLoadingEdit}
        />
      ) : (
        <Card
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            marginBottom: "8px",
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
              <Tooltip
                title={
                  post?.likes?.length > 0
                    ? personLikes(post?.likes, currentUser?.user?.id)
                    : "Sukai post ini"
                }
              >
                <HeartFilled
                  style={{
                    fontSize: 16,
                    color: isUserLiked ? "#FF4500" : "#878A8C",
                    cursor: isLoadingLike ? "not-allowed" : "pointer",
                    padding: "4px",
                    opacity: isLoadingLike ? 0.6 : 1,
                    transition: "color 0.2s ease",
                  }}
                  onClick={!isLoadingLike ? handleLike : undefined}
                />
              </Tooltip>
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
            <Flex
              vertical
              style={{ flex: 1, padding: "8px 12px", cursor: "pointer" }}
              onClick={gotoDetailPost}
            >
              {/* Post Meta */}
              <Flex align="center" gap={6} style={{ marginBottom: "8px" }}>
                <AvatarUser
                  src={post?.user?.image}
                  userId={post?.user?.custom_id}
                  user={post?.user}
                  size={20}
                />
                <UserText
                  text={post?.user?.username}
                  userId={post?.user?.custom_id}
                  style={{
                    fontSize: "12px",
                    color: "#787C7E",
                    fontWeight: 500,
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

              {/* Content */}
              <div
                style={{
                  color: "#1A1A1B",
                  fontSize: "14px",
                  lineHeight: "18px",
                  marginBottom: "12px",
                  whiteSpace: "pre-wrap",
                }}
              >
                <ReactMarkdownCustom withCustom={false}>
                  {post?.content}
                </ReactMarkdownCustom>
              </div>

              {/* Actions */}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      gotoDetailPost();
                    }}
                  >
                    <CommentOutlined style={{ fontSize: "14px" }} />
                    <span>{post?.comments_count} Komentar</span>
                  </Flex>
                </Flex>

                <Dropdown
                  menu={{
                    items: dropdownItems(),
                    onClick: handleClickDropdown,
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
                      padding: "4px",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      )}
    </>
  );
};

const LoadingSkeleton = () => (
  <div>
    {[1, 2, 3].map((item) => (
      <Card
        key={item}
        style={{
          width: "100%",
          marginBottom: "8px",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          <div
            style={{
              width: "40px",
              backgroundColor: "#F8F9FA",
              padding: "8px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Skeleton.Avatar size={16} />
          </div>
          <Flex vertical style={{ flex: 1, padding: "12px" }} gap={8}>
            <Skeleton.Input style={{ width: "40%" }} active size="small" />
            <Skeleton
              paragraph={{ rows: 3, width: ["100%", "80%", "60%"] }}
              active
            />
            <Skeleton.Input style={{ width: "30%" }} active size="small" />
          </Flex>
        </Flex>
      </Card>
    ))}
  </div>
);

function SocmedPosts() {
  const router = useRouter();

  const { data: currentUser } = useSession();
  const {
    data: posts,
    isLoading,
    hasNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery(
    ["socmed-posts", router?.query],
    ({ pageParam = 1 }) =>
      getPosts({ ...router?.query, page: pageParam, limit: 50 }),
    {
      getNextPageParam: (lastPage) => {
        const defaultLimit = 50;
        const nextPage = lastPage?.pagination?.page + 1;
        if (lastPage?.data?.length < defaultLimit) return undefined;
        return nextPage;
      },
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5,
    }
  );

  const flatPosts = posts?.pages.flatMap((page) => page.data) || [];

  return (
    <div
      style={{
        backgroundColor: "#DAE0E6",
        minHeight: "100vh",
      }}
    >
      {/* Filter */}
      <Row justify="end" style={{ marginBottom: "20px" }}>
        <Col>
          <SocmedPostsFilter />
        </Col>
      </Row>

      {/* Posts */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : flatPosts.length > 0 ? (
        <>
          <List
            dataSource={flatPosts}
            renderItem={(item) => (
              <List.Item style={{ padding: 0, border: "none" }}>
                <PostCard post={item} currentUser={currentUser} />
              </List.Item>
            )}
            loadMore={
              hasNextPage ? (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: 16,
                    padding: "16px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "4px",
                    border: "1px solid #EDEFF1",
                  }}
                >
                  {isFetching ? (
                    <Skeleton.Button active style={{ width: "120px" }} />
                  ) : (
                    <Button
                      onClick={fetchNextPage}
                      style={{
                        backgroundColor: "#FF4500",
                        borderColor: "#FF4500",
                        borderRadius: "20px",
                        fontWeight: 600,
                        color: "white",
                        height: "36px",
                        padding: "0 24px",
                      }}
                    >
                      Muat Lebih Banyak
                    </Button>
                  )}
                </div>
              ) : null
            }
          />
        </>
      ) : (
        <Card
          style={{
            border: "1px solid #EDEFF1",
            borderRadius: "4px",
            backgroundColor: "#FFFFFF",
            textAlign: "center",
          }}
          bodyStyle={{ padding: "64px 32px" }}
        >
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div
              style={{
                fontSize: "48px",
                color: "#D1D5DB",
                marginBottom: "8px",
              }}
            >
              📝
            </div>
            <AntText style={{ color: "#787C7E", fontSize: "16px" }}>
              Belum ada post di feed ini
            </AntText>
            <AntText
              type="secondary"
              style={{ fontSize: "14px", color: "#9CA3AF" }}
            >
              Jadilah yang pertama untuk berbagi update
            </AntText>
          </Space>
        </Card>
      )}

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

export default SocmedPosts;
