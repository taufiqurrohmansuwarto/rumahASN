import { eventMaps } from "@/services/events.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Form, Modal, Table } from "antd";
import { useRouter } from "next/router";
import React from "react";

const FormModalEventMap = ({ open, onCancel, onOk }) => {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Tambah Lokasi Kegiatan"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
    >
      <div>Hello world</div>
    </Modal>
  );
};

function EventMaps() {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { data, isLoading } = useQuery(
    ["event-maps", router.query.id],
    () => eventMaps(router.query.id),
    {}
  );

  const columns = [{}];

  return (
    <>
      <iframe
        width="600"
        height="450"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2689.5047633076667!2d-122.33382808436944!3d47.59515177918459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54906aa3b9f1182b%3A0xa636cd513bba22dc!2sLumen%20Field!5e0!3m2!1sen!2sus!4v1644079999999!5m2!1sen!2sus"
      ></iframe>
      <FormModalEventMap
        open={open}
        onCancel={handleClose}
        onOk={handleClose}
      />
      <Button onClick={handleOpen}>Tambah Lokasi Kegiatan</Button>
      <Table rowKey={(row) => row?.id} dataSource={data} loading={isLoading} />
    </>
  );
}

export default EventMaps;
