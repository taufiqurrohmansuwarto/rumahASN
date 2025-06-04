import FilterSource from "@/components/Fasilitator/KualitasData/FilterSource";
import TableKualitasData from "@/components/Fasilitator/KualitasData/TableKualitasData";
import { consistency4 } from "@/services/dimensi-consistency.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Row } from "antd";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import { useState } from "react";
import * as XLSX from "xlsx";

// Komponen tombol download
const DownloadButton = ({ onDownload, loading }) => (
  <Row justify="end">
    <Button type="primary" onClick={onDownload} loading={loading}>
      Download
    </Button>
  </Row>
);

function TahunPengangkatanPPPK() {
  const router = useRouter();

  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 10,
  });

  const [isDownloading, setIsDownloading] = useState(false);

  const handleClick = (nip) => {
    const url = `/rekon/pegawai/${nip}/detail`;
    router.push(url);
  };

  const { data, isLoading, isFetching } = useQuery(
    ["tahun-pengangkatan-pppk", router?.query],
    () => consistency4(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
    }
  );

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "NIP",
      dataIndex: "nip",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <a onClick={() => handleClick(record.nip_master)}>Detail</a>
      ),
    },
  ];

  const handleChange = (page, pageSize) => {
    router.push({
      pathname: router.pathname,
      query: { ...query, page, limit: pageSize },
    });

    setQuery({ ...query, page, limit: pageSize });
    setIsDownloading(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const result = await consistency4({ ...router?.query, limit: -1 });
    const workbook = XLSX.utils.book_new();

    const sheetData = result?.data?.map((item) => ({
      NIP: item.nip_master,
      Nama: item.nama_master,
      OPD: item.opd_master,
      Jabatan: item.jabatan,
    }));

    const sheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, sheet, "BUP Masih Aktif");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([excelBuffer]), "bup-masih-aktif.xlsx");
    setIsDownloading(false);
  };

  return (
    <Card>
      <FilterSource query={query} setQuery={setQuery} />
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

export default TahunPengangkatanPPPK;
