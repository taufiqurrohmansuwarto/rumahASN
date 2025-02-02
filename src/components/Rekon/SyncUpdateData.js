import { searchUpdateJabatan } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Card, DatePicker, FloatButton, Form, Space, Table } from "antd";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";
import dayjs from "dayjs";
import { Stack } from "@mantine/core";

function SyncUpdateData() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tglAwal = searchParams.get("tgl_awal") || dayjs().format("YYYY-MM-DD");
  const tglAkhir =
    searchParams.get("tgl_akhir") || dayjs().format("YYYY-MM-DD");

  const [query, setQuery] = useState({
    tgl_awal: dayjs(tglAwal, "YYYY-MM-DD") || dayjs().format("YYYY-MM-DD"),
    tgl_akhir: dayjs(tglAkhir, "YYYY-MM-DD") || dayjs().format("YYYY-MM-DD"),
  });

  const handleSearch = (value) => {
    const [tglAwal, tglAkhir] = value;
    setQuery({
      tgl_awal: tglAwal.format("YYYY-MM-DD"),
      tgl_akhir: tglAkhir.format("YYYY-MM-DD"),
    });
    router.push(
      `/rekon/update-data?tgl_awal=${tglAwal.format(
        "YYYY-MM-DD"
      )}&tgl_akhir=${tglAkhir.format("YYYY-MM-DD")}`
    );
  };

  const { data, isLoading, isFetching } = useQuery(
    ["sync-update-data", query],
    () => searchUpdateJabatan(query),
    {
      keepPreviousData: true,
    }
  );

  const columns = [
    {
      title: "NIP",
      dataIndex: "nip_baru",
      key: "nip_baru",
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan",
      key: "jabatan",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
  ];

  return (
    <Card title="Update Data">
      <FloatButton.BackTop />
      <Form.Item label="Tanggal">
        <DatePicker.RangePicker
          defaultValue={[dayjs(query.tgl_awal), dayjs(query.tgl_akhir)]}
          format="YYYY-MM-DD"
          onChange={handleSearch}
        />
      </Form.Item>

      <Table
        columns={columns}
        pagination={{
          showSizeChanger: false,
          size: "small",
          position: ["bottomRight", "topRight"],
          total: data?.total,
          pageSize: 20,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        loading={isLoading || isFetching}
        dataSource={data?.data}
      />
    </Card>
  );
}

export default SyncUpdateData;
