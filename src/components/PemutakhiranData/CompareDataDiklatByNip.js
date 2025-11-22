import {
  getRwDiklatByNip,
  removeDiklatKursusById,
} from "@/services/siasn-services";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import {
  IconBook,
  IconFileText,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Popconfirm,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tooltip,
  message,
} from "antd";
import { useRouter } from "next/router";
import CompareDataDiklatMasterByNip from "./CompareDataDiklatMasterByNip";
import UploadDokumen from "./UploadDokumen";

const TableDiklat = ({ data, isLoading, onRefresh }) => {
  const columns = [
    {
      title: "Dok",
      key: "file",
      width: 80,
      align: "center",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[874] && (
              <Tooltip title="Sertifikat Diklat">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[874]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    size="small"
                    type="link"
                    icon={<IconFileText size={14} />}
                  />
                </a>
              </Tooltip>
            )}
          </>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Nama Diklat",
      dataIndex: "latihanStrukturalNama",
      width: 250,
      render: (text) => (
        <Tooltip title={text}>
          <MantineText size="sm" fw={500} lineClamp={2}>
            {text}
          </MantineText>
        </Tooltip>
      ),
    },
    {
      title: "Nomor & Tanggal",
      key: "nomor_tanggal",
      width: 180,
      render: (_, record) => (
        <div>
          <MantineText size="xs" fw={500} lineClamp={1}>
            {record?.nomor}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {record?.tanggalSelesai}
          </MantineText>
        </div>
      ),
    },
    {
      title: "Penyelenggara",
      dataIndex: "institusiPenyelenggara",
      width: 200,
      render: (text) => (
        <Tooltip title={text}>
          <MantineText size="xs" lineClamp={2}>
            {text}
          </MantineText>
        </Tooltip>
      ),
    },
    {
      title: "Jam",
      dataIndex: "jumlahJam",
      width: 80,
      align: "center",
      render: (jam) => (
        <MantineBadge size="sm" color="blue">
          {jam}
        </MantineBadge>
      ),
    },
  ];
  return (
    <Table
      title={() => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MantineText fw="bold">Data Diklat</MantineText>
          <Tooltip title="Refresh data Diklat">
            <Button
              size="small"
              icon={<IconRefresh size={14} />}
              onClick={onRefresh}
              loading={isLoading}
            />
          </Tooltip>
        </div>
      )}
      columns={columns}
      pagination={false}
      rowKey={(row) => row?.id}
      dataSource={data}
      rowClassName={(_, index) =>
        index % 2 === 0 ? "table-row-light" : "table-row-dark"
      }
      size="small"
      scroll={{ x: 800 }}
    />
  );
};

