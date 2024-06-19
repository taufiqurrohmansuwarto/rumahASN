import { SearchOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useState } from "react";

const SearchModal = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      width={500}
      title="Cari Berdasarkan Code"
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form form={form} onFinish={null}>
        <Form.Item help="Ketik kode webinar kemudian ">
          <Input placeholder="Masukkan Kode Webinar" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function SearchWebinarByCode() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <SearchModal open={open} onCancel={handleClose} />
      <Button
        style={{
          marginBottom: 16,
        }}
        type="primary"
        onClick={handleOpen}
        icon={<SearchOutlined />}
      >
        Cari Berdasarkan Kode
      </Button>
    </>
  );
}

export default SearchWebinarByCode;
