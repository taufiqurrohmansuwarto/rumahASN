import { parseMarkdown, uploadFiles } from "@/services/index";
import {
  deletePost,
  getPosts,
  likePost,
  updatePost,
} from "@/services/socmed.services";
import { Comment } from "@ant-design/compatible";
import {
  CommentOutlined,
  HeartFilled,
  HeartOutlined,
  LikeOutlined,
  MoreOutlined,
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
  Col,
  Dropdown,
  List,
  Modal,
  Row,
  Space,
  Tooltip,
  message,
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
    <Comment
      author={
        <Stack>
          <span>{post?.user?.username}</span>
        </Stack>
      }
      avatar={<Avatar src={post?.user?.image} alt={post?.user?.name} />}
      content={
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
              Cancel
            </MarkdownEditor.ActionButton>
            <MarkdownEditor.ActionButton
              disabled={!value || isLoading}
              variant="primary"
              size="medium"
              onClick={handleFinish}
            >
              {isLoading ? "Loading..." : "Submit"}
            </MarkdownEditor.ActionButton>
          </MarkdownEditor.Actions>
        </MarkdownEditor>
      }
    />
  );
}

const Post = ({ post, currentUser }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedId, setSelectedId] = useState(null);
  const [open, setOpen] = useState(false);

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
        message.success("berhasil");
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
        message.success("berhasil");
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
      okText: "Ya",
      cancelText: "Tidak",
      onOk: async () => {
        await hapus(post?.id);
      },
    });
  };

  const items = () => {
    if (currentUser?.id !== post?.user_id) {
      return [{ label: "Laporkan", key: "lapor" }];
    } else
      return [
        { label: "Edit", key: "edit" }, // remember to pass the key prop
        { label: "Hapus", key: "hapus" },
        { label: "Laporkan", key: "lapor" },
      ];
  };
  const handleClickDropdown = (item) => {
    if (item.key === "edit") {
      // edit(post?.id);
      handleEdit();
    } else if (item.key === "hapus") {
      handleHapus();
    } else if (item.key === "lapor") {
      console.log("lapor");
    }
  };

  const actions = [
    <span key="likes">
      <Space>
        <Tooltip
          color="green"
          title={
            post?.likes?.length > 0
              ? personLikes(post?.likes, currentUser?.user?.id)
              : null
          }
        >
          <HeartFilled
            onClick={handleLike}
            style={{
              color: mineLike(currentUser?.user?.id, post?.likes)
                ? "red"
                : null,
            }}
          />
        </Tooltip>
        {post?.likes_count}
      </Space>
    </span>,
    <span key="comment" onClick={gotoDetailPost}>
      <Space>
        <CommentOutlined />
        {post?.comments_count} Komentar
      </Space>
    </span>,
    <span key="actions" style={{ marginLeft: 8 }}>
      <Dropdown
        menu={{
          items: items(),
          onClick: handleClickDropdown,
        }}
      >
        <MoreOutlined color="red" />
      </Dropdown>
    </span>,
  ];

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
        <Comment
          author={
            <Stack>
              <UserText
                text={post?.user?.username}
                userId={post?.user?.custom_id}
              />
            </Stack>
          }
          actions={actions}
          avatar={
            <>
              <AvatarUser
                src={post?.user?.image}
                userId={post?.user?.custom_id}
                user={post?.user}
              />
            </>
          }
          datetime={
            <Tooltip
              title={dayjs(post?.created_at).format("DD-MM-YYYY HH:mm:ss")}
            >
              &#x2022; {dayjs(post?.created_at).fromNow()}
            </Tooltip>
          }
          content={
            <div style={{ whiteSpace: "pre-wrap" }}>
              <ReactMarkdownCustom withCustom={false}>
                {post?.content}
              </ReactMarkdownCustom>
            </div>
          }
        />
      )}
    </>
  );
};

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
  return (
    <>
      <Row justify="end">
        <Col>
          <SocmedPostsFilter />
        </Col>
      </Row>
      <List
        size="small"
        loadMore={
          hasNextPage ? (
            <div
              style={{
                textAlign: "center",
                marginTop: 12,
                height: 32,
                lineHeight: "32px",
              }}
            >
              {isFetching ? (
                "Loading..."
              ) : (
                <Button onClick={fetchNextPage}>Load More</Button>
              )}
            </div>
          ) : null
        }
        dataSource={posts?.pages.flatMap((page) => page.data) || []}
        rowKey={(item) => item.id}
        loading={isLoading || isFetching}
        renderItem={(item) => {
          return (
            <List.Item key={item?.id} style={{ whiteSpace: "pre-wrap" }}>
              <Post post={item} currentUser={currentUser} />
            </List.Item>
          );
        }}
      />
    </>
  );
}

export default SocmedPosts;
