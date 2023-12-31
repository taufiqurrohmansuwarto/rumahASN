import { createComment } from "@/services/socmed.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Comment, Form, Input, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const SocmedCreateComment = ({ parentId, withBatal = false, onCancel }) => {
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

export default SocmedCreateComment;
