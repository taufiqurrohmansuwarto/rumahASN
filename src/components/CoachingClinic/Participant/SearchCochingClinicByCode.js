import { SearchOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal } from "antd";
import { useState } from "react";

const ModalPencarian = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title="Cari Berdasarkan Code Mentoring"
      footer={null}
    >
      <Form form={form}>
        <Form.Item name="code" label="Kode">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary">
            Cari
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function SearchCochingClinicByCode() {
  const [open, setOpen] = useState(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <ModalPencarian open={open} onCancel={handleClose} />
      <Button onClick={handleOpen} icon={<SearchOutlined />} type="primary">
        Cari Berdasarkan Code Mentoring
      </Button>
    </>
  );
}

export default SearchCochingClinicByCode;
