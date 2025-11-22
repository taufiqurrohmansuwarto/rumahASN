import { rwSkpMasterByNip, urlToPdf } from "@/services/master.services";
import {
  getRwSkp22ByNip,
  postRwSkp22ByNip,
  uploadDokRiwayat,
} from "@/services/siasn-services";
import useFileStore from "@/store/useFileStore";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import {
  IconChartBar,
  IconFileText,
  IconPlus,
  IconSend,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Divider,
  Flex,
  Form,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
  message,
} from "antd";
import { useState } from "react";
import FileUploadSIASN from "../FileUploadSIASN";
import FormCariPNSKinerja from "../FormCariPNSKinerja";
import UploadDokumen from "../UploadDokumen";
import ModalTransferSKP22 from "./ModalTransferSKP22";

// const data = {
//     hasilKinerjaNilai: 0,
//     id: "string",
//     kuadranKinerjaNilai: 0,
//     path: [
//         {
//             dok_id: "string",
//             dok_nama: "string",
//             dok_uri: "string",
//             object: "string",
//             slug: "string"
//         }
//     ],
//     penilaiGolongan: "string",
//     penilaiJabatan: "string",
//     penilaiNama: "string",
//     penilaiNipNrp: "string",
//     penilaiUnorNama: "string",
//     perilakuKerjaNilai: 0,
//     pnsDinilaiOrang: "string",
//     statusPenilai: "string",
//     tahun: 0
// };

