import { changeFeedbackTicket } from "@/services/index";
import { SettingOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Divider, Input, message, Modal, Rate, Space } from "antd";
import Typography from "antd/lib/typography/Typography";
import { useState } from "react";
import RestrictedContent from "../RestrictedContent";

const SubmitFeeback = ({ item }) => {
  const queryClient = useQueryClient();

  const [value, setValue] = useState(item?.stars);
  const [feedbackComment, setFeedbackComment] = useState(
    item?.requester_comment
  );

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleCancel = () => setOpen(false);

  const { mutate: updateFeedback, isLoading } = useMutation(
    (data) => changeFeedbackTicket(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["publish-ticket", item?.id]);
        message.success("Berhasil memberikan umpan balik");
        setOpen(false);
      },
      onError: () => {
        message.error("Gagal memberikan umpan balik");
        setOpen(false);
      },
    }
  );

  const handleSubmit = () => {
    const data = {
      id: item?.id,
      data: {
        stars: value,
        requester_comment: feedbackComment,
      },
    };

    if (!value) {
      message.error("Harap memberikan rating terlebih dahulu");
      return;
    } else {
      updateFeedback(data);
    }
  };

  return (
    <>
      <Modal
        centered
        confirmLoading={isLoading}
        title="Berikan Umpan Balik"
        onCancel={handleCancel}
        onOk={handleSubmit}
        open={open}
      >
        <Stack>
          <Alert
            type="info"
            showIcon
            description="Terima kasih telah mencoba layanan kami! Kami menghargai pendapat Anda - beri tahu kami bagaimana kami bisa lebih baik dengan memberikan rating dan feedback. Terima kasih!"
          />
          <Rate value={value} onChange={setValue} />
          <Input.TextArea
            value={feedbackComment}
            placeholder="Berikan Tanggapanmu..."
            onChange={(e) => setFeedbackComment(e.target.value)}
            rows={6}
          />
        </Stack>
      </Modal>
      <SettingOutlined
        onClick={handleOpen}
        style={{
          cursor: "pointer",
          color: "#1890ff",
        }}
      />
    </>
  );
};

function ChangeFeedback({ item }) {
  return (
    <>
      <Space direction="vertical">
        <Space>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Umpan Balik
          </Typography.Text>
          <RestrictedContent
            name="submit-feedback"
            attributes={{ ticket: item }}
          >
            <SubmitFeeback item={item} />
          </RestrictedContent>
        </Space>
        <Rate value={item?.stars} disabled />
      </Space>
      <Divider />
    </>
  );
}

export default ChangeFeedback;
