import { rwDiklatByNip } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Form, Modal, Table } from "antd";
import { useEffect } from "react";
import { useState } from "react";

const ModalTransfer = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();

  useEffect(() => {}, [form, data]);

  return (
    <Modal title="Transfer ke SIASN" open={open} onCancel={onCancel}>
      {JSON.stringify(data)}
      <Form form={form}>
        <Form.Item></Form.Item>
      </Form>
    </Modal>
  );
};

function CompareDataDiklatMasterByNip({ nip }) {
  const [open, setOpen] = useState(false);
  const [currentDiklat, setCurrentDiklat] = useState(null);

  const handleOpen = (data) => {
    setOpen(true);
    setCurrentDiklat(data);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentDiklat(null);
  };

  const { data, isLoading } = useQuery(
    ["rw-diklat-master-by-nip", nip],
    () => rwDiklatByNip(nip),
    {}
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <div>
            <a href={row?.file_diklat} target="_blank" rel="noreferrer">
              File
            </a>
          </div>
        );
      },
    },
    {
      title: "Nama",
      dataIndex: "nama_diklat",
    },
    {
      title: "No. Sertifikat",
      dataIndex: "no_sertifikat",
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
    {
      title: "Institusi Penyelenggara",
      dataIndex: "penyelenggara",
    },
    {
      title: "Tanggal Mulai",
      dataIndex: "tanggal_mulai",
    },

    {
      title: "Jenis",
      key: "jenis",
      render: (_, row) => <>{row?.diklat?.name}</>,
    },
    {
      title: "Jumlah Jam",
      dataIndex: "jml",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return <a onClick={() => handleOpen(row)}>Transfer</a>;
      },
    },
  ];

  return (
    <div>
      <Table
        pagination={false}
        dataSource={data}
        rowKey={(row) => row?.diklat_id}
        columns={columns}
        loading={isLoading}
      />
      <ModalTransfer open={open} onCancel={handleClose} data={currentDiklat} />
    </div>
  );
}

export default CompareDataDiklatMasterByNip;
