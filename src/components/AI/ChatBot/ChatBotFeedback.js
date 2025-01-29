import { getFeedback, sendFeedback } from "@/services/assistant-ai.services";
import {
  CommentOutlined,
  FrownOutlined,
  MehOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  Modal,
  Rate,
  Space,
  Typography,
  message,
} from "antd";
import { useState, useEffect } from "react";

const ModalFeedback = ({
  open,
  onClose,
  data,
  isLoading,
  isLoadingFeedback,
  sendFeedbackData,
}) => {
  const customIcons = {
    1: <FrownOutlined style={{ marginRight: 4 }} />,
    2: <FrownOutlined style={{ marginRight: 4 }} />,
    3: <MehOutlined style={{ marginRight: 4 }} />,
    4: <SmileOutlined style={{ marginRight: 4 }} />,
    5: <SmileOutlined style={{ marginRight: 4 }} />,
  };

  const [form] = Form.useForm();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        rating: data?.rating,
        feedback: data?.feedback,
      });
    }
  }, [data, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    sendFeedbackData(values);
  };

  return (
    <Modal
      onOk={handleSubmit}
      open={open}
      onCancel={onClose}
      okText="Kirim"
      cancelText="Batal"
      title="Rating Pengalaman kamu!"
      centered
      confirmLoading={isLoadingFeedback}
    >
      <Form size="middle" form={form} layout="vertical">
        <Form.Item name="rating">
          <Rate character={({ index }) => customIcons[index + 1]} />
        </Form.Item>

        <Form.Item name="feedback">
          <Input.TextArea
            placeholder="Ceritakan apa yang kamu sukai dan apa yang bisa ditingkatkan"
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function ChatBotFeedback() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["chatbot-feedback"],
    () => getFeedback(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: sendFeedbackData, isLoading: isLoadingFeedback } =
    useMutation((data) => sendFeedback(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["chatbot-feedback"]);
        message.success("Feedback berhasil dikirim");
      },
      onError: (error) => {
        message.error(error?.message);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["chatbot-feedback"]);
        setOpenModalFeedback(false);
      },
    });

  const [openModalFeedback, setOpenModalFeedback] = useState(false);

  const handleOpenModalFeedback = () => {
    setOpenModalFeedback(true);
  };

  const handleCloseModalFeedback = () => {
    setOpenModalFeedback(false);
  };

  return (
    <>
      <ModalFeedback
        open={openModalFeedback}
        onClose={handleCloseModalFeedback}
        data={data}
        isLoading={isLoading}
        isLoadingFeedback={isLoadingFeedback}
        sendFeedbackData={sendFeedbackData}
      />
      <Button
        icon={<CommentOutlined />}
        type="primary"
        onClick={handleOpenModalFeedback}
      >
        Beri Feedback
      </Button>
    </>
  );
}

export default ChatBotFeedback;
