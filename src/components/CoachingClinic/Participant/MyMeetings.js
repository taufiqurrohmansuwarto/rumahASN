import { meetingsParticipant } from "@/services/coaching-clinics.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import { useRouter } from "next/router";
import React from "react";

function MyMeetings() {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["myMeetings"],
    () => meetingsParticipant(),
    {}
  );

  const gotoDetailMeetingParticipant = (row) =>
    router.push(`/coaching-clinic/${row?.id}/detail`);

  const columns = [
    {
      title: "title",
      key: "title",
      render: (_, row) => <>{row?.meeting?.title}</>,
    },
    {
      title: "Aksi",
      render: (_, row) => {
        return <a onClick={() => gotoDetailMeetingParticipant(row)}>Detail</a>;
      },
    },
  ];

  return (
    <Table
      title={() => "hello world"}
      columns={columns}
      dataSource={data}
      loading={isLoading}
    />
  );
}

export default MyMeetings;
