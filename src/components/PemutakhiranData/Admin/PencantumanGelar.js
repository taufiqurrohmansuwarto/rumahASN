import {
  dataPencantumanGelar,
  dataPencantumanGelarSKByNip,
} from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Modal, Skeleton, Table } from "antd";
import { useState } from "react";

const ModalSKPencantumanGelar = ({ id, open, onCancel }) => {
  const { data, isLoading } = useQuery(
    ["sk-pencantuman-gelar", id],
    () => dataPencantumanGelarSKByNip({ nip: id, id: id }),
    {
      enabled: !!id,
    }
  );
  return (
    <Modal
      width={800}
      footer={null}
      open={open}
      onCancel={onCancel}
      title="SK Pencantuman Gelar"
    >
      <Skeleton loading={isLoading} active>
        <iframe
          src={`
		data:application/pdf;base64,${data?.data}
	`}
          width="100%"
          height="600px"
        ></iframe>
      </Skeleton>
    </Modal>
  );
};

function PencantumanGelar() {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState(null);
  const handleOpen = (id) => {
    setId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setId(null);
  };

  const { data, isLoading } = useQuery(
    ["data-pencantuman-gelar"],
    () => dataPencantumanGelar(),
    {}
  );

  const columns = [
    {
      title: "NIP",
      dataIndex: "nip",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Jenis Layanan",
      dataIndex: "jenis_layanan_nama",
    },
    {
      title: "SK",
      key: "lihat_sk",
      render: (_, row) => <a onClick={() => handleOpen(row?.id)}>Lihat</a>,
    },
  ];

  return (
    <div>
      <ModalSKPencantumanGelar id={id} open={open} onCancel={handleClose} />
      <Table
        columns={columns}
        pagination={false}
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data}
      />
    </div>
  );
}

export default PencantumanGelar;
