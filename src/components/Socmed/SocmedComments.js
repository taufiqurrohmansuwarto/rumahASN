import {
  createComment,
  deleteComment,
  getComments,
  getPost,
  updateComment,
} from "@/services/socmed.services";
import { MoreOutlined, RetweetOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Col,
  Comment,
  Divider,
  Dropdown,
  Form,
  Input,
  List,
  Modal,
  Row,
  message,
} from "antd";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const CreateComment = ({ parentId, withBatal = false, onCancel }) => {
  const { data: currentUser } = useSession();
  const router = useRouter();
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: create, isLoading } = useMutation(
    (data) => createComment(data),
    {
      onSuccess: () => {
        form.resetFields();
        message.success("Comment posted");
        queryClient.invalidateQueries(["socmed-comments", router.query.id]);
        if (withBatal) onCancel();
      },
      onError: (error) => {
        message.error(error.message);
      },
      onSettled: () => {},
    }
  );

  const handleFinish = (values) => {
    if (!values.comment) return;
    const data = {
      postId: router.query.id,
      data: {
        ...values,
        parent_id: parentId || null,
      },
    };

    create(data);
  };

  return (
    <Comment
      avatar={
        <Avatar src={currentUser?.user?.image} alt={currentUser?.user?.name} />
      }
      content={
        <Form form={form} onFinish={handleFinish}>
          <Form.Item name="comment">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              loading={isLoading}
              disabled={isLoading}
              htmlType="submit"
            >
              Post Komentar
            </Button>
            {withBatal && (
              <Button style={{ marginLeft: 8 }} onClick={onCancel}>
                Batal
              </Button>
            )}
          </Form.Item>
        </Form>
      }
    />
  );
};

const UserComment = ({ comment }) => {
  const [selectedId, setSelectedId] = useState(null);
  const { data: currentUser } = useSession();
  const queryClient = useQueryClient();

  const handleAddComment = () => {
    setSelectedId(comment?.id);
  };

  const handleCancel = () => {
    setSelectedId(null);
  };

  const { mutate: edit, isLoading: isLoadingEdit } = useMutation(
    (data) => updateComment(data),
    {
      onSuccess: () => {
        message.success("Comment updated");
      },
      onError: (error) => {
        message.error(error.message);
      },
      onSettled: () => {},
    }
  );

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
    <Comment
      actions={actions}
      avatar={
        <Avatar src={comment?.user?.image} alt={comment?.user?.username} />
      }
      content={comment?.comment}
      datetime={moment(comment?.created_at).fromNow()}
      author={comment?.user?.username}
    >
      {selectedId === comment?.id && (
        <CreateComment
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
      renderItem={(item) => <UserComment comment={item} />}
    />
  );
};

function SocmedComments() {
  const router = useRouter();
  const { id } = router.query;

  const { data: post, isLoading } = useQuery(
    ["socmed-posts", id],
    () => getPost(id),
    {}
  );

  return (
    <Row>
      <Col md={16}>
        <Comment
          content={post?.content}
          author={post?.user?.username}
          avatar={<Avatar src={post?.user?.image} />}
          datetime={post?.created_at}
        />
        <Divider />
        <CreateComment />
        <UserComments postId={id} />
      </Col>
    </Row>
  );
}

export default SocmedComments;
