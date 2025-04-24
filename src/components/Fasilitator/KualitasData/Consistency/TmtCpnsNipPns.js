import { consistency1 } from "@/services/dimensi-consistency.services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Table } from "antd";
import { useRouter } from "next/router";

function TmtCpnsNipPns() {
  const router = useRouter();
  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 10,
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
