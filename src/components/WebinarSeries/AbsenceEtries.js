import { FileAddOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
} from "antd";
import React, { useState } from "react";
import moment from "moment";

const TableAbseceEntries = ({
  data,
  id,
  update,
  isLoadingUpdate,
  remove,
  isLoadingRemove,
}) => {
  const columns = [
    {
      title: "Hari ke-",
      dataIndex: "day",
    },
    {
      title: "Mulai Presensi",
      dataIndex: "registration_open_at",
    },
    {
      title: "Selesai Presensi",
      dataIndex: "registration_close_at",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <a>Edit</a>
          <Divider type="vertical" />
          <Popconfirm title="Apakah anda yakin ingin menghapus data?">
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(row) => row?.id}
      pagination={false}
    />
  );
};

const FormCreate = ({ id, open, handleClose, create, isLoadingCreate }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const {
      date: [open, close],
    } = await form.validateFields();

    const data = {
      registration_open_at: moment(open).format("YYYY-MM-DD HH:mm:ss"),
      registration_close_at: moment(close).format("YYYY-MM-DD HH:mm:ss"),
      day: form.getFieldValue("day"),
    };

    const payload = {
      id,
      data,
    };

    await create(payload);
    handleClose();
  };

  return (
    <Modal
      confirmLoading={isLoadingCreate}
      onOk={handleFinish}
      title="Tambah Daftar Hadir Webinar Series"
      open={open}
      onCancel={handleClose}
      centered
    >
      <Form form={form} layout="vertical">
        <Form.Item name="day" label="Hari ke-">
          <InputNumber />
        </Form.Item>
        <Form.Item name="date" label="Waktu Presensi">
          <DatePicker.RangePicker showTime />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function AbsenceEtries({
  data,
  create,
  isLoadingCreate,
  update,
  isLoadingUpdate,
  remove,
  isLoadingRemove,
  id,
}) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Card>
      <FormCreate
        open={open}
        create={create}
        isLoadingCreate={isLoadingCreate}
        id={id}
        handleClose={handleClose}
      />
      <Button onClick={handleOpen} type="primary" icon={<FileAddOutlined />}>
        Daftar Hadir{" "}
      </Button>
      <TableAbseceEntries
        id={id}
        update={update}
        isLoadingUpdate={isLoadingUpdate}
        remove={remove}
        isLoadingRemove={isLoadingRemove}
        data={data}
      />
    </Card>
  );
}

export default AbsenceEtries;
