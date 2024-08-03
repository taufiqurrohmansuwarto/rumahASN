import { compareEmployeesSimasterSiasn } from "@/services/master.services";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Space, Table, Tooltip, Typography } from "antd";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

const GrafikFasilitatorKomparasi = ({ data }) => {
  const router = useRouter();

  const gotoDetailEmployee = (nip) => {
    const url = `/apps-managements/integrasi/siasn/${nip}`;
    router.push(url);
  };

  const detailColumns = [
    {
      title: "NIP",
      dataIndex: "nip_master",
    },
    {
      title: "Nama",
      dataIndex: "nama_master",
    },
    {
      title: "Aksi",
      key: "detail",
      render: (_, row) => (
        <a onClick={() => gotoDetailEmployee(row.nip_master)}>Detail</a>
      ),
    },
  ];

  const columns = [
    {
      title: "Jenis",
      key: "type",
      render: (_, row) => {
        return (
          <Space>
            <span>{row.type}</span>
            <Tooltip title={row?.description} color="pink">
              <QuestionCircleOutlined style={{ cursor: "pointer" }} />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: "Jumlah",
      dataIndex: "value",
    },
    // {
    //   title: "Presentase",
    //   dataIndex: "presentase",
    // },
    // {
    //   title: "Detail",
    //   dataIndex: "detail",
    //   render: (_, record) => {
    //     return <a onClick={() => handleClick(record)}>Detail</a>;
    //   },
    // },
  ];

  const downloadData = (type, data) => {
    const hasil = data?.map((d) => ({
      nama: d.nama_master,
      nip: d.nip_master,
    }));
    const ws = XLSX.utils.json_to_sheet(hasil);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, "data.xlsx");
  };

  return (
    <Card title="Daftar Anomali SIASN dan SIMASTER">
      <Stack>
        <Alert title="Perhatian" color="indigo">
          Data akan diupdate setiap hari oleh BKD Provinsi Jawa Timur dan tidak
          realtime. Perbaikan data bisa jadi tidak langsung terlihat.
        </Alert>
        <Table
          rowKey={(record) => record.type}
          expandable={{
            expandedRowRender: (record) => (
              <Card
                extra={
                  <a onClick={() => downloadData(record?.type, record?.detail)}>
                    Unduh
                  </a>
                }
              >
                <Table
                  rowKey={(record) => record.nip_master}
                  dataSource={record.detail}
                  columns={detailColumns}
                />
              </Card>
            ),
            rowExpandable: (record) => record.detail.length > 0,
          }}
          size="middle"
          pagination={false}
          dataSource={data?.grafik}
          columns={columns}
        />
      </Stack>
    </Card>
  );
};

function DashboardKompareFasilitator() {
  const { data, isLoading } = useQuery(
    ["dashboard-compare-siasn"],
    () => compareEmployeesSimasterSiasn(),
    {}
  );

  return <div>{data && <GrafikFasilitatorKomparasi data={data} />}</div>;
}

export default DashboardKompareFasilitator;
