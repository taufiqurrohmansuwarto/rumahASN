import FormUnorFasilitator from "@/components/Perencanaan/FormUnorFasilitator";
import { Button, Form, Modal } from "antd";
import { useState } from "react";
import FormSiasnPendidikan from "./FormSiasnPendidikan";
import FormSimasterJFU from "./FormSimasterJFU";
import { useQuery } from "@tanstack/react-query";
import { Table, Tag } from "antd";
import { findUsulanByUser } from "@/services/perencanaan.services";
import { useRouter } from "next/router";
import dayjs from "dayjs";

const ModalUsulanFormasi = ({ open, onClose }) => {
  const [form] = Form.useForm();

  return (
    <Modal open={open} onCancel={onClose} title="Tambah Usulan Formasi">
      <Form layout="vertical" form={form}>
        <FormUnorFasilitator />
        <FormSimasterJFU />
        <FormSiasnPendidikan />
      </Form>
    </Modal>
  );
};

function UsulanFormasiFasilitator() {
  const { data, isLoading } = useQuery(
    ["perencanaan-usulan-formasi"],
    () => findUsulanByUser(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const router = useRouter();

  const handleDetail = (record) => {
    router.push(
      `/fasilitator-employees/perencanaan/usulan-formasi/${record?.id}/detail`
    );
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Judul",
      dataIndex: "judul",
    },
    {
      title: "Deskripsi",
      dataIndex: "deskripsi",
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
    {
      title: "Dibuat oleh",
      key: "user_id",
      render: (_, record) => record?.user?.username,
    },
    {
      title: "Dibuat pada",
      key: "created_at",
      render: (_, record) =>
        dayjs(record.created_at).format("DD MMM YYYY HH:mm:ss"),
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => {
        return (
          <>
            {row?.is_active ? (
              <Tag color="green">Aktif</Tag>
            ) : (
              <Tag color="red">Tidak Aktif</Tag>
            )}
          </>
        );
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => <a onClick={() => handleDetail(record)}>Detail</a>,
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={false}
        rowKey={(row) => row?.id}
      />
      {/* <Button onClick={handleOpen}>Tambah Usulan Formasi</Button> */}
      {/* <ModalUsulanFormasi open={open} onClose={handleClose} /> */}
    </div>
  );
}

export default UsulanFormasiFasilitator;
