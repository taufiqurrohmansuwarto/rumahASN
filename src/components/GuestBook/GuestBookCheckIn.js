import React, { useState } from "react";
import GuestBookFindQrCode from "./GuestBookFindQrCode";
import { useQuery } from "@tanstack/react-query";
import { findCheckIn } from "@/services/guests-books.services";
import { Card, Col, Row, Table } from "antd";

const ListCheckIn = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "name",
    },
  ];

  return (
    <Card title="Daftar Check In">
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

  const { data: checkIn, isLoading: isLoadingCheckIn } = useQuery(
    ["checkin", query],
    () => findCheckIn(query),
    {
      enabled: !!query,
    }
  );

  return (
    <Row gutter={[16, 16]}>
      <Col md={24} xs={24}>
        <GuestBookFindQrCode />
      </Col>
      <Col md={24} xs={24}>
        <ListCheckIn data={checkIn} isLoading={isLoadingCheckIn} />
      </Col>
    </Row>
  );
}

export default GuestBookCheckIn;
