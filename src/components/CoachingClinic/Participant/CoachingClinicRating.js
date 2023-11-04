import { giveRatingMeeting } from "@/services/coaching-clinics.services";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Rate } from "antd";
import React, { useState } from "react";

const ModalRating = ({ open, onCancel, handleRate, loading }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const payload = await form.validateFields();
    const data = {
      ...payload,
      meeting_id: open?.id,
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

function CoachingClinicRating() {
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
        handleRate={giveRate}
        loading={isLoadingGiveRate}
        open={open}
        onCancel={handleClose}
      />
      <Button onClick={handleOpen}>
        Tambahkan Rating untuk Coaching Clinic
      </Button>
    </div>
  );
}

export default CoachingClinicRating;
