import InformasiNetralitas from "@/components/LaporNetralitas/InformasiNetralitas";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { getNetralitasASN } from "@/services/netralitas.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Modal, Table } from "antd";
import { useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

const ModalLaporan = ({ open, onCancel, data }) => {
  return (
    <Modal
      okButtonProps={{ style: { display: "none" } }}
      title="Laporan Netralitas ASN"
      bodyStyle={{ overflowY: "auto", maxHeight: "calc(100vh - 500px)" }}
      centered
      open={open}
      onCancel={onCancel}
      width={800}
    >
      <InformasiNetralitas data={data} />
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
        return <>{dayjs(row.created_at).format("DD MMMM YYYY")}</>;
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
    <PageContainer
      title="Daftar Laporan Netralitas"
      content="Laporan Netralitas ASN"
    >
      <ModalLaporan
        open={open}
        onCancel={handleCloseModal}
        data={currentData}
      />
      <Card>
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
      </Card>
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
