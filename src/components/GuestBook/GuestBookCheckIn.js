import React, { useState } from "react";
import GuestBookFindQrCode from "./GuestBookFindQrCode";
import { useQuery } from "@tanstack/react-query";
import { findCheckIn } from "@/services/guests-books.services";
import { Avatar, Card, Col, Row, Table, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { toUpper, upperCase } from "lodash";

dayjs.locale("id");

const ListCheckIn = ({ data, isLoading, onChangePage }) => {
  const columns = [
    {
      title: "Nama",
      key: "name",
      render: (_, row) => <>{row?.guest?.name}</>,
    },
    {
      title: "Instansi",
      key: "institution",
      render: (_, row) => <>{row?.guest?.institution}</>,
    },
    {
      title: "Kategori",
      key: "category",
      render: (_, row) => <>{toUpper(row?.schedule?.category)}</>,
    },
    {
      title: "Pegawai yang dikunjungi",
      key: "pegawai",
      render: (_, row) => {
        return (
          <>
            <Avatar.Group>
              {row?.schedule?.employee_visited?.map((pegawai) => (
                <Tooltip key={pegawai?.id} title={pegawai?.name}>
                  <Avatar key={pegawai?.id} src={pegawai?.avatar} />
                </Tooltip>
              ))}
            </Avatar.Group>
          </>
        );
      },
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
      render: (_, row) => <Tag color="green">{upperCase(row?.status)}</Tag>,
    },
    {
      title: "Tgl. Check In",
      key: "checkin_date",
      render: (_, row) => (
        <>{dayjs(row?.checkin_date).format("DD-MM-YYYY HH:mm")}</>
      ),
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
          onChange: onChangePage,
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

  const onChangePage = (page) => {
    setQuery({ ...query, page });
  };

  return (
    <Row gutter={[16, 16]}>
      <Col md={24} xs={24}>
        <GuestBookFindQrCode />
      </Col>
      <Col md={24} xs={24}>
        <ListCheckIn
          data={checkIn}
          isLoading={isLoadingCheckIn}
          onChangePage={onChangePage}
        />
      </Col>
    </Row>
  );
}

export default GuestBookCheckIn;
