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
import { Comment } from "@ant-design/compatible";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CommentOutlined,
  MoreOutlined,
  RetweetOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dropdown, List, Modal, Space, Tooltip, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import AvatarUser from "../Users/AvatarUser";
import UserText from "../Users/UserText";
import DiscussionCreateComment from "./DiscussionCreateComment";

const UserComment = ({ discussionId, comment }) => {
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
    // if there is a another selected edit id, cancel it first
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
        message.success("Comment deleted");
      },
      onError: (error) => {
        message.error(error.message);
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
        message.success("Upvoted");
      },
      onError: (error) => {
        message.error(error.message);
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
        message.success("Downvoted");
      },
      onError: (error) => {
        message.error(error.message);
      },
    }
  );

  const handleUpvote = () => {
    upvote({
      commentId: comment?.id,
      discussionId: discussionId,
    });
  };

  const handleDownvote = () => {
    downvote({
      commentId: comment?.id,
      discussionId: discussionId,
    });
  };

  const handleHapus = () => {
    Modal.confirm({
      title: "Hapus komentar?",
      content: "Komentar akan dihapus",
      okText: "Hapus",
      cancelText: "Batal",
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
        { label: "Edit", key: "edit" }, // remember to pass the key prop
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

  const actions = [
    <span key="upvote" onClick={handleUpvote}>
      <Tooltip title="Upvote">
        <ArrowUpOutlined
          style={{
            color: `
      ${comment?.votes?.[0]?.vote_type === "upvote" ? "orange" : null}`,
          }}
        />
      </Tooltip>
    </span>,
    <span key="vote">
      {parseInt(comment?.upvote_count) - parseInt(comment?.downvote_count)}
    </span>,
    <span key="downvote" onClick={handleDownvote}>
      <Tooltip title="Downvote">
        <ArrowDownOutlined
          style={{
            color: `${
              comment?.votes?.[0]?.vote_type === "downvote" ? "orange" : null
            }`,
          }}
        />
      </Tooltip>
    </span>,
    <span key="balas" onClick={handleAddComment}>
      <Tooltip title="Balas">
        <RetweetOutlined />
      </Tooltip>
    </span>,
    <span key="total_comment">
      <CommentOutlined />
    </span>,
    <span key="total_comment">{comment?.total_comment}</span>,
    <span key="actions" style={{ marginLeft: 8 }}>
      <Dropdown
        menu={{
          items: items(),
          onClick: handleDropdown,
        }}
      >
        <MoreOutlined color="red" />
      </Dropdown>
    </span>,
  ];

  return (
    <>
      <Comment
        id={comment?.id}
        actions={selectedEditId === comment?.id ? null : actions}
        avatar={
          <AvatarUser
            src={comment?.user?.image}
            userId={comment?.user?.custom_id}
          />
        }
        content={
          <>
            {selectedEditId === comment?.id ? (
              <DiscussionCreateComment
                discussionId={discussionId}
                commentId={comment?.id}
                onCancel={handleCancelEdit}
                content={comment?.content}
                action="edit"
                withBatal
              />
            ) : (
              <>
                <ReactMarkdownCustom>{comment?.content}</ReactMarkdownCustom>
              </>
            )}
          </>
        }
        datetime={
          <Tooltip
            title={dayjs(comment?.created_at).format("DD-MM-YYYY HH:mm:ss")}
          >
            <Space size="small">
              <div>&#x2022; {dayjs(comment?.created_at).fromNow()}</div>
              <div>
                {comment?.edited_at && (
                  <>&#x2022; diubah {dayjs(comment?.edited_at).fromNow()}</>
                )}
              </div>
            </Space>
          </Tooltip>
        }
        author={
          <Stack>
            <UserText
              userId={comment?.user?.custom_id}
              text={comment?.user?.username}
            />
          </Stack>
        }
      >
        {selectedId === comment?.id && (
          <>
            <DiscussionCreateComment
              discussionId={discussionId}
              parentId={comment?.id}
              data={comment?.user}
              withBatal
              onCancel={handleCancel}
            />
          </>
        )}
        {comment?.children?.map((item) => (
          <UserComment
            id={item?.id}
            discussionId={discussionId}
            key={item?.id}
            comment={item}
          />
        ))}
      </Comment>
    </>
  );
};

const UserComments = ({ discussionId, data, loading }) => {
  return (
    <>
      <List
        renderItem={(item) => (
          <UserComment discussionId={discussionId} comment={item} />
        )}
        rowKey={(row) => row?.id}
        loading={loading}
        dataSource={data}
      />
    </>
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
    <>
      <DiscussionCreateComment discussionId={id} />
      <UserComments loading={isLoading} data={data} discussionId={id} />
    </>
  );
};

export default DiscussionsComments;
