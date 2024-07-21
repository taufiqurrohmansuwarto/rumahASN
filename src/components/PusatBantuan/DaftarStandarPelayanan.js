import { getStandarLayanan } from "@/services/layanan.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Divider, Table, Tag } from "antd";
import { useRouter } from "next/router";
import CreateStandarLayanan from "./CreateStandarLayanan";

function DaftarStandarPelayanan() {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["standar-pelayanan"],
    () => getStandarLayanan(),
    {}
  );

  const gotoDetail = (row) => {
    router.push(`/apps-managements/standar-pelayanan/${row?.id}/detail`);
  };

  const columns = [
    {
      title: "Nama Layanan",
      dataIndex: "nama_pelayanan",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (row) =>
        row ? (
          <Tag color="green">Aktif</Tag>
        ) : (
          <Tag color="red">Tidak Aktif</Tag>
        ),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => (
        <>
          <Button type="link" onClick={() => gotoDetail(row)}>
            Detail
          </Button>
          <Divider type="vertical" />
          <Button type="link">Hapus</Button>
        </>
      ),
    },
  ];

  return (
    <Card>
      <CreateStandarLayanan />
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={false}
      />
    </Card>
  );
}

export default DaftarStandarPelayanan;
