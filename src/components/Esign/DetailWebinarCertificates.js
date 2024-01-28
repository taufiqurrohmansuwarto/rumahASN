import { certificateDetailWebinar } from "@/services/esign-signer.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

function DetailWebinarCertificates() {
  const router = useRouter();

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery(
    ["webinars-certificates", query],
    () =>
      certificateDetailWebinar({
        id: router.query.id,
        query,
      }),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const columns = [];

  return (
    <>
      <Table
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
      />
    </>
  );
}

export default DetailWebinarCertificates;
