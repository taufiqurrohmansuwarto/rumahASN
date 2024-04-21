import { createEvent } from "@/services/asn-connect-events.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, Button, message, Input, DatePicker, Modal } from "antd";
import React from "react";
import { useState } from "react";

const format = "DD-MM-YYYY HH:mm:ss";

const ModalFormEvent = ({ create, isLoading, open, onCancel }) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    const value = await form.validateFields();
    const payload = {
      title: value.title,
      description: value.description,
      start_datetime: value?.start_time[0].format("YYYY-MM-DD HH:mm:ss"),
      end_datetime: value?.start_time[1].format("YYYY-MM-DD HH:mm:ss"),
      location: value.location,
    };

    create(payload);
  };

  return (
    <Modal
      onOk={handleOk}
      confirmLoading={isLoading}
      title="Buat Kegiatan"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item required label="Nama Kegiatan" name="title">
          <Input />
        </Form.Item>
        <Form.Item required label="Deskripsi Kegiatan" name="description">
          <Input.TextArea />
        </Form.Item>
        <Form.Item required label="Tanggal Kegiatan" name="start_time">
          <DatePicker.RangePicker showTime format={format} />
        </Form.Item>
        <Form.Item required label="Lokasi Kegiatan" name="location">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function CreateEvent() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // untuk form ada title dan deskripsi
  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createEvent(data),
    {
      onSuccess: () => {
        handleClose();
        message.success("Event created successfully");
      },
      onError: (error) => {
        message.error("Failed to create event");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["events"]);
      },
    }
  );

  return (
    <>
      <Button type="primary" onClick={handleOpen}>
        Create Event
      </Button>
      <ModalFormEvent
        create={create}
        isLoading={isLoadingCreate}
        open={open}
        onCancel={handleClose}
      />
    </>
  );
}

export default CreateEvent;
