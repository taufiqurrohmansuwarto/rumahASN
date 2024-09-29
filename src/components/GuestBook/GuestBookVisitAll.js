import { getAllScheduleVisits } from "@/services/guests-books.services";
import { Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Space, Table, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { toUpper } from "lodash";

function GuestBookVisitAll() {
  const { data, isLoading } = useQuery(
    ["guest-book-all-visited"],
    () => getAllScheduleVisits(),
    {}
  );

  const columns = [
    {
      title: "Nama",
      key: "name",
      render: (_, row) => <Text>{row?.guest?.name}</Text>,
    },
    {
      title: "Tipe",
      key: "visitor_type",
      render: (_, row) => <Text>{toUpper(row?.guest?.visitor_type)}</Text>,
    },
    {
      title: "Asal Instansi",
      key: "institution",
      render: (_, row) => <Text>{row?.guest?.institution}</Text>,
    },
    {
      title: "Tgl. Rencana Kunjungan",
      key: "visit_date",
      render: (_, row) => (
        <Text>{dayjs(row?.visit_date).format("DD MMM YYYY HH:mm")}</Text>
      ),
    },
    {
      title: "Pegawai yang dikunjungi",
      key: "employee_visited",
      render: (_, row) => {
        return (
          <>
            <Avatar.Group>
              {row?.employee_visited?.map((employee) => (
                <Tooltip key={employee?.id} title={employee?.name}>
                  <Avatar src={employee?.avatar} />
                </Tooltip>
              ))}
            </Avatar.Group>
          </>
        );
      },
    },
    {
      title: "Kategori",
      key: "category",
      render: (_, row) => (
        <Tag color="yellow">
          <Text>{toUpper(row?.category)}</Text>
        </Tag>
      ),
    },

    {
      title: "Keterangan",
      dataIndex: "description",
    },

    {
      title: "Dibuat Tanggal",
      key: "created_at",
      render: (_, row) => (
        <Text>{dayjs(row?.created_at).format("DD MMM YYYY HH:mm")}</Text>
      ),
    },
  ];

  return (
    <Card title="Daftar Kunjungan">
      <Table
        size="small"
        columns={columns}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        loading={isLoading}
        pagination={{
          total: data?.total,
          pageSize: data?.limit,
          current: data?.page,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
      />
    </Card>
  );
}

export default GuestBookVisitAll;
