import { consistency3 } from "@/services/dimensi-consistency.services";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/router";
import { Table } from "antd";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { jenisKelaminNIPASN } from "@/services/dimensi-consistency.services";
import { Button, Card, Row } from "antd";
import { saveAs } from "file-saver";
import TableKualitasData from "@/components/Fasilitator/KualitasData/TableKualitasData";
import FilterSource from "@/components/Fasilitator/KualitasData/FilterSource";

function JenisKelaminNIPASN() {
  const router = useRouter();

  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 10,
  });

  const { data, isLoading } = useQuery(
    ["jenis-kelamin-nip-asn", router?.query],
    () => consistency3(router?.query),
    {
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

  const handleChange = (page, pageSize) => {
    router.push({
      pathname: router.pathname,
      query: { ...query, page, limit: pageSize },
    });

    setQuery({ ...query, page, limit: pageSize });
  };

  const handleDownload = async () => {
    // Implementasi download
  };

  const isDownloading = false; // Implementasi loading download

  return (
    <Card>
      <FilterSource query={query} setQuery={setQuery} />
      <DownloadButton onDownload={handleDownload} loading={isDownloading} />
      <TableKualitasData
        data={data?.data}
        isLoading={isLoading}
        isFetching={false}
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

// Komponen tombol download
const DownloadButton = ({ onDownload, loading }) => (
  <Row justify="end">
    <Button type="primary" onClick={onDownload} loading={loading}>
      Download
    </Button>
  </Row>
);

export default JenisKelaminNIPASN;
