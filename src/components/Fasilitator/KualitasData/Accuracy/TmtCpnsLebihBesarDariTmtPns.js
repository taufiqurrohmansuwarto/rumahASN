import useScrollRestoration from "@/hooks/useScrollRestoration";
import { tmtCpnsLebihBesarDariTMTPNS } from "@/services/dimensi-accuracy.services";
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

const TmtCpnsLebihBesarDariTmtPns = () => {
  useScrollRestoration();
  const router = useRouter();
  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 10,
  });

  const { data, isLoading, isFetching } = useQuery(
    ["tmt-cpns-lebih-besar-dari-tmt-pns", router?.query],
    () => tmtCpnsLebihBesarDariTMTPNS(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
    }
  );

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    const result = await tmtCpnsLebihBesarDariTMTPNS({
      ...router?.query,
      limit: -1,
    });
    const workbook = XLSX.utils.book_new();

    const sheetData = result?.data?.map((item) => ({
      NIP: item.nip_master,
      Nama: item.nama_master,
      OPD: item.opd_master,
      Status: item.status,
    }));

    const sheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      "TMT CPNS Lebih Besar Dari TMT PNS"
    );

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(new Blob([excelBuffer]), "tmt-cpns-lebih-besar-dari-tmt-pns.xlsx");
    setIsDownloading(false);
  };

  const handleClick = (nip) => {
    const url = `/rekon/pegawai/${nip}/detail`;
    router.push(url);
  };

  const handleChange = (page, pageSize) => {
    router.push({
      pathname: router.pathname,
      query: { ...query, page, limit: pageSize },
    });

    setQuery({ ...query, page, limit: pageSize });
  };

  const columns = [
    {
      title: "Informasi Pegawai",
      dataIndex: "nip_master",
      render: (_, record) => (
        <InformasiPegawai record={record} onClick={handleClick} />
      ),
    },
  ];

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
          onChange: handleChange,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} data`,
        }}
      />
    </Card>
  );
};

export default TmtCpnsLebihBesarDariTmtPns;
