import {
  createEventExhibitors,
  deleteEventExhibitors,
  eventExhibitors,
  updateEventExhibitors,
} from "@/services/events.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Button,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  message,
} from "antd";
import { useEffect, useState } from "react";

const ModalExhibitors = ({
  open,
  onClose,
  title = "Tambah Peserta Pameran",
  onOk,
  loading,
  initialValues,
  eventId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let payload = {
        eventId: eventId,
        data: values,
      };

      if (initialValues) {
        payload.id = initialValues.id;
      }

      onOk(payload);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      confirmLoading={loading}
      onOk={handleOk}
      open={open}
      onCancel={onClose}
      title={title}
      centered
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="exhibitor_name" label="Nama Peserta Pameran">
          <Input />
        </Form.Item>
        <Form.Item name="exhibitor_description" label="Deskripsi">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function EventExhibitors() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);

  const handleShowModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  const handleShowModalEdit = (row) => {
    setSelectedRow(row);
    setOpenEdit(true);
  };

  const handleCloseModalEdit = () => {
    setSelectedRow(null);
    setOpenEdit(false);
  };

  // create
  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createEventExhibitors(data),
    {
      onSuccess: () => {
        message.success("Berhasil menambahkan peserta pameran");
        handleCloseModal();
      },
      onError: () => {
        message.error("Gagal menambahkan peserta pameran");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "event-exhibitors",
          router.query.eventId,
        ]);
      },
    }
  );

  // update
  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateEventExhibitors(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah peserta pameran");
        handleCloseModalEdit();
      },
      onError: () => {
        message.error("Gagal mengubah peserta pameran");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "event-exhibitors",
          router.query.eventId,
        ]);
      },
    }
  );

  // delete
  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => deleteEventExhibitors(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus peserta pameran");
      },
      onError: () => {
        message.error("Gagal menghapus peserta pameran");
      },
      onSettled: () => {
        queryClient.invalidateQueries([
          "event-exhibitors",
          router.query.eventId,
        ]);
      },
    }
  );

  const { eventId } = router.query;
  const { data, isLoading } = useQuery(
    ["event-exhibitors", eventId],
    () => eventExhibitors(eventId),
    {
      enabled: !!eventId,
    }
  );

  const handleRemove = async (id) => {
    await remove({ eventId, id });
  };

  const columns = [
    {
      title: "Nama Peserta Pameran",
      dataIndex: "exhibitor_name",
    },
    {
      title: "Logo",
      dataIndex: "exhibitor_logo",
    },
    {
      title: "Deskripsi",
      dataIndex: "exhibitor_description",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => (
        <Space>
          <a onClick={() => handleShowModalEdit(row)}>Edit</a>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin?"
            onConfirm={async () => await handleRemove(row.id)}
          >
            Hapus
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <ModalExhibitors
        onOk={update}
        loading={isLoadingUpdate}
        open={openEdit}
        onClose={handleCloseModalEdit}
        title="Edit Peserta Pameran"
        eventId={eventId}
        initialValues={selectedRow}
      />

      <ModalExhibitors
        onOk={create}
        loading={isLoadingCreate}
        open={open}
        onClose={handleCloseModal}
        eventId={eventId}
      />
      <Button onClick={handleShowModal}>Tambah</Button>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
      />
    </div>
  );
}

export default EventExhibitors;
