"use client";
import { useSearchParams } from "next/navigation";
import { getAllPeserta } from "@/services/pengadaan.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";

function DaftarPeserta() {
  const queryParasm = useSearchParams();
  const query = {
    page: queryParasm.get("page") || 1,
    limit: queryParasm.get("limit") || 10,
    keyword: queryParasm.get("keyword") || "",
    status: queryParasm.get("status") || "",
  };

  const { data, isLoading } = useQuery({
    queryKey: ["daftar-peserta", query],
    queryFn: () => getAllPeserta(query),
    keepPreviousData: true,
  });

  return (
    <div>
      <Table
        dataSource={data?.results}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
    </div>
  );
}

export default DaftarPeserta;
