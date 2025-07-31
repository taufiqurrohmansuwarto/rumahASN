import { rwAnakMaster, rwPasanganMaster } from "@/services/master.services";
import { dataAnak, dataPasangan } from "@/services/siasn-services";
import { refJenisKawin, statusHidup } from "@/utils/data-utils";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Table } from "antd";
import { useState } from "react";
import FormAnak from "./FormAnak";
import FormPasangan from "./FormPasangan";
import dayjs from "dayjs";

function CompareDataKeluarga() {
  const [showModal, setShowModal] = useState(false);
  const [dataModal, setDataModal] = useState(null);

  const handleShowModalData = (data) => {
    setDataModal(data);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDataModal(null);
  };

  // kolom daftar pasangan SIASN
  const columnsPasanganSiasn = [
    { title: "Pasangan Ke-", dataIndex: "posisi" },
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tglLahir",
    },
    {
      title: "Jenis Kelamin",
      key: "jk",
      render: (_, row) => {
        return <>{row?.jenisKelamin === "F" ? "Wanita" : "Pria"}</>;
      },
    },
    {
      title: "Status Hidup",
      key: "sh",
      render: (_, row) => {
        return (
          <>
            {statusHidup?.find((item) => item?.id === row?.StatusHidup)?.label}
          </>
        );
      },
    },
    {
      title: "Jenis Kawin",
      key: "jkawin",
      render: (_, row) => {
        return (
          <>
            {
              refJenisKawin?.find((item) => item?.id === row?.JenisKawinId)
                ?.label
            }
          </>
        );
      },
    },
    {
      title: "Tgl Menikah",
      dataIndex: "tgglMenikah",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return <FormAnak pasangan={row} />;
      },
    },
  ];

  // kolom pasangan SIMASTER
  const columnPasanganSimaster = [
    { title: "Pasangan Ke-", dataIndex: "suami_istri_ke" },
    {
      title: "Nama",
      dataIndex: "nama_suami_istri",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lahir",
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => {
        return <>{row?.status_suami_istri?.status_suami_istri}</>;
      },
    },
    {
      title: "Tanggal Menikah",
      key: "tgl_menikah",
      render: (_, row) => {
        return <>{row?.nikah?.tgl_nikah_duda_janda}</>;
      },
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => {
        return (
          <>
            <Button
              shape="round"
              type="primary"
              onClick={() => handleShowModalData(row)}
            >
              Transfer SIASN
            </Button>
          </>
        );
      },
    },
  ];

  const columnAnakSimaster = [
    { title: "Nama", dataIndex: "nama" },
    {
      title: "Jenis Kelamin",
      key: "jk",
      render: (_, row) => <>{row?.jk === "L" ? "Laki-laki" : "Perempuan"}</>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => <>{row?.status_anak?.status_anak}</>,
    },
    { title: "Tanggal Lahir", dataIndex: "tgl_lahir" },
    { title: "Tempat Lahir", dataIndex: "tempat_lahir" },
  ];
  const columnAnakSiasn = [
    { title: "Nama", dataIndex: "nama" },
    {
      title: "Jenis Kelamin",
      key: "jk",
      render: (_, row) => (
        <>{row?.jenisKelamin === "M" ? "Laki-laki" : "Perempuan"}</>
      ),
    },
    {
      title: "Tanggal Lahir",
      key: "tglLahir",
      render: (_, row) => <>{dayjs(row?.tglLahir).format("DD-MM-YYYY")}</>,
    },
  ];

  const {
    data: pasanganSiasn,
    isLoading: loadingPasanganSiasn,
    refetch: refetchPasanganSiasn,
  } = useQuery(["rw-siasn-pasangan"], () => dataPasangan(), {});

  const {
    data: pasanganSimaster,
    isLoading: loadingPasanganSimaster,
    refetch: refetchPasanganSimaster,
  } = useQuery(["rw-simaster-pasangan"], () => rwPasanganMaster());

  const {
    data: anakSiasn,
    isLoading: loadingAnakSiasn,
    refetch: refetchAnakSiasn,
  } = useQuery(["rw-siasn-anak"], () => dataAnak(), {});

  const {
    data: anakSimaster,
    isLoading: loadingAnakSimaster,
    refetch: refetchAnakSimaster,
  } = useQuery(["rw-simaster-anak"], () => rwAnakMaster());

  return (
    <Stack direction="vertical">
      <FormPasangan
        isModalOpen={showModal}
        handleCancel={handleCloseModal}
        dataPasangan={dataModal}
      />
      <Card title="Pasangan SIMASTER">
        <Table
          pagination={false}
          columns={columnPasanganSimaster}
          loading={loadingPasanganSimaster}
          dataSource={pasanganSimaster}
          rowKey={(row) => row?.suami_istri_id}
        />
      </Card>
      <Card title="Pasangan SIASN">
        <Table
          loading={loadingPasanganSiasn}
          pagination={false}
          columns={columnsPasanganSiasn}
          dataSource={pasanganSiasn}
        />
      </Card>
      <Card title="Anak SIASN">
        <Table
          pagination={false}
          columns={columnAnakSiasn}
          dataSource={anakSiasn}
          loading={loadingAnakSiasn}
        />
      </Card>
      <Card title="Anak SIMASTER">
        <Table
          pagination={false}
          columns={columnAnakSimaster}
          dataSource={anakSimaster}
          loading={loadingAnakSimaster}
        />
      </Card>
    </Stack>
  );
}

export default CompareDataKeluarga;
