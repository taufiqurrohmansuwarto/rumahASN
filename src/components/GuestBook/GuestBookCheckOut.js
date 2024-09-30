import { findCheckOut } from "@/services/guests-books.services";
import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import GuestBookFindQrCodeCheckout from "@/components/GuestBook/GuestBookFindQrCodeCheckout";

const ListCheckOut = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      key: "name",
      render: (_, row) => <>{row?.guest?.name}</>,
    },
    {
      title: "Rencana Jadwal Kunjungan",
      key: "jadwal_kunjungan",
      render: (_, row) => (
        <>{dayjs(row?.schedule?.visit_date).format("DD-MM-YYYY HH:mm")}</>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, row) => <Tag color="green">{row?.status}</Tag>,
    },
  ];

  return (
    <Card title="Daftar Check Out">
      <Table
        rowKey={(row) => row.id}
        loading={isLoading}
        columns={columns}
        dataSource={data?.data}
        pagination={{
          total: data?.total,
          pageSize: data?.limit,
          current: data?.page,
        }}
      />
    </Card>
  );
};

function GuestBookCheckIn() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data: checkOut, isLoading: isLoadingCheckOut } = useQuery(
    ["checkout", query],
    () => findCheckOut(query),
    {
      enabled: !!query,
    }
  );

  return (
    <Row gutter={[16, 16]}>
      <Col md={24} xs={24}>
        <GuestBookFindQrCodeCheckout />
      </Col>
      <Col md={24} xs={24}>
        <ListCheckOut data={checkOut} isLoading={isLoadingCheckOut} />
      </Col>
    </Row>
  );
}

export default GuestBookCheckIn;
