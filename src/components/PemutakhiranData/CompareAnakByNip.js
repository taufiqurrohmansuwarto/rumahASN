import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { dataAnakByNip } from "@/services/siasn-services";
import { rwAnakByNip } from "@/services/master.services";
import { Stack } from "@mantine/core";

function CompareAnakByNip() {
  const router = useRouter();
  const { nip } = router.query;
  const { data: dataAnak, isLoading: loadingAnak } = useQuery({
    queryKey: ["anak-siasn", nip],
    queryFn: () => dataAnakByNip(nip),
    enabled: !!nip,
    keepPreviousData: true,
  });

  const { data: dataAnakSimaster, isLoading: loadingAnakSimaster } = useQuery({
    queryKey: ["anak-simaster", nip],
    queryFn: () => rwAnakByNip(nip),
    enabled: !!nip,
    keepPreviousData: true,
  });

  const columns = [
    { title: "Nama", dataIndex: "nama" },
    {
      title: "Jenis Kelamin",
      key: "jenis_kelamin",
      render: (_, row) => <>{row?.jenisKelamin === "M" ? "Pria" : "Wanita"}</>,
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tglLahir",
      render: (_, row) => <>{dayjs(row?.tglLahir).format("DD-MM-YYYY")}</>,
    },
  ];

  const columnsSimaster = [
    { title: "Nama", dataIndex: "nama" },
    {
      title: "Jenis Kelamin",
      key: "jenis_kelamin",
      render: (_, row) => <>{row?.jk === "P" ? "Pria" : "Wanita"}</>,
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lahir",
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => <>{row?.status_anak?.status_anak}</>,
    },
  ];
  return (
    <Stack mt={30}>
      <Table
        pagination={false}
        columns={columnsSimaster}
        dataSource={dataAnakSimaster}
        loading={loadingAnakSimaster}
      />
      {JSON.stringify(dataAnak)}
      <Table
        pagination={false}
        columns={columns}
        dataSource={dataAnak}
        loading={loadingAnak}
      />
    </Stack>
  );
}

export default CompareAnakByNip;
