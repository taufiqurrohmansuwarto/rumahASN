import useScrollRestoration from "@/hooks/useScrollRestoration";
import { consistency1 } from "@/services/dimensi-consistency.services";
import { tmtCpnsNipPns } from "@/services/dimensi-consistency.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Row, Table } from "antd";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import { useState } from "react";
import * as XLSX from "xlsx";
import InformasiPegawai from "@/components/Fasilitator/KualitasData/InformasiPegawai";
import TableKualitasData from "@/components/Fasilitator/KualitasData/TableKualitasData";
import FilterSource from "@/components/Fasilitator/KualitasData/FilterSource";

// Komponen tombol download
const DownloadButton = ({ onDownload, loading }) => (
  <Row justify="end">
    <Button type="primary" onClick={onDownload} loading={loading}>
      Download
    </Button>
  </Row>
);

function TmtCpnsNipPns() {
  const router = useRouter();
  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 10,
  });

  const { data, isLoading, isFetching } = useQuery(
    ["consistency1", router?.query],
    () => consistency1(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
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

  const handleDownload = () => {
    // Implementasi handleDownload
  };

  const handleChange = (page) => {
    setQuery({ ...query, page });
  };

  return (
    <Card>
      <FilterSource />
      <DownloadButton onDownload={handleDownload} loading={isDownloading} />
      <TableKualitasData
        data={data?.data}
        isLoading={isLoading}
        isFetching={isFetching}
        columns={columns}
        pagination={{
          total: data?.total,
          position: ["bottomRight", "topRight"],
          pageSize: query?.limit,
          current: query?.page,
          showSizeChanger: false,
          onChange: handleChange,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} data`,
        }}
      />
    </Card>
  );
}

export default TmtCpnsNipPns;
