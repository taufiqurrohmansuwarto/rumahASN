import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import { createComment, getComments } from "../../services";

const CreateComments = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { mutate: create } = useMutation((data) => createComment(data), {});

  const handleCreate = async (values) => {
    try {
      console.log(values);
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
          <Button htmlType="submit">Submit</Button>
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
