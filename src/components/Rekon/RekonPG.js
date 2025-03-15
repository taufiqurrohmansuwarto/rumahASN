import { getRekonPGDashboard } from "@/services/rekon.services";
import { SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, DatePicker, Form, Space, Table, Typography } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

function RekonPG() {
  const [tglUsulan, setTglUsulan] = useState(dayjs());
  const [query, setQuery] = useState({});
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rekonPGDashboard", query],
    queryFn: () => getRekonPGDashboard(query),
    keepPreviousData: true,
    staleTime: 1000 * 60 * 5,
  });

  const handleChange = (value) => {
    setTglUsulan(value);
    const formattedDate = dayjs(value).format("DD-MM-YYYY");
    setQuery({ tgl_usulan: formattedDate });
  };

  const columns = [
    {
      title: "Nama",
      dataIndex: "nama_unor",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.nama_unor,
        value: item?.nama_unor,
      })),
    },
    {
      title: "Jumlah Usulan",
      dataIndex: "jumlah_usulan",
      sorter: (a, b) => a.jumlah_usulan - b.jumlah_usulan,
    },
    //     {
    //       title: "Terima Usulan",
    //       dataIndex: "terima_usulan",
    //     },
    //     {
    //       title: "Terverifikasi di Instansi",
    //       dataIndex: "terverifikasi_di_instansi",
    //     },
    //     {
    //       title: "Input Berkas",
    //       dataIndex: "input_berkas",
    //     },
    //     {
    //       title: "Ditolak Instansi",
    //       dataIndex: "ditolak_instansi",
    //     },
    //     {
    //       title: "Profil PNS Telah Diperbarui",
    //       dataIndex: "profil_pns_telah_diperbarui",
    //     },
  ];

  const router = useRouter();
  const title = (router) => {
    return (
      <Space>
        <Typography.Text strong>Pencantuman Gelar</Typography.Text>
        <Button
          type="link"
          icon={<SearchOutlined />}
          onClick={() => router.push("/rekon/dashboard/pg")}
        />
      </Space>
    );
  };

  return (
    <Card title={title(router)}>
      <Form.Item label="Tanggal Usulan">
        <DatePicker
          value={tglUsulan}
          onChange={handleChange}
          format={{ format: "DD-MM-YYYY", type: "mask" }}
        />
      </Form.Item>

      <Table
        pagination={{
          position: ["bottomRight", "topRight"],
          pageSize: 15,
        }}
        loading={isLoading || isFetching}
        rowKey={(record) => record.id_unor}
        size="small"
        columns={columns}
        dataSource={data?.data}
      />
    </Card>
  );
}

export default RekonPG;
