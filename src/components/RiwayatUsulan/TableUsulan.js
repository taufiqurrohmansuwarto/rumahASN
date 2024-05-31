import { artiStatus } from "@/utils/client-utils";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { Table, Tooltip } from "antd";

function TableUsulan({ data, isLoading }) {
  const columns = [
    {
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (row) => {
        return (
          <Stack>
            <div>Nama: {row?.nama}</div>
            <div>NIP: {row?.nip}</div>
            <div>Jenis Layanan: {row?.jenis_layanan_nama}</div>
            <div>Status Usulan: {row?.status_usulan}</div>
            <div>Tanggal Usulan: {row?.tanggal_usulan}</div>
            <div>Keterangan: {row?.keterangan}</div>
          </Stack>
        );
      },
    },
    { title: "Nama", dataIndex: "nama", responsive: ["sm"] },
    { title: "NIP", dataIndex: "nip", responsive: ["sm"] },
    {
      title: "Jenis Layanan",
      dataIndex: "jenis_layanan_nama",
      responsive: ["sm"],
    },
    {
      title: "Status Usulan",
      responsive: ["sm"],
      key: "status_usulan",
      render: (row) => (
        <>
          {row?.status_usulan}
          <Tooltip title={artiStatus(row?.status_usulan)}>
            <QuestionCircleOutlined
              style={{ marginLeft: 5, color: "blue", cursor: "pointer" }}
            />
          </Tooltip>
        </>
      ),
    },
    // { title: "Tipe", dataIndex: "type" },
    {
      title: "Tanggal Usulan",
      dataIndex: "tanggal_usulan",
      responsive: ["sm"],
    },
    { title: "Keterangan", dataIndex: "keterangan", responsive: ["sm"] },
  ];

  return (
    <Table
      style={{ width: "100%" }}
      rowKey={(row) => row?.id}
      pagination={false}
      columns={columns}
      dataSource={data}
      loading={isLoading}
    />
  );
}

export default TableUsulan;
