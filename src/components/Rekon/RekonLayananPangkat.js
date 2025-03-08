import { dashboardKPJatim } from "@/services/rekon.services";
import { SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, DatePicker, Form, Space, Table, Typography } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const format = "MM-YYYY";
const queryFormat = "DD-MM-YYYY";

const DEFAULT_PERIODE = "01-04-2025";

const getFirstDayOfMonth = (date) => {
  return dayjs(date).startOf("month").format(queryFormat);
};

function RekonLayananPangkat() {
  const [period, setPeriod] = useState(null);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardKPJatim", period],
    queryFn: () =>
      dashboardKPJatim({
        periode: period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE,
      }),
    refetchOnWindowFocus: false,
  });

  const handleChange = (value) => {
    setPeriod(value);
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "nama_unor",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.nama_unor,
        value: item?.nama_unor,
      })),
      onFilter: (value, record) =>
        record.nama_unor.toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.nama_unor.localeCompare(b.nama_unor),
      width: "30%",
      ellipsis: true,
    },
    {
      title: "Jumlah Usulan",
      dataIndex: "jumlah_usulan",
      sorter: (a, b) => a.jumlah_usulan - b.jumlah_usulan,
    },
    {
      title: "TTD Pertek",
      dataIndex: "jumlah_ttd_pertek",
      sorter: (a, b) => a.jumlah_ttd_pertek - b.jumlah_ttd_pertek,
    },
    {
      title: "SK Berhasil",
      dataIndex: "jumlah_sk_berhasil",
      sorter: (a, b) => a.jumlah_sk_berhasil - b.jumlah_sk_berhasil,
    },
  ];

  const title = (router) => {
    return (
      <Space>
        <Typography.Text strong>Kenaikan Pangkat</Typography.Text>
        <Button
          type="link"
          icon={<SearchOutlined />}
          onClick={() => router.push("/rekon/dashboard/kenaikan-pangkat")}
        />
      </Space>
    );
  };

  return (
    <Card title={title(router)}>
      <Space direction="vertical">
        <Form.Item label="Periode">
          <DatePicker.MonthPicker
            format={{
              format,
              type: "mask",
            }}
            onChange={handleChange}
            defaultValue={dayjs(DEFAULT_PERIODE, queryFormat)}
            disabledDate={(current) => {
              return (
                current &&
                (current.month() === 0 || // Januari
                  current.month() === 2 || // Maret
                  current.month() === 4 || // Mei
                  current.month() === 6 || // Juli
                  current.month() === 8 || // September
                  current.month() === 10) // November
              );
            }}
          />
        </Form.Item>
        <Typography.Text>
          {data?.jumlah_usulan_keseluruhan} Usulan
        </Typography.Text>
      </Space>
      <Table
        size="small"
        rowKey={(row) => row?.id_unor}
        dataSource={data?.data}
        loading={isLoading}
        columns={columns}
        pagination={{
          pageSize: 15,
          position: ["bottomRight", "topRight"],
        }}
        sortDirections={["ascend", "descend"]}
      />
    </Card>
  );
}

export default RekonLayananPangkat;
