import { parseMarkdown, uploadFiles } from "@/services/index";
import {
  deletePost,
  getPosts,
  likePost,
  updatePost,
} from "@/services/socmed.services";
import { CommentOutlined, LikeOutlined, MoreOutlined } from "@ant-design/icons";
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
  Comment,
  Dropdown,
  List,
  Modal,
  Row,
  Space,
  Tooltip,
  message,
} from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import SocmedPostsFilter from "./SocmedPostsFilter";

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
        message.success("berhasil");
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
    <span key="likes" onClick={handleLike}>
      <Space>
        <LikeOutlined
          style={{
            color: post?.likes?.length > 0 ? "green" : null,
          }}
        />
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
              <span>{post?.user?.username}</span>
            </Stack>
          }
          actions={actions}
          avatar={<Avatar src={post?.user?.image} />}
          datetime={
            <Tooltip
              title={moment(post?.created_at).format("DD-MM-YYYY HH:mm:ss")}
            >
              {moment(post?.created_at).fromNow()}
            </Tooltip>
          }
          content={<div dangerouslySetInnerHTML={{ __html: post?.html }} />}
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
    ({ pageParam = 1 }) => getPosts({ ...router?.query, page: pageParam }),
    {
      getNextPageParam: (lastPage) => {
        const defaultLimit = 10;
        const nextPage = lastPage?.pagination?.page + 1;
        if (lastPage?.data?.length < defaultLimit) return undefined;
        return nextPage;
      },
    },
    {
      keepPreviousData: true,
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
          return <Post currentUser={currentUser?.user} post={item} />;
        }}
      />
    </>
  );
}

export default SocmedPosts;
