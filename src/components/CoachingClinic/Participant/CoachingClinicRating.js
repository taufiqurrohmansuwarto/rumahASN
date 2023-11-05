import { giveRatingMeeting } from "@/services/coaching-clinics.services";
import { StarOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Rate } from "antd";
import React, { useState } from "react";

const ModalRating = ({ open, onCancel, handleRate, loading, meetingId }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const payload = await form.validateFields();
    const data = {
      ...payload,
      meeting_id: meetingId,
    };

    handleRate(data);
  };

  return (
    <Modal
      title="Give Rating"
      open={open}
      onCancel={onCancel}
      confirmLoading={loading}
      onfinish={handleFinish}
    >
      <Form form={form}>
        <Form.Item name="rating" label="Rating">
          <Rate />
        </Form.Item>
        <Form.Item name="comment" label="Comment">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CoachingClinicRating({ meetingId }) {
  const [open, setOpen] = useState(false);
  const { mutate: giveRate, isLoading: isLoadingGiveRate } = useMutation(
    (data) => giveRatingMeeting(data),
    {}
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <ModalRating
        meetingId={meetingId}
        handleRate={giveRate}
        loading={isLoadingGiveRate}
        open={open}
        onCancel={handleClose}
      />
      <Button type="primary" onClick={handleOpen} icon={<StarOutlined />}>
        Rating
      </Button>
    </div>
  );
}

export default CoachingClinicRating;