const TableKursus = ({ data, isLoading, onRefresh }) => {
  const router = useRouter();
  const nip = router.query?.nip;

  const queryClient = useQueryClient();
  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => removeDiklatKursusById(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus data");
        queryClient.invalidateQueries(["riwayat-diklat-by-nip"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["riwayat-diklat-by-nip"]);
      },
      onError: () => {
        message.error("Gagal menghapus data");
      },
    }
  );

  const handleHapus = async (data) => {
    const payload = {
      nip,
      id: data?.id,
    };
    await hapus(payload);
  };

  const columns = [
    {
      title: "Dok",
      key: "file",
      width: 80,
      align: "center",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[881] && (
              <Tooltip title="Sertifikat Kursus">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[881]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    size="small"
                    type="link"
                    icon={<IconFileText size={14} />}
                  />
                </a>
              </Tooltip>
            )}
          </>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Nama Kursus, Jenis, Penyelenggara",
      key: "kursusJenisPenyelenggara",
      responsive: ["xs"],
      render: (text) => {
        return (
          <Stack>
            <MantineText size="sm" fw={500}>
              {text?.namaKursus}
            </MantineText>
            <MantineBadge size="xs">{text?.jenisKursusSertifikat}</MantineBadge>
            <MantineText size="xs" c="dimmed">
              {text?.institusiPenyelenggara}
            </MantineText>
          </Stack>
        );
      },
    },
    {
      title: "Nama Kursus & Jenis",
      key: "nama_jenis",
      width: 220,
      render: (_, record) => (
        <Tooltip title={record?.namaKursus}>
          <div>
            <MantineText size="sm" fw={500} lineClamp={2}>
              {record?.namaKursus}
            </MantineText>
            <MantineBadge size="xs" color="green" tt="none">
              {record?.jenisKursusSertifikat}
            </MantineBadge>
          </div>
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "No. Sertifikat & Tahun",
      key: "sertifikat",
      width: 150,
      render: (_, record) => (
        <div>
          <MantineText size="xs" fw={500}>
            {record?.noSertipikat}
          </MantineText>
          <MantineBadge size="xs" color="blue">
            {record?.tahunKursus}
          </MantineBadge>
        </div>
      ),
    },
    {
      title: "Periode",
      key: "tgl",
      width: 140,
      render: (_, row) => (
        <div>
          <MantineText size="xs">{row?.tanggalKursus}</MantineText>
          <MantineText size="xs" c="dimmed">
            {row?.tanggalSelesaiKursus}
          </MantineText>
        </div>
      ),
    },
    {
      title: "Penyelenggara",
      dataIndex: "institusiPenyelenggara",
      width: 180,
      render: (text) => (
        <Tooltip title={text}>
          <MantineText size="xs" lineClamp={2}>
            {text}
          </MantineText>
        </Tooltip>
      ),
      responsive: ["sm"],
    },
    {
      title: "Jam",
      dataIndex: "jumlahJam",
      width: 70,
      align: "center",
      render: (jam) => (
        <MantineBadge size="sm" color="orange">
          {jam}
        </MantineBadge>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 110,
      align: "center",
      render: (_, row) => {
        return (
          <Space size="small">
            <Popconfirm
              title="Hapus data kursus?"
              onConfirm={() => handleHapus(row)}
            >
              <Tooltip title="Hapus">
                <Button
                  size="small"
                  danger
                  icon={<IconTrash size={14} />}
                  loading={isLoadingHapus}
                />
              </Tooltip>
            </Popconfirm>
            <UploadDokumen
              id={row?.id}
              invalidateQueries={["riwayat-diklat-by-nip"]}
              idRefDokumen={"881"}
              nama={"Kursus"}
            />
          </Space>
        );
      },
    },
  ];
  return (
    <Table
      title={() => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MantineText fw="bold">Data Kursus</MantineText>
          <Tooltip title="Refresh data Kursus">
            <Button
              size="small"
              icon={<IconRefresh size={14} />}
              onClick={onRefresh}
              loading={isLoading}
            />
          </Tooltip>
        </div>
      )}
      pagination={false}
      columns={columns}
      dataSource={data}
      rowKey={(row) => row?.id}
      rowClassName={(_, index) =>
        index % 2 === 0 ? "table-row-light" : "table-row-dark"
      }
      size="small"
      scroll={{ x: 1000 }}
    />
  );
};

function CompareDataDiklatByNip({ nip }) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["riwayat-diklat-by-nip", nip],
    () => getRwDiklatByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const handleRefresh = () => {
    queryClient.invalidateQueries(["riwayat-diklat-by-nip", nip]);
  };

  return (
    <Card
      title={
        <Space>
          <IconBook size={20} />
          <span>Data Riwayat Diklat dan Kursus</span>
          <MantineBadge size="sm" color="blue">
            Kursus: {data?.kursus?.length || 0}
          </MantineBadge>
          <MantineBadge size="sm" color="green">
            Diklat: {data?.diklat?.length || 0}
          </MantineBadge>
        </Space>
      }
    >
      <Tabs
        type="card"
        style={{
          marginTop: 16,
        }}
      >
        <Tabs.TabPane key="diklat-master" tab="SIMASTER">
          <CompareDataDiklatMasterByNip nip={nip} />
        </Tabs.TabPane>
        <Tabs.TabPane key="diklat-siasn" tab="SIASN">
          <Stack>
            <Skeleton loading={isLoading}>
              <TableKursus
                data={data?.kursus}
                isLoading={isLoading}
                onRefresh={handleRefresh}
              />
              <TableDiklat
                data={data?.diklat}
                isLoading={isLoading}
                onRefresh={handleRefresh}
              />
            </Skeleton>
          </Stack>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  );
}

export default CompareDataDiklatByNip;
