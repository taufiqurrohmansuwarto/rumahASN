import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Typography } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { dataAnakByNip, dataPasanganByNip } from "@/services/siasn-services";
import { rwAnakByNip } from "@/services/master.services";
import { Stack } from "@mantine/core";
import { refJenisAnak } from "@/utils/data-utils";

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

  const {
    data: dataPasanganSiasn,
    isLoading: isLoadingPasanganSiasn,
    isFetching: isFetchingPasanganSiasn,
    error: errorPasanganSiasn,
  } = useQuery(["data-pasangan-siasn", nip], () => dataPasanganByNip(nip), {
    enabled: !!nip,
    refetchOnWindowFocus: false,
  });

  const columns = [
    { title: "Nama", dataIndex: "nama" },
    {
      title: "Jenis Kelamin",
      key: "jenis_kelamin",
      render: (_, row) => <>{row?.jenisKelamin === "M" ? "Pria" : "Wanita"}</>,
    },
    {
      title: "Ayah",
      key: "ayah",
      render: (_, row) => (
        <>{dataPasanganSiasn?.find((item) => item?.id === row?.ayahId)?.nama}</>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => (
        <>{refJenisAnak.find((item) => item?.id === row?.jenisAnak)?.label}</>
      ),
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
    <Stack>
      <Card title="Data Anak jIMASTER">
        <Table
          pagination={false}
          columns={columnsSimaster}
          dataSource={dataAnakSimaster}
          loading={loadingAnakSimaster}
        />
      </Card>
      <Card title="Data Anak SIASN">
        <Table
          pagination={false}
          columns={columns}
          dataSource={dataAnak}
          loading={loadingAnak}
        />
      </Card>
    </Stack>
  );
}

export default CompareAnakByNip;
