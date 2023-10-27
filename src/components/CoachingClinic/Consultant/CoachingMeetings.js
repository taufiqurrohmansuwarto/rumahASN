import { findMeeting } from "@/services/coaching-clinics.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

function CoachingMeetings() {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["meetings", router?.query],
    () => findMeeting(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  const columns = [
    {
      title: "Judul",
      dataIndex: "title",
    },
    {
      title: "Goto",
      key: "goto",
      render: (_, row) => (
        <Link href={`/coaching-clinic-consultant/${row?.id}/detail`}>
          Detail
        </Link>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      loading={isLoading}
      rowKey={(row) => row?.id}
      dataSource={data?.data}
    />
  );
}

export default CoachingMeetings;
