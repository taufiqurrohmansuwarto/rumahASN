import {
  createComment,
  getPost,
  getComments,
} from "@/services/socmed.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Comment, Divider, Form, Button, Input, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const CreateComment = ({ data }) => {
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
      },
    };

    create(data);
  };

  return (
    <Comment
      avatar={<Avatar src={data?.user?.image} alt={data?.user?.name} />}
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
              Post
            </Button>
          </Form.Item>
        </Form>
      }
    />
  );
};

const Comments = ({ postId }) => {
  const { data, isLoading } = useQuery(
    ["socmed-comments", postId],
    () => getComments(postId),
    {}
  );

  return <div>{JSON.stringify(data)}</div>;
};

function SocmedComments() {
  const router = useRouter();
  const { id } = router.query;
  const { data: currentUser, status } = useSession();

  const { data: post, isLoading } = useQuery(
    ["socmed-posts", id],
    () => getPost(id),
    {}
  );

  return (
    <>
      <Comment
        content={post?.content}
        author={post?.user?.username}
        avatar={<Avatar src={post?.user?.image} />}
        datetime={post?.created_at}
      />
      <Divider />
      <CreateComment data={currentUser} />
      <Comments postId={id} />
    </>
  );
}

export default SocmedComments;
