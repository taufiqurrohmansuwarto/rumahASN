import { rwPasanganByNip } from "@/services/master.services";
import { dataPasanganByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Image, Modal, Space, Table, Typography } from "antd";
import { useState } from "react";
import CompareAnakByNip from "./CompareAnakByNip";
import FormAnakByNip from "./FormAnakByNip";

const DetailPasanganModal = ({ showModal, handleCloseModal, dataModal }) => {
  return (
    <Modal open={showModal} onCancel={handleCloseModal}>
      <Typography.Title level={5}>Detail Pasangan</Typography.Title>
      <Typography.Text>{JSON.stringify(dataModal)}</Typography.Text>
    </Modal>
  );
};

function CompareDataPasanganByNip({ nip }) {
  const [showModal, setShowModal] = useState(false);
  const [dataModal, setDataModal] = useState(null);

  const handleShowModal = (data) => {
    setShowModal(true);
    setDataModal(data);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDataModal(null);
  };

  const { data: dataPasanganMaster, isLoading: isLoadingPasanganMaster } =
    useQuery(["data-pasangan-master", nip], () => rwPasanganByNip(nip), {});

  const { data: dataPasanganSiasn, isLoading: isLoadingPasanganSiasn } =
    useQuery(["data-pasangan-siasn", nip], () => dataPasanganByNip(nip), {});

  const columns = [
    {
      title: "Pasangan ke",
      dataIndex: "suami_istri_ke",
    },
    {
      title: "Foto",
      key: "foto",
      render: (_, row) => (
        <Space>
          <Image
            alt="foto"
            src={row?.file_foto_suami_istri}
            width={"auto"}
            height={50}
            style={{ borderRadius: 10 }}
          />
          <Image
            alt="foto"
            src={row?.file_ktp_suami_istri}
            width={"auto"}
            height={50}
            style={{ borderRadius: 10 }}
          />
        </Space>
      ),
    },
    {
      title: "Nama",
      dataIndex: "nama_suami_istri",
    },
    {
      title: "NIK",
      dataIndex: "nik",
    },
    {
      title: "Tempat Lahir",
      dataIndex: "tempat_lahir",
    },
    {
      title: "Tgl. Lahir",
      dataIndex: "tgl_lahir",
    },
    {
      title: "Pekerjaan",
      key: "pekerjaan",
      render: (_, row) => row?.ref_pekerjaan?.pekerjaan,
    },
    {
      title: "NIP",
      dataIndex: "nip_nrp",
    },
    {
      title: "Instansi",
      dataIndex: "instansi",
    },
    {
      title: "Tunjangan",
      dataIndex: "tunjangan",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => (
        <Button onClick={() => handleShowModal(row?.nikah)}>Lihat</Button>
      ),
    },
  ];

  const columnsSiasn = [
    {
      title: "Pasangan ke",
      key: "pasangan_ke",
      render: (_, row) => row?.dataPernikahan?.posisi,
    },
    {
      title: "Nama",
      key: "nama",
      render: (_, row) => row?.orang?.nama,
    },
    {
      title: "Tgl. Lahir",
      key: "tgl_lahir",
      render: (_, row) => row?.orang?.tglLahir,
    },
    {
      title: "Status Menikah",
      key: "status_menikah",
      render: (_, row) => row?.statusNikah,
    },
    {
      title: "Tgl. Menikah",
      key: "tgl_menikah",
      render: (_, row) => row?.dataPernikahan?.tgglMenikah,
    },
    {
      title: "Akta Menikah",
      key: "akta_menikah",
      render: (_, row) => row?.dataPernikahan?.aktaMenikah,
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => <FormAnakByNip nip={nip} pasangan={row} />,
    },
  ];

  return (
    <Stack>
      <Table
        title={() => <Typography.Title level={5}>SIMASTER</Typography.Title>}
        pagination={false}
        loading={isLoadingPasanganMaster}
        columns={columns}
        dataSource={dataPasanganMaster}
      />
      <Table
        title={() => <Typography.Title level={5}>SIASN</Typography.Title>}
        pagination={false}
        loading={isLoadingPasanganSiasn}
        columns={columnsSiasn}
        dataSource={dataPasanganSiasn?.listPasangan}
      />
      <CompareAnakByNip nip={nip} />
      <DetailPasanganModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        dataModal={dataModal}
      />
    </Stack>
  );
}

export default CompareDataPasanganByNip;
