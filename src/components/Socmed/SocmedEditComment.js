import { updateComment } from "@/services/socmed.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Comment, Form, Input, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const SocmedEditComment = ({
  parentId,
  withBatal = false,
  onCancel,
  comment,
}) => {
  const { data: currentUser } = useSession();
  const router = useRouter();
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  useEffect(() => {
    form.setFieldsValue({
      comment: comment?.comment,
    });
  }, [comment, form]);

  const { mutate: update, isLoading } = useMutation(
    (data) => updateComment(data),
    {
      onSuccess: () => {
        form.resetFields();
        message.success("Comment Edited");
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
      commentId: comment?.id,
      data: {
        ...values,
      },
    };

    update(data);
  };

  return (
    <Comment
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
              Edit Komentar
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

export default SocmedEditComment;
