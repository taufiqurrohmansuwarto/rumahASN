import { useQuery } from "@tanstack/react-query";
import { getImut } from "@/services/rekon.services";
import { useRouter } from "next/router";
import { Alert, Spin } from "antd";
import { useState } from "react";
function RekonImut() {
  const router = useRouter();
  const [query, setQuery] = useState({
    limit: 10,
    offset: 0,
  });

  const { data, isLoading, isFetching, error, isError } = useQuery(
    ["imut", query],
    () => getImut(query),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  if (isLoading || isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Memuat data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Terjadi Kesalahan"
        description={error?.message || "Gagal memuat data IMUT"}
        type="error"
        showIcon
      />
    );
  }

  return <div>{JSON.stringify(data)}</div>;
}

export default RekonImut;
