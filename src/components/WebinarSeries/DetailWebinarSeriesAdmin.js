import { detailWebinar, getParticipants } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Skeleton, Space, Table } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

function DetailWebinarSeriesAdmin() {
  const router = useRouter();

  const [query, setQuery] = useState({
    id: router?.query?.id,
    query: {
      page: 1,
      limit: 25,
    },
  });

  const { data, isLoading } = useQuery(
    ["webinar-series-admin-detail", router?.query?.id],
    () => detailWebinar(router?.query?.id),
    {}
  );

  const { data: participants, isLoading: isLoadingParticipants } = useQuery(
    ["webinar-series-admin-detail-participants", query],
    () => getParticipants(query),
    {}
  );

  const columns = [
    ,
    {
      title: "Nama",
      key: "name",
      render: (text) => (
        <Space>
          <Avatar src={text?.participant?.image} />
          <span>{text?.participant?.username}</span>
        </Space>
      ),
    },
    {
      title: "Jabatan",
      key: "jabatan",
      render: (text) => (
        <span>{text?.participant?.info?.jabatan?.jabatan}</span>
      ),
    },
    {
      title: "Perangkat Daerah",
      key: "perangkat_daerah",
      render: (text) => (
        <span>{text?.participant?.info?.perangkat_daerah?.detail}</span>
      ),
    },
  ];

  return (
    <>
      <Skeleton loading={isLoading}>
        <div>{JSON.stringify(data)}</div>
        <Table
          columns={columns}
          title={() => <h4>Peserta</h4>}
          pagination={{
            pageSize: query?.query?.limit,
            current: query?.query?.page,
            total: participants?.total,
            onChange: (page) => {
              setQuery({
                ...query,
                query: {
                  ...query?.query,
                  page: page,
                },
              });
            },
          }}
          loading={isLoadingParticipants}
          rowKey={(row) => row?.custom_id}
          dataSource={participants?.data}
        />
      </Skeleton>
    </>
  );
}

export default DetailWebinarSeriesAdmin;
