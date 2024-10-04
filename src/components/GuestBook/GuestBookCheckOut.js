import { findCheckOut } from "@/services/guests-books.services";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, Col, Row, Table, Tag, Tooltip } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import GuestBookFindQrCodeCheckout from "@/components/GuestBook/GuestBookFindQrCodeCheckout";

import { toUpper, upperCase } from "lodash";

const ListCheckOut = ({ data, isLoading, onChangePage }) => {
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
      render: (_, row) => <Tag color="red">{upperCase(row?.status)}</Tag>,
    },
    {
      title: "Tgl. Check Out",
      key: "checkout_date",
      render: (_, row) => (
        <>{dayjs(row?.checkout_date).format("DD-MM-YYYY HH:mm")}</>
      ),
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

  const { data: checkOut, isLoading: isLoadingCheckOut } = useQuery(
    ["checkout", query],
    () => findCheckOut(query),
    {
      enabled: !!query,
    }
  );

  const handleChangePage = (page, pageSize) => {
    setQuery({ ...query, page, pageSize });
  };

  return (
    <Row gutter={[16, 16]}>
      <Col md={24} xs={24}>
        <GuestBookFindQrCodeCheckout />
      </Col>
      <Col md={24} xs={24}>
        <ListCheckOut
          data={checkOut}
          isLoading={isLoadingCheckOut}
          onChangePage={handleChangePage}
        />
      </Col>
    </Row>
  );
}

export default GuestBookCheckIn;
