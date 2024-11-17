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
  message,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useEffect, useState } from "react";
dayjs.locale("id");

const FormUpdate = ({
  id,
  open,
  handleClose,
  update,
  isLoadingUpdate,
  data,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      day: data?.day,
      date: [
        dayjs(data?.registration_open_at),
        dayjs(data?.registration_close_at),
      ],
    });
  }, [data, form]);

  const handleFinish = async () => {
    const {
      date: [open, close],
    } = await form.validateFields();

    const currentData = {
      registration_open_at: dayjs(open).format("YYYY-MM-DD HH:mm:ss"),
      registration_close_at: dayjs(close).format("YYYY-MM-DD HH:mm:ss"),
      day: form.getFieldValue("day"),
    };

    const payload = {
      id,
      absenceId: data?.id,
      data: currentData,
    };

    await update(payload);
    message.success("Berhasil mengupdate data");
    handleClose();
  };

  return (
    <Modal
      confirmLoading={isLoadingUpdate}
      onOk={handleFinish}
      title="Edit Daftar Hadir Webinar Series"
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

const TableAbseceEntries = ({
  data,
  id,
  update,
  isLoadingUpdate,
  remove,
  download,
  isLoadingDownload,
  isLoadingRemove,
}) => {
  const [open, setOpen] = useState(false);
  const [dataUpdate, setDataUpdate] = useState({});

  const handleOpenUpdate = (data) => {
    setOpen(true);
    setDataUpdate(data);
  };

  const handleCloseUpdate = () => {
    setOpen(false);
    setDataUpdate({});
  };

  const handleHapus = async (absenceId) => {
    try {
      const payload = {
        id,
        absenceId,
      };

      await remove(payload);
      message.success("Berhasil menghapus data");
    } catch (error) {
      message.error("Gagal menghapus data");
    }
  };

  const handleDownload = async (absenceId) => {
    try {
      const data = await download({ id, absenceId });
      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "file.xlsx";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      title: "Hari ke-",
      dataIndex: "day",
    },
    {
      title: "Mulai Presensi",
      key: "registration_open_at",
      render: (text) =>
        dayjs(text.registration_open_at).format("DD MMMM YYYY HH:mm:ss"),
    },
    {
      title: "Selesai Presensi",
      key: "registration_close_at",
      render: (text) =>
        dayjs(text.registration_close_at).format("DD MMMM YYYY HH:mm:ss"),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <a onClick={() => handleOpenUpdate(record)}>Edit</a>
          <Divider type="vertical" />
          <Popconfirm
            onConfirm={async () => await handleHapus(text?.id)}
            title="Apakah anda yakin ingin menghapus data?. Ingat apabila menghapus data presensi maka semua yang terkait dengan data tersebut akan terhapus"
          >
            Hapus
          </Popconfirm>
          <Divider type="vertical" />
          <a onClick={async () => await handleDownload(text?.id)}>Unduh</a>
        </Space>
      ),
    },
  ];

  return (
    <>
      <FormUpdate
        id={id}
        data={dataUpdate}
        handleClose={handleCloseUpdate}
        open={open}
        isLoadingUpdate={isLoadingUpdate}
        update={update}
      />
      <Table
        columns={columns}
        dataSource={data}
        rowKey={(row) => row?.id}
        pagination={false}
      />
    </>
  );
};

const FormCreate = ({ id, open, handleClose, create, isLoadingCreate }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const {
      date: [open, close],
    } = await form.validateFields();

    const data = {
      registration_open_at: dayjs(open).format("YYYY-MM-DD HH:mm:ss"),
      registration_close_at: dayjs(close).format("YYYY-MM-DD HH:mm:ss"),
      day: form.getFieldValue("day"),
    };

    const payload = {
      id,
      data,
    };

    await create(payload);
    message.success("Berhasil menambahkan data");
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
  download,
  isLoadingDownload,
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
      <Button
        style={{
          marginBottom: 16,
        }}
        onClick={handleOpen}
        type="primary"
        icon={<FileAddOutlined />}
      >
        Daftar Hadir{" "}
      </Button>
      <TableAbseceEntries
        id={id}
        update={update}
        isLoadingUpdate={isLoadingUpdate}
        remove={remove}
        isLoadingRemove={isLoadingRemove}
        data={data}
        download={download}
        isLoadingDownload={isLoadingDownload}
      />
    </Card>
  );
}

export default AbsenceEtries;
