import { giveRatingMeeting } from "@/services/coaching-clinics.services";
import { useMutation } from "@tanstack/react-query";
import { Button, Form, Modal } from "antd";
import React, { useState } from "react";

const ModalRating = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  return <Modal title="Give Rating" open={open} onCancel={onCancel}></Modal>;
};

function AddRating() {
  const [open, setOpen] = useState(false);
  const { mutate: giveRate, isLoading: isLoadingGiveRate } = useMutation(
    (data) => giveRatingMeeting(data),
    {}
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <ModalRating open={open} onCancel={handleClose} />
      <Button onClick={handleOpen}>
        Tambahkan Rating untuk Coaching Clinic
      </Button>
    </div>
  );
}

export default AddRating;
