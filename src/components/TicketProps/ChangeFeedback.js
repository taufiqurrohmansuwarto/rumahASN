import { changeFeedbackTicket } from "@/services/index";
import { SettingOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Divider, message, Modal, Rate, Space } from "antd";
import Typography from "antd/lib/typography/Typography";
import { useState } from "react";

const SubmitFeeback = ({ item }) => {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(item?.stars);
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
      },
    };
    updateFeedback(data);
  };

  return (
    <>
      <Modal
        confirmLoading={isLoading}
        title="Berikan Umpan Balik"
        onCancel={handleCancel}
        onOk={handleSubmit}
        open={open}
      >
        <Rate value={value} onChange={setValue} />
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
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          Umpan Balik
        </Typography.Text>
        <SubmitFeeback item={item} />
        <Rate value={item?.stars} disabled />
      </Space>
      <Divider />
    </>
  );
}

export default ChangeFeedback;
