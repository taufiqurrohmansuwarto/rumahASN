import { createPost } from "@/services/socmed.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, Col, Comment, Form, Input, Row } from "antd";
import { useSession } from "next-auth/react";
import React from "react";

function SocmedCreatePost() {
  const { data, status } = useSession();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const { mutate: create, isLoading } = useMutation(
    (data) => createPost(data),
    {
      onSuccess: () => {
        form.resetFields();
      },
      onError: (error) => {
        alert(error.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries("socmed-posts");
      },
    }
  );

  const handleFinish = (values) => {
    create(values);
  };

  return (
    <Row>
      <Col xs={24} md={18}>
        <Comment
          avatar={<Avatar src={data?.user?.image} alt={data?.user?.name} />}
          content={
            <Form form={form} onFinish={handleFinish}>
              <Form.Item name="content">
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
      </Col>
    </Row>
  );
}

export default SocmedCreatePost;
