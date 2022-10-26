// this is button feedback for customers

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, message, Modal, Rate } from "antd";
import { useState } from "react";
import { sendFeedbackData } from "../../services/users.services";

const FeedbackModal = ({ id, visible, onClose }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: sendFeedback, isLoading } = useMutation(
    (data) => sendFeedbackData(data),
    {
      onSettled: () => queryClient.invalidateQueries(["tickets"]),
      onSuccess: () => {
        message.success("Berhasil mengirim feedback");
        onClose();
      },
      onError: () => message.error("Gagal mengirim feedback"),
    }
  );

  const handleFinish = async () => {
    const result = await form.validateFields();
    const data = { id, data: result };
    sendFeedback(data);
  };

  return (
    <Modal
      title="Feedback Customers"
      confirmLoading={isLoading}
      visible={visible}
      onCancel={onClose}
      onOk={handleFinish}
      okText="submit"
    >
      <Form form={form} onFinish={handleFinish}>
        <Form.Item name="stars" label="Rating">
          <Rate />
        </Form.Item>
        <Form.Item name="requester_comment" label="Komentar">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function ButtonFeedback({ id }) {
  const [visible, setVisible] = useState(false);

  const handleShowModal = () => setVisible(true);
  const handleCloseModal = () => setVisible(false);

  return (
    <div>
      <Button onClick={handleShowModal}>Add Feedback</Button>
      <FeedbackModal visible={visible} id={id} onClose={handleCloseModal} />
    </div>
  );
}

export default ButtonFeedback;
