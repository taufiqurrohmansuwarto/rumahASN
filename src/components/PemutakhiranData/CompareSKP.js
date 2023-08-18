import { getRwSkp } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import React from "react";

function CompareSKP() {
  const { data, isLoading } = useQuery(["rw-skp"], () => getRwSkp(), {});
  const columns = [
    {
      title: "Tahun Penilaian",
      dataIndex: "tahun",
    },
    {
      title: "Nilai SKP",
      dataIndex: "nilaiSkp",
    },
  ];
  return (
    <div>
      <Table
        title={() => "DATA SKP SIASN"}
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        columns={columns}
        pagination={false}
      />
    </div>
  );
}

export default CompareSKP;