const FormSKP22 = ({ visible, onCancel, nip }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const fileList = useFileStore((state) => state.fileList);

  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    try {
      setLoading(true);
      const data = await form.validateFields();

      const payload = {
        nip,
        data,
      };

      const file = fileList?.[0]?.originFileObj;

      if (file) {
        const responseSkp = await postRwSkp22ByNip(payload);
        const idSkp = responseSkp?.id;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_ref_dokumen", "890");
        formData.append("id_riwayat", idSkp);
        await uploadDokRiwayat(formData);
        message.success("Berhasil menambahkan SKP");
        queryClient.invalidateQueries(["data-skp-22", nip]);
        onCancel();
      } else {
        await postRwSkp22ByNip(payload);
        message.success("Berhasil menambahkan SKP");
        queryClient.invalidateQueries(["data-skp-22", nip]);
        onCancel();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleConfirmModal = async () => {
    try {
      await form.validateFields();
      Modal.confirm({
        centered: true,
        title: "Apakah anda yakin?",
        content: `Mohon pastikan semua data dan dokumen yang Anda masukkan selalu terkini dan akurat. Ketidaksesuaian informasi bisa berdampak pada proses layanan kepegawaian pegawai. Ingat, setiap entri data akan dicatat dan dipertanggungjawabkan melalui sistem log Rumah ASN.`,
        okText: "Ya",
        cancelText: "Tidak",
        onOk: async () => await handleFinish(),
      });
    } catch (error) {}
  };

  return (
    <Modal
      title="Tambah SKP SIASN"
      centered
      open={visible}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleConfirmModal}
      width={1000}
    >
      <FileUploadSIASN />
      <Form layout="vertical" form={form}>
        <Form.Item name="hasilKinerjaNilai" label="Hasil Kerja Nilai" required>
          <Select>
            <Select.Option value="1">DIATAS EKSPETASI</Select.Option>
            <Select.Option value="2">SESUAI EKSPETASI</Select.Option>
            <Select.Option value="3">DIBAWAH EKSPETASI</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="perilakuKerjaNilai"
          label="Perilaku Kerja Nilai"
          required
        >
          <Select>
            <Select.Option value="1">DIATAS EKSPETASI</Select.Option>
            <Select.Option value="2">SESUAI EKSPETASI</Select.Option>
            <Select.Option value="3">DIBAWAH EKSPETASI</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="tahun" label="Tahun Penilaian" required>
          <Select>
            <Select.Option value="2024">TAHUN PENILAIAN 2024</Select.Option>
            <Select.Option value="2023">TAHUN PENILAIAN 2023</Select.Option>
            <Select.Option value="2022">TAHUN PENILAIAN 2022</Select.Option>
          </Select>
        </Form.Item>
        <FormCariPNSKinerja
          help="ketik NIP Tanpa Spasi dan tunggu..."
          label="Atasan Penilai"
          name="pns_penilai"
        />
      </Form>
    </Modal>
  );
};

function CompareSKP22ByNip({ nip }) {
  const [visible, setVisible] = useState(false);

  const [openTransfer, setOpenTransfer] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [file, setFile] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);

  const handleOpenTransfer = async (data) => {
    setLoadingFile(true);
    try {
      const currentFile = data?.file_skp;

      if (!currentFile) {
        setOpenTransfer(true);
        setCurrentData(data);
      } else {
        const response = await urlToPdf({ url: currentFile });
        const file = new File([response], "file.pdf", {
          type: "application/pdf",
        });
        setFile(file);
        setOpenTransfer(true);
        setCurrentData(data);
      }
      setLoadingFile(false);
    } catch (error) {
      setLoadingFile(false);
    }
  };

  const handleCloseTransfer = () => {
    setOpenTransfer(false);
    setCurrentData(null);
  };

  const handleVisible = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const { data, isLoading } = useQuery(
    ["data-skp-22", nip],
    () => getRwSkp22ByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: dataMaster, isLoading: isLoadingMaster } = useQuery(
    ["data-master-skp-by-nip", nip],
    () => rwSkpMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columns = [
    {
      title: "Tahun",
      dataIndex: "tahun",
      width: 80,
      align: "center",
      render: (tahun) => (
        <MantineBadge size="sm" color="violet">
          {tahun}
        </MantineBadge>
      ),
    },
    {
      title: "Hasil Kinerja",
      key: "hasil_kinerja",
      width: 150,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.hasilKinerja}
          </MantineText>
          <MantineBadge size="xs" color="blue">
            Nilai: {record?.hasilKinerjaNilai}
          </MantineBadge>
        </div>
      ),
    },
    {
      title: "Perilaku Kerja",
      key: "perilaku_kerja",
      width: 150,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.perilakuKerja}
          </MantineText>
          <MantineBadge size="xs" color="green">
            Nilai: {record?.PerilakuKerjaNilai}
          </MantineBadge>
        </div>
      ),
    },
    {
      title: "Kuadran",
      dataIndex: "kuadranKinerja",
      width: 120,
      render: (kuadranKinerja) => (
        <MantineBadge size="sm" color="orange" tt="none">
          {kuadranKinerja}
        </MantineBadge>
      ),
    },
    {
      title: "Penilai",
      key: "penilai",
      width: 220,
      render: (_, record) => (
        <div>
          <MantineText size="sm" fw={500}>
            {record?.namaPenilai}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.nipNrpPenilai} - {record?.statusPenilai}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.penilaiUnorNm}
          </MantineText>
        </div>
      ),
    },
    {
      title: "Dokumen",
      key: "file",
      width: 100,
      render: (_, record) => (
        <>
          {record?.path?.[890] && (
            <a
              href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[890]?.dok_uri}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button size="small" icon={<IconFileText size={14} />}>
                SKP
              </Button>
            </a>
          )}
        </>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 80,
      align: "center",
      render: (_, row) => {
        return (
          <UploadDokumen
            id={row?.id}
            idRefDokumen={"890"}
            invalidateQueries={["data-skp-22"]}
            nama="Kinerja"
          />
        );
      },
    },
  ];

  const columnMaster = [
    {
      title: "Tahun",
      dataIndex: "tahun",
      width: 80,
      align: "center",
      render: (tahun) => (
        <MantineBadge size="sm" color="violet">
          {tahun}
        </MantineBadge>
      ),
    },
    {
      title: "Hasil Kerja",
      dataIndex: "hasil_kerja",
      width: 150,
      render: (hasil_kerja) => (
        <MantineText size="sm" fw={500}>
          {hasil_kerja}
        </MantineText>
      ),
    },
    {
      title: "Perilaku Kerja",
      dataIndex: "perilaku",
      width: 150,
      render: (perilaku) => (
        <MantineText size="sm" fw={500}>
          {perilaku}
        </MantineText>
      ),
    },
    {
      title: "Dokumen",
      key: "file_skp",
      width: 100,
      render: (_, record) => (
        <>
          {record?.file_skp && (
            <a href={record.file_skp} target="_blank" rel="noreferrer">
              <Button size="small" icon={<IconFileText size={14} />}>
                SKP
              </Button>
            </a>
          )}
        </>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 80,
      align: "center",
      render: (_, row) => {
        const tahun = row?.tahun;
        const tahunTransfer =
          tahun === 2024 || tahun === 2023 || tahun === 2022;

        if (tahunTransfer) {
          return (
            <Tooltip title="Transfer">
              <Button
                size="small"
                type="primary"
                icon={<IconSend size={14} />}
                onClick={() => handleOpenTransfer(row)}
                loading={loadingFile && currentData?.skp_id === row?.skp_id}
                style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
              />
            </Tooltip>
          );
        } else {
          return null;
        }
      },
    },
  ];

  return (
    <div>
      <Card
        id="kinerja"
        title={
          <Space>
            <IconChartBar size={20} color="#722ed1" />
            <Typography.Title level={4} style={{ margin: 0 }}>
              Komparasi Kinerja (SKP)
            </Typography.Title>
          </Space>
        }
      >
      <ModalTransferSKP22
        nip={nip}
        open={openTransfer}
        data={currentData}
        onCancel={handleCloseTransfer}
        file={file}
        loadingFile={loadingFile}
      />
      <Stack>
        <FormSKP22 visible={visible} onCancel={handleCancel} nip={nip} />
        <div id="kinerja-siasn">
          <Alert
            showIcon
            type="info"
            description="Jika terjadi kesalahan pada data SKP SIASN, gunakan tahun yang sama dengan data yang baru. Data yang lama akan direplace dengan data yang baru."
              style={{ marginBottom: 16 }}
          />
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 16 }}
            >
              <Space>
                <MantineText fw={600} size="sm">
                  SIASN
                </MantineText>
                <MantineBadge size="sm" variant="light" color="blue">
                  {data?.length || 0}
                </MantineBadge>
              </Space>
            <Button
                icon={<IconPlus size={16} />}
              type="primary"
              onClick={handleVisible}
            >
              Tambah
            </Button>
          </Flex>
          <Table
              title={null}
            pagination={false}
            columns={columns}
            loading={isLoading}
            rowKey={(row) => row?.id}
            dataSource={data}
              size="middle"
              scroll={{ x: 900 }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "table-row-light" : "table-row-dark"
              }
          />
        </div>

          <Divider />

        <div id="kinerja-simaster">
            <Space style={{ marginBottom: 16 }}>
              <MantineText fw={600} size="sm">
                SIMASTER
              </MantineText>
              <MantineBadge size="sm" variant="light" color="orange">
                {dataMaster?.length || 0}
              </MantineBadge>
            </Space>
          <Table
              title={null}
            pagination={false}
            columns={columnMaster}
            loading={isLoadingMaster}
            rowKey={(row) => row?.skp_id}
            dataSource={dataMaster}
              size="middle"
              scroll={{ x: 600 }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "table-row-light" : "table-row-dark"
              }
          />
        </div>
      </Stack>
    </Card>
    </div>
  );
}

export default CompareSKP22ByNip;
