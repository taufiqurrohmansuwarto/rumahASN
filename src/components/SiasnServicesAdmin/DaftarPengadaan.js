import useScrollRestoration from "@/hooks/useScrollRestoration";
import { daftarPengadaan } from "@/services/siasn-services";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Button, Card, DatePicker, FloatButton, Space, Table } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { useState } from "react";
import PengadaanFilter from "../Filter/PengadaanFilter";

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
      title: "No. Pertek",
      dataIndex: "no_pertek",
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
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
