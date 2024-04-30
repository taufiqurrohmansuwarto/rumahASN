import { getAllSubmissionSubmitter } from "@/services/submissions.services";
import { useQuery } from "@tanstack/react-query";
import { Table, Tag } from "antd";
import { useRouter } from "next/router";
import React from "react";

import dayjs from "dayjs";

dayjs.locale("id");
require("dayjs/locale/id");

function DaftarUsulan() {
  const router = useRouter();

  const [query, setQuery] = React.useState({
    page: 1,
    limit: 10,
  });

  const gotoDetail = (id) => {
    const url = `/submissions/all/detail/${id}`;
    router.push(url);
  };

  const { data, isLoading } = useQuery(
    ["submissions-submitter", query],
    () => getAllSubmissionSubmitter(query),
    {}
  );

  const columns = [
    {
      title: "Jenis Usulan",
      key: "jenis_usulan",
      render: (_, row) => <div>{row?.reference?.type}</div>,
    },
    {
      title: "NIP",
      dataIndex: "employee_number",
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => <Tag color="yellow">{row?.status}</Tag>,
    },
    {
      title: "Tgl. Usulan",
      key: "tgl_usulan",
      render: (_, row) => (
        <div>{dayjs(row?.created_at).format("DD-MM-YYYY HH:mm:ss")}</div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_, row) => <a onClick={() => gotoDetail(row?.id)}>Detail</a>,
    },
  ];

  return (
    <Table
      columns={columns}
      pagination={false}
      dataSource={data?.data}
      loading={isLoading}
      rowKey={(row) => row?.id}
    />
  );
}

export default DaftarUsulan;
