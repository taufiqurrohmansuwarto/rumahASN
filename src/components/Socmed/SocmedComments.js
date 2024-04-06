import { deleteComment, getComments } from "@/services/socmed.services";
import { MoreOutlined, RetweetOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Card,
  Col,
  Divider,
  Dropdown,
  List,
  Modal,
  Row,
  Tooltip,
  message,
} from "antd";
import { Comment } from "@ant-design/compatible";
import moment from "moment";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import ReactMarkdownCustom from "../MarkdownEditor/ReactMarkdownCustom";
import SocmedCreateComment from "./SocmedCreateComment";
import SocmedEditComment from "./SocmedEditComment";

const UserComment = ({ comment }) => {
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
        message.success("Comment deleted");
        queryClient.invalidateQueries(["socmed-comments"]);
      },
      onError: (error) => {
        message.error(error.message);
      },
      onSettled: () => {},
    }
  );

  const handleHapus = () => {
    Modal.confirm({
      title: "Hapus komentar?",
      content: "Komentar akan dihapus",
      okText: "Hapus",
      cancelText: "Batal",
      onOk: async () => {
        await remove({
          postId: comment?.post_id,
          commentId: comment?.id,
        });
      },
    });
  };

  const items = () => {
    if (currentUser?.user?.id !== comment?.user_id) {
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
    <span key="balas" onClick={handleAddComment}>
      <RetweetOutlined /> Balas Komentar
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
          <Avatar src={comment?.user?.image} alt={comment?.user?.username} />
        }
        content={
          <>
            {selectedEditId === comment?.id ? (
              <SocmedEditComment
                comment={comment}
                onCancel={handleCancelEdit}
                withBatal
              />
            ) : (
              <ReactMarkdownCustom>{comment?.comment}</ReactMarkdownCustom>
            )}
          </>
        }
        datetime={
          <Tooltip
            title={moment(comment?.created_at).format("DD-MM-YYYY HH:mm:ss")}
          >
            {moment(comment?.created_at).fromNow()}
          </Tooltip>
        }
        author={
          <Stack>
            <Link href={`/users/${comment?.user?.custom_id}`}>
              <a
                style={{
                  color: "green",
                }}
              >
                {comment?.user?.username}
              </a>
            </Link>
          </Stack>
        }
      >
        {selectedId === comment?.id && (
          <SocmedCreateComment
            parentId={comment?.id}
            data={comment?.user}
            withBatal
            onCancel={handleCancel}
          />
        )}
        {comment?.children?.map((item) => (
          <UserComment key={item?.id} comment={item} />
        ))}
      </Comment>
    </>
  );
};

const UserComments = ({ postId }) => {
  const { data, isLoading } = useQuery(
    ["socmed-comments", postId],
    () => getComments(postId),
    {}
  );

  return (
    <List
      loading={isLoading}
      dataSource={data}
      renderItem={(item) => (
        <>
          <UserComment comment={item} />
        </>
      )}
    />
  );
};

function SocmedComments({ post, id }) {
  return (
    <Row>
      <Col md={16}>
        <Card>
          <Comment
            content={<ReactMarkdownCustom>{post?.content}</ReactMarkdownCustom>}
            author={
              <Stack>
                <Link href={`/users/${post?.user?.custom_id}`}>
                  <a
                    style={{
                      color: "green",
                    }}
                  >
                    {post?.user?.username}
                  </a>
                </Link>
              </Stack>
            }
            avatar={<Avatar src={post?.user?.image} />}
            datetime={
              <Tooltip
                title={moment(post?.created_at).format("DD-MM-YYYY HH:mm:ss")}
              >
                {moment(post?.created_at).fromNow()}
              </Tooltip>
            }
          />
          <Divider />
          <SocmedCreateComment />
          <UserComments postId={id} />
        </Card>
      </Col>
    </Row>
  );
}

export default SocmedComments;
