import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message } from "antd";
import { createComment, getComments } from "../../services";

const CreateComments = () => {
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
      <Form onFinish={handleCreate} form={form}>
        <Form.Item name="comment" label="Comment">
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button loading={isLoading} htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const Comments = () => {
  const { data, isLoading } = useQuery(["comments"], () => getComments());
  return (
    <div>
      <CreateComments />
      {JSON.stringify(data)}
    </div>
  );
};

export default Comments;
