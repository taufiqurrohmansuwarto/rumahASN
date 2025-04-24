import { consistency1 } from "@/services/dimensi-consistency.services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Table } from "antd";

function TmtCpnsNipPns() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery(
    ["con1", query],
    () => consistency1(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "NIP",
      dataIndex: "nip_baru",
    },
  ];

  return (
    <div>
      <Table
        rowKey={(row) => row?.id}
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
      />
    </div>
  );
}

export default TmtCpnsNipPns;
