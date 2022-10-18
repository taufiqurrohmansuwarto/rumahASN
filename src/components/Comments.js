import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Comment, Form, Input, message } from "antd";
import { createComment, getComments } from "../../services";
import { useSession } from "next-auth/react";

const CreateComments = ({ user }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { mutate: create, isLoading } = useMutation(
    (data) => createComment(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["comments"]);
      },
      onSuccess: () => {
        message.success("Berhasil membuat komentar");
        form.resetFields();
      },
      onError: () => {
        message.error("Gagal membuat komentar");
      },
    }
  );

  const handleCreate = async (values) => {
    try {
      create(values);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>Create Comments</h1>

      <Comment
        avatar={user?.image}
        author={user?.name}
        content={
          <Form onFinish={handleCreate} form={form}>
            <Form.Item name="comment">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
              <Button
                disabled={isLoading}
                type="primary"
                loading={isLoading}
                htmlType="submit"
              >
                Tambahkan Komentar
              </Button>
            </Form.Item>
          </Form>
        }
      />
    </div>
  );
};

const Comments = () => {
  const { data, isLoading } = useQuery(["comments"], () => getComments());
  const { data: userData } = useSession();
  return (
    <Card>
      <CreateComments user={userData?.user} />
      {JSON.stringify(data)}
    </Card>
  );
};

export default Comments;
