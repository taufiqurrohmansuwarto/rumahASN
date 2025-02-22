import {
  daftarPemberhentian,
  syncPemberhentianSIASN,
} from "@/services/siasn-services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, DatePicker, Form, message, Space, Table } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const montFormat = "MM-YYYY";

function LayananPemberhentian() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState({
    // tglAwal: router?.query?.tgl_awal || dayjs().format(format),
    // tglAkhir: router?.query?.tgl_akhir || dayjs().format(format),
    month: router?.query?.month || dayjs(new Date()).format(montFormat),
  });

  const [pageSize, setPageSize] = useState(25);

  const handleMonthChange = (value) => {
    console.log(value?.format(montFormat));
    setQuery({
      month: value?.format(montFormat),
    });
    router.push({
      pathname: "/layanan-siasn/pemberhentian",
      query: {
        month: value?.format(montFormat),
      },
    });
  };

  const { data, isLoading, isFetching, refetch } = useQuery(
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
      render: (row) => <a>Detail</a>,
    },
  ];

  return (
    <Card title="Integrasi Pemberhentian">
      <Space>
        <Form.Item label="Bulan">
          <DatePicker.MonthPicker
            onChange={handleMonthChange}
            format={montFormat}
            value={dayjs(query.month, montFormat)}
          />
        </Form.Item>
        <Form.Item>
          <Button onClick={() => refetch()} loading={isFetching}>
            Reload
          </Button>
        </Form.Item>
      </Space>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => syncPemberhentian()}
            loading={isSyncLoading}
          >
            Sinkronisasi
          </Button>
        </Space>
      </div>

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

export default LayananPemberhentian;
