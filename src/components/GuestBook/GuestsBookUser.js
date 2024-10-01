import { getUser, updateUser } from "@/services/guests-books.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Select,
  Skeleton,
  Space,
} from "antd";
import { useEffect, useState } from "react";
import GuestBookScheduleVisit from "./GuestBookScheduleVisit";

const FormUserModal = ({
  open,
  onCancel,
  onSubmit,
  loading,
  type = "create",
  data,
  dataHelper,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (type === "edit") {
      form.setFieldsValue(data);
    }
  }, [form, data, type]);

  const handleSubmit = async (data) => {
    const value = await form.validateFields();
    onSubmit(value);
  };

  const handleUseAppData = (formName, data) => {
    form.setFieldsValue({
      [formName]: data,
    });
  };

  return (
    <Modal
      width={700}
      confirmLoading={loading}
      title="Masukkan Data Diri"
      onOk={handleSubmit}
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={
            <Space>
              Nama
              <a onClick={() => handleUseAppData("name", dataHelper?.name)}>
                (Integrasi Data)
              </a>
            </Space>
          }
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="institution"
          label={
            <Space>
              Institusi
              <a
                onClick={() =>
                  handleUseAppData("institution", dataHelper?.institution)
                }
              >
                (Integrasi Data)
              </a>
            </Space>
          }
          rules={[{ required: true }]}
        >
          <Input.TextArea />
        </Form.Item>
        <Form.Item
          name="visitor_type"
          label={
            <Space>
              Jenis Pengunjung
              <a
                onClick={() =>
                  handleUseAppData("visitor_type", dataHelper?.visitor_type)
                }
              >
                (Integrasi Data)
              </a>
            </Space>
          }
          rules={[{ required: true }]}
        >
          <Select showSearch>
            <Select.Option value="PNS">PNS</Select.Option>
            <Select.Option value="PPPK">PPPK</Select.Option>
            <Select.Option value="PTTPK">PTTPK</Select.Option>
            <Select.Option value="MASYARAKAT UMUM">
              Masyarakat Umum
            </Select.Option>
            <Select.Option value="PELAJAR/MAHASISWA">
              Pelajar/Mahasiswa
            </Select.Option>
            <Select.Option value="PEGAWAI SWASTA">Pegawai Swasta</Select.Option>
            <Select.Option value="LAINNYA">Lainnya</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          rules={[{ type: "email" }, { required: true }]}
          name="email"
          label={
            <Space>
              Email
              <a onClick={() => handleUseAppData("email", dataHelper?.email)}>
                (Integrasi Data)
              </a>
            </Space>
          }
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ type: "phone" }, { required: true }]}
          name="phone"
          label={
            <Space>
              Nomor Telepon
              <a onClick={() => handleUseAppData("phone", dataHelper?.phone)}>
                (Integrasi Data)
              </a>
            </Space>
          }
        >
          <Input />
        </Form.Item>
        <Form.Item
          rules={[{ required: true }, { len: 16 }]}
          name="id_card"
          label={
            <Space>
              Nomor KTP
              <a
                onClick={() => handleUseAppData("id_card", dataHelper?.id_card)}
              >
                (Integrasi Data)
              </a>
            </Space>
          }
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const UserEmpty = ({ data }) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { mutate: edit, isLoading } = useMutation((data) => updateUser(data), {
    onSuccess: () => {
      queryClient.invalidateQueries(["guest-book-user"]);
      message.success("Berhasil mengubah data diri");
    },
    onError: (error) => {
      message.error("Gagal mengubah data diri");
    },
  });

  return (
    <Empty description="Silahkan masukkan data diri anda terlebih dahulu">
      <Button onClick={handleOpen}>Masukkan Data Diri</Button>
      <FormUserModal
        open={open}
        onCancel={handleClose}
        onSubmit={edit}
        loading={isLoading}
        type="create"
        dataHelper={data?.helper}
      />
    </Empty>
  );
};

const GuestsBookUser = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const handleOpen = (data) => {
    setCurrentData(data);
    setOpen(true);
  };

  const handleClose = () => {
    setCurrentData(null);
    setOpen(false);
  };

  const { mutate: edit, isLoading: isLoadingEdit } = useMutation(
    (data) => updateUser(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["guest-book-user"]);
        message.success("Berhasil mengubah data diri");
        handleClose();
      },
      onError: (error) => {
        message.error("Gagal mengubah data diri");
      },
    }
  );

  const { data, isLoading } = useQuery(["guest-book-user"], () => getUser(), {
    onSuccess: (data) => {
      setCurrentData(data);
    },
  });

  return (
    <>
      <FormUserModal
        open={open}
        onCancel={handleClose}
        onSubmit={edit}
        loading={isLoadingEdit}
        type="edit"
        data={data?.guest}
        dataHelper={data?.helper}
      />
      <Skeleton active loading={isLoading}>
        {data?.guest ? (
          <GuestBookScheduleVisit edit={handleOpen} />
        ) : (
          <UserEmpty data={data} />
        )}
      </Skeleton>
    </>
  );
};

export default GuestsBookUser;
