import { Button, Card, DatePicker, Form, message, Space, Table } from "antd";
import { useRouter } from "next/router";
import React, { useState } from "react";
import dayjs from "dayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  daftarPemberhentian,
  syncPemberhentianSIASN,
} from "@/services/siasn-services";

const format = "DD-MM-YYYY";

const montFormat = "MM-YYYY";

function DaftarPemberhentian() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState({
    // tglAwal: router?.query?.tgl_awal || dayjs().format(format),
    // tglAkhir: router?.query?.tgl_akhir || dayjs().format(format),
    month: router?.query?.month || dayjs(new Date()).format(montFormat),
  });

  const [pageSize, setPageSize] = useState(25);

  const gotoDetail = (row) => {
    router.push(`/apps-managements/integrasi/siasn/${row.nipBaru}`);
  };

  const handleChange = (value) => {
    setQuery({
      tglAwal: value[0].format(format),
      tglAkhir: value[1].format(format),
    });
    router.push({
      pathname: "/apps-managements/siasn-services/pemberhentian",
      query: {
        tglAwal: value[0].format(format),
        tglAkhir: value[1].format(format),
      },
    });
  };

  const handleMonthChange = (value) => {
    console.log(value?.format(montFormat));
    setQuery({
      month: value?.format(montFormat),
    });
    router.push({
      pathname: "/apps-managements/siasn-services/pemberhentian",
      query: {
        month: value?.format(montFormat),
      },
    });
  };

  const { data, isLoading, isFetching } = useQuery(
    ["daftar-pemberhentian", router?.query],
    () => daftarPemberhentian(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const { mutate: syncPemberhentian, isLoading: isSyncLoading } = useMutation({
    mutationFn: () => syncPemberhentianSIASN(router?.query),
    onSuccess: () => {
      message.success("Data berhasil disinkronisasi");
      queryClient.invalidateQueries({
        queryKey: ["daftar-pemberhentian", router?.query],
      });
    },
    onError: () => {
      message.error("Data gagal disinkronisasi");
    },
  });

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    { title: "NIP", dataIndex: "nipBaru" },
    { title: "Nomor Pertek", dataIndex: "pertekNomor" },
    { title: "Nomor SK", dataIndex: "skNomor" },
    { title: "Tgl. Pertek", dataIndex: "pertekTgl" },
    { title: "Tgl. SK", dataIndex: "skTgl" },
    { title: "Status", dataIndex: "statusUsulanNama" },
    { title: "Layanan", dataIndex: "detailLayananNama" },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => <a onClick={() => gotoDetail(row)}>Detail</a>,
    },
  ];

  return (
    <Card>
      <Space direction="vertical" style={{ marginBottom: 16 }}>
        <Form.Item label="Pilih Bulan">
          <DatePicker.MonthPicker
            onChange={handleMonthChange}
            format={montFormat}
            value={dayjs(query.month, montFormat)}
          />
        </Form.Item>
        <Button
          type="primary"
          onClick={() => syncPemberhentian()}
          loading={isSyncLoading}
        >
          Sinkronisasi
        </Button>
      </Space>

      <Table
        pagination={{
          total: data?.length,
          showTotal: (total) => `Total ${total} data`,
          pageSize: pageSize,
          onShowSizeChange: (a, b) => {
            setPageSize(b);
          },
          pageSizeOptions: [25, 50, 100],
          defaultPageSize: 25,

          position: ["topRight", "bottomRight"],
        }}
        columns={columns}
        dataSource={data}
        loading={isLoading || isFetching}
        rowKey={(row) => row?.id}
      />
    </Card>
  );
}

export default DaftarPemberhentian;
