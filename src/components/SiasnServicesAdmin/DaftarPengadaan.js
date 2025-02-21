import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  daftarPengadaan,
  downloadDokumenPengadaan,
} from "@/services/siasn-services";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  DatePicker,
  FloatButton,
  message,
  Space,
  Table,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useState } from "react";
import PengadaanFilter from "../Filter/PengadaanFilter";
import { FilePdfOutlined } from "@ant-design/icons";

const formatYear = "YYYY";

function DaftarPengadaan() {
  const router = useRouter();

  useScrollRestoration();

  const [query, setQuery] = useState({
    tahun: router.query.tahun || dayjs().format(formatYear),
    sync: false,
    page: 1,
    limit: 25,
  });

  const handleChange = (value) => {
    setQuery({
      tahun: value.format(formatYear),
    });
    router.push({
      pathname: "/apps-managements/siasn-services/pengadaan",
      query: { tahun: value.format(formatYear) },
    });
  };

  const handleChangePage = (page, limit) => {
    setQuery({ ...query, page, limit, sync: false });

    router.push({
      pathname: "/apps-managements/siasn-services/pengadaan",
      query: {
        page,
        limit,
        tahun: router?.query?.tahun,
        nama: router?.query?.nama,
        jenis_formasi_nama: router?.query?.jenis_formasi_nama,
        no_peserta: router?.query?.no_peserta,
        nip: router?.query?.nip,
        belum_cetak_sk: router?.query?.belum_cetak_sk,
      },
    });
  };

  const { data, isLoading, isFetching } = useQuery(
    ["daftar-pengadaan", router?.query],
    () => daftarPengadaan(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
      refetchOnWindowFocus: false,
    }
  );

  const gotoDetail = (row) => {
    router.push(`/apps-managements/integrasi/siasn/${row.nip}`);
  };

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <Space>
            {record?.path_ttd_sk && (
              <Tooltip title="File SK">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              </Tooltip>
            )}
            {record?.path_ttd_pertek && (
              <Tooltip title="File Pertek">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: "No. Peserta",
      dataIndex: "no_peserta",
    },
    {
      title: "NIP",
      dataIndex: "nip",
    },
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Jenis Formasi Nama",
      dataIndex: "jenis_formasi_nama",
    },
    {
      title: "Periode",
      dataIndex: "periode",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => {
        return <a onClick={() => gotoDetail(row)}>Detail</a>;
      },
    },
  ];

  const handleSync = () => {
    setQuery({ ...query, sync: true, page: 1, limit: 25 });
    router.push({
      pathname: "/apps-managements/siasn-services/pengadaan",
      query: {
        page: 1,
        limit: 25,
        tahun: router?.query?.tahun,
        sync: true,
      },
    });
  };

  const { mutateAsync: download, isLoading: isDownloading } = useMutation({
    mutationFn: () => downloadDokumenPengadaan(router?.query),
    onSuccess: () => {
      message.success("Berhasil mengunduh dokumen");
    },
    onError: () => {
      message.error("Gagal mengunduh dokumen");
    },
  });

  const handleDownload = async () => {
    await download();
  };

  return (
    <Card title="Daftar Pengadaan Instansi">
      <FloatButton.BackTop />
      <DatePicker
        value={dayjs(query?.tahun, formatYear)}
        picker="year"
        onChange={handleChange}
        format={formatYear}
        style={{ marginBottom: 16 }}
      />
      <PengadaanFilter />
      <Table
        title={() => (
          <Space>
            <h3>Daftar Pengadaan</h3>
            <Button size="small" type="primary" onClick={handleSync}>
              Sync
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={handleDownload}
              disabled={isDownloading}
              loading={isDownloading}
            >
              Download
            </Button>
          </Space>
        )}
        pagination={{
          showTotal: (total) => `Total ${total} data`,
          position: ["bottomRight", "topRight"],
          onChange: handleChangePage,
          pageSize: 25,
          total: data?.total,
          showSizeChanger: false,
          current: parseInt(router?.query?.page) || 1,
        }}
        size="small"
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        columns={columns}
        loading={isLoading || isFetching}
      />
    </Card>
  );
}

export default DaftarPengadaan;
