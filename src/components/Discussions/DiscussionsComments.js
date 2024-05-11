import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import {
  deleteComment,
  downvoteComment,
  getComments,
  updateComment,
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
import { Stack, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, message, Dropdown, List, Tooltip, Modal } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import DiscussionCreateComment from "./DiscussionCreateComment";
import AvatarUser from "../Users/AvatarUser";

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
    setSelectedEditId(comment?.id);
  };

  const handleCancelEdit = () => {
    setSelectedEditId(null);
  };

  const { mutateAsync: edit, isLoading: isLoadingEdit } = useMutation(
    (data) => updateComment(data),
    {}
  );

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
    if (currentUser?.user?.id !== comment?.user?.custom_id) {
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
      <ArrowUpOutlined
        style={{
          color: `
      ${comment?.votes?.[0]?.vote_type === "upvote" ? "orange" : null}`,
        }}
      />
    </span>,
    <span key="vote">
      {parseInt(comment?.upvote_count) - parseInt(comment?.downvote_count)}
    </span>,
    <span
      key="downvote"
      onClick={handleDownvote}
      style={{
        color: `${
          comment?.votes?.[0]?.vote_type === "downvote" ? "orange" : null
        }`,
      }}
    >
      <ArrowDownOutlined />
    </span>,
    <span key="balas" onClick={handleAddComment}>
      <RetweetOutlined /> Balas
    </span>,
    <span key="total_comment">
      <CommentOutlined /> {comment?.total_comment} Komentar
    </span>,
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
        actions={selectedEditId === comment?.id ? null : actions}
        avatar={
          <AvatarUser
            src={comment?.user?.image}
            userId={comment?.user?.custom_id}
          />
        }
        content={
          <>
            <ReactMarkdownCustom>{comment?.content}</ReactMarkdownCustom>
          </>
        }
        datetime={
          <Tooltip
            title={dayjs(comment?.created_at).format("DD-MM-YYYY HH:mm:ss")}
          >
            &#x2022; {dayjs(comment?.created_at).fromNow()}
          </Tooltip>
        }
        author={
          <Stack>
            <Text>
              {comment?.user?.username}
              {/* dot html */}
            </Text>
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
            discussionId={discussionId}
            key={item?.id}
            comment={item}
          />
        ))}
      </Comment>
    </>
  );
};

const UserComments = ({ discussionId }) => {
  const { data, isLoading } = useQuery(
    ["asn-discussions-comment", discussionId],
    () => getComments(discussionId)
  );

  return (
    <>
      <List
        renderItem={(item) => (
          <UserComment discussionId={discussionId} comment={item} />
        )}
        rowKey={(row) => row?.id}
        loading={isLoading}
        dataSource={data}
      />
    </>
  );
};

const DiscussionsComments = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <DiscussionCreateComment discussionId={id} />
      <UserComments discussionId={id} />
    </>
  );
};

export default DiscussionsComments;
