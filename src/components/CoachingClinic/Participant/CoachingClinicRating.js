import {
  getRatingParticipant,
  giveRatingMeeting,
} from "@/services/coaching-clinics.services";
import { Rating } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Rate, Skeleton, message } from "antd";
import { useRouter } from "next/router";
import React, { useState } from "react";

const ModalRating = ({ open, onCancel, handleRate, loading, meetingId }) => {
  const router = useRouter();

  const [form] = Form.useForm();

  const handleFinish = async () => {
    const value = await form.validateFields();
    const payload = {
      id: router?.query?.id,
      data: {
        stars: value.rating,
        comment: value.comment,
      },
    };
    handleRate(payload);
  };

  return (
    <Modal
      title="Rating Coaching Clinic"
      open={open}
      centered
      onCancel={onCancel}
      confirmLoading={loading}
      onOk={handleFinish}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="rating" label="Rating">
          <Rate />
        </Form.Item>
        <Form.Item name="comment" label="Komentar">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CoachingClinicRating({ meetingId }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["ratingParticipant"],
    () => getRatingParticipant(meetingId),
    {}
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { mutate: giveRate, isLoading: isLoadingGiveRate } = useMutation(
    (data) => giveRatingMeeting(data),
    {
      onSuccess: () => {
        message.success("Berhasil memberikan rating");
        queryClient.invalidateQueries(["ratingParticipant"]);
        handleClose();
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  return (
    <Skeleton loading={isLoading}>
      {data ? (
        <Rating readOnly value={parseInt(data?.stars)} />
      ) : (
        <>
          <ModalRating
            meetingId={meetingId}
            handleRate={giveRate}
            loading={isLoadingGiveRate}
            open={open}
            onCancel={handleClose}
          />
          <Button type="primary" onClick={handleOpen}>
            Beri Rating
          </Button>
        </>
      )}
    </Skeleton>
  );
}

export default CoachingClinicRating;
