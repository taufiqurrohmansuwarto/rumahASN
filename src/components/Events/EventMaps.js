import {
  eventMaps,
  createEventMaps,
  updateEventMaps,
  deleteEventMaps,
} from "@/services/events.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Input,
  Button,
  Form,
  Modal,
  Table,
  message,
  Space,
  Divider,
  Popconfirm,
} from "antd";
import { useRouter } from "next/router";
import React from "react";

const FormModalEventMap = ({
  open,
  onCancel,
  onSubmit,
  isLoading,
  eventId,
  initialData,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
    }
  }, [initialData, form]);

  const checkIsUrl = (rule, value) => {
    // must be iframe url from google maps
    if (!value.includes("https://www.google.com/maps/embed?pb")) {
      return Promise.reject("URL harus dari Google Maps");
    }
    return Promise.resolve();
  };

  const normalizeIframeToUrl = (value) => {
    // the input look like this <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15825.089391358673!2d112.7214998!3d-7.4350865!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7e6aea7c2b819%3A0xa98a09f73a830fa2!2sSMA%20Negeri%201%20Sidoarjo!5e0!3m2!1sen!2sid!4v1713815180545!5m2!1sen!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    // we need to extract the src attribute
    const regex = /src="([^"]*)"/;
    const match = regex.exec(value);
    if (match) {
      return match[1];
    }
    return "";
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        data: values,
        eventId: eventId,
      };

      // if edit
      if (initialData) {
        payload.id = initialData.id;
      }

      onSubmit(payload);
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
  };

  return (
    <Modal
      confirmLoading={isLoading}
      title={initialData ? "Edit Lokasi Kegiatan" : "Tambah Lokasi Kegiatan"}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      centered
    >
      <Form layout="vertical" form={form} initialValues={initialData}>
        <Form.Item
          normalize={normalizeIframeToUrl}
          tooltip="Copy alamat dari Google Maps dan paste di sini"
          name="map_url"
          label="Lokasi URL Google Maps"
          rules={[
            {
              required: true,
              message: "Lokasi URL Google Maps harus diisi",
            },
            {
              validator: checkIsUrl,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Deskripsi">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function EventMaps() {
  const router = useRouter();
  const { eventId } = router.query;
  const queryClient = useQueryClient();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // edit
  const [edit, setEdit] = React.useState(null);
  const [openEdit, setOpenEdit] = React.useState(false);

  const handleOpenEdit = (data) => {
    setEdit(data);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setEdit(null);
    setOpenEdit(false);
  };

  const { data, isLoading } = useQuery(
    ["event-maps", eventId],
    () => eventMaps(eventId),
    {}
  );

  // create event map
  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createEventMaps(data),
    {
      onSuccess: () => {
        message.success("Berhasil menambahkan lokasi kegiatan");
        handleClose();
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menambahkan lokasi kegiatan"
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["event-maps", eventId]);
      },
    }
  );

  // update event map
  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateEventMaps(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah lokasi kegiatan");
        handleCloseEdit();
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal mengubah lokasi kegiatan"
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["event-maps", eventId]);
      },
    }
  );

  // delete event map
  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (id) => deleteEventMaps(id),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus lokasi kegiatan");
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menghapus lokasi kegiatan"
        );
      },
      onSettled: () => {
        queryClient.invalidateQueries(["event-maps", eventId]);
      },
    }
  );

  const handleRemove = async (id) => {
    await remove({ eventId, id });
  };

  const columns = [
    {
      title: "Peta Lokasi Kegiatan",
      key: "lokasi-kegiatan",
      render: (row) => {
        return (
          <iframe
            width="600"
            height="450"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={row?.map_url}
          ></iframe>
        );
      },
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
    },
    {
      title: "Aksi",
      render: (row) => (
        <Space>
          <a onClick={() => handleOpenEdit(row)}>Edit</a>
          <Divider type="vertical" />
          <Popconfirm
            title="Yakin untuk menghapus lokasi ini?"
            onConfirm={() => handleRemove(row?.id)}
          >
            Hapus
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <FormModalEventMap
        eventId={eventId}
        open={open}
        onCancel={handleClose}
        onSubmit={create}
        isLoading={isLoadingCreate}
      />
      <FormModalEventMap
        eventId={eventId}
        open={openEdit}
        onCancel={handleCloseEdit}
        onSubmit={update}
        isLoading={isLoadingUpdate}
        initialData={edit}
      />
      <Table
        title={() => (
          <Button type="primary" onClick={handleOpen}>
            Tambah Lokasi Kegiatan
          </Button>
        )}
        pagination={false}
        rowKey={(row) => row?.id}
        dataSource={data}
        loading={isLoading}
        columns={columns}
      />
    </>
  );
}

export default EventMaps;
