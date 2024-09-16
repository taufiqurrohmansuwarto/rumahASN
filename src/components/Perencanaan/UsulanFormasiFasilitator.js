import { findUsulanByUser } from "@/services/perencanaan.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";

function UsulanFormasiFasilitator() {
  const { data, isLoading } = useQuery(
    ["perencanaan-usulan-formasi"],
    () => findUsulanByUser(),
    {
      refetchOnWindowFocus: false,
    }
  );

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
      render: (_, record) => (
        <a onClick={() => handleDetail(record)}>Daftar Usulan</a>
      ),
    },
  ];

  return (
    <Card>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={false}
        rowKey={(row) => row?.id}
      />
    </Card>
  );
}

export default UsulanFormasiFasilitator;
