import { getKinerjaPeriodikPersonal } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import React from "react";

function CompareKinerjaPeriodik() {
  const { data, isLoading } = useQuery(
    ["kinerja-periodik"],
    () => getKinerjaPeriodikPersonal(),
    {}
  );

  const columns = [{}];

  return (
    <Table
      rowKey={(row) => row?.id}
      columns={columns}
      dataSource={data}
      loading={isLoading}
    />
  );
}

export default CompareKinerjaPeriodik;
