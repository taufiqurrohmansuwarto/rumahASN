import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getNetralitasASN } from "@/services/netralitas.services";
import { useQuery } from "@tanstack/react-query";
import { Modal, Table } from "antd";
import { useState } from "react";
import moment from "moment";

const ModalLaporan = ({ open, onCancel, data }) => {
  return (
    <Modal
      title="Laporan Netralitas ASN"
      centered
      open={open}
      onCancel={onCancel}
    >
      {JSON.stringify(data)}
    </Modal>
  );
};

const NetralitasAsn = () => {
  const [open, setOpen] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const handleOpenModal = (record) => {
    setOpen(true);
    setCurrentData(record);
  };

  const handleCloseModal = () => {
    setOpen(false);
    setCurrentData(null);
  };

  const { data, isLoading } = useQuery(
    ["netralitas-asn"],
    () => getNetralitasASN(),
    {}
  );

  const columns = [
    {
      title: "Kode Laporan",
      dataIndex: "kode_laporan",
    },
    {
      title: "Nama Pelapor",
      dataIndex: "nama_pelapor",
    },
    {
      title: "Nama Terlapor",
      dataIndex: "nama_terlapor",
    },
    {
      title: "Tanggal Laporan",
      key: "created_at",
      render: (_, row) => {
        return <>{moment(row.created_at).format("DD MMMM YYYY")}</>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Detail",
      key: "detail",
      render: (_, row) => {
        return <a onClick={() => handleOpenModal(row)}>Detail</a>;
      },
    },
  ];

  return (
    <PageContainer>
      {JSON.stringify(data)}
      <ModalLaporan
        open={open}
        onCancel={handleCloseModal}
        data={currentData}
      />

      <Table
        columns={columns}
        pagination={{
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} data`,
        }}
        dataSource={data?.results}
        loading={isLoading}
      />
    </PageContainer>
  );
};

NetralitasAsn.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

NetralitasAsn.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default NetralitasAsn;
