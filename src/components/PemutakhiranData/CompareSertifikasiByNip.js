import { getRwSertifikasiByNipMaster } from "@/services/master.services";
import {
  deleteSertifikasiByNip,
  riwayatSertifikasiByNip,
} from "@/services/siasn-services";
import { Badge as MantineBadge, Stack, Text as MantineText } from "@mantine/core";
import {
  IconCertificate,
  IconFileText,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  message,
  Popconfirm,
  Space,
  Table,
  Tooltip,
} from "antd";
import CreateSertifikasiSIASN from "./CreateSertifikasiSIASN";
import UploadDokumen from "./UploadDokumen";

const CompareSertifikasiByNip = ({ nip }) => {
  const {
    data,
    isLoading,
    refetch: refetchSiasn,
    isFetching: isFetchingSiasn,
  } = useQuery({
    queryKey: ["sertifikasi", nip],
    queryFn: () => riwayatSertifikasiByNip(nip),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!nip,
  });

  const {
    data: dataMaster,
    isLoading: isLoadingMaster,
    refetch: refetchMaster,
    isFetching: isFetchingMaster,
  } = useQuery({
    queryKey: ["sertifikasi-master", nip],
    queryFn: () => getRwSertifikasiByNipMaster(nip),
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    enabled: !!nip,
  });

  const { mutate: hapusSertifikasi, isLoading: isLoadingHapus } = useMutation(
    (data) => deleteSertifikasiByNip(data),
    {
      onSuccess: () => {
        message.success("Sertifikasi berhasil dihapus");
        refetchSiasn();
      },
      onError: (error) => {
        message.error(
          error?.response?.data?.message || "Gagal menghapus sertifikasi"
        );
      },
    }
  );

  const columnsMaster = [
    {
      title: "Dok",
      key: "file",
      width: 60,
      align: "center",
      render: (_, row) => {
        return (
          <>
            {row?.file_kompetensi && (
              <a href={row?.file_kompetensi} target="_blank" rel="noreferrer">
                <Button size="small" icon={<IconFileText size={14} />} />
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Nomor SK & Tanggal",
      key: "nomor_tgl",
      render: (_, row) => (
        <Tooltip
          title={`Nomor: ${row?.no_sk || "-"} | Tanggal: ${row?.tgl_sk || "-"}`}
        >
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.no_sk || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.tgl_sk || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Jabatan & Jenjang",
      key: "jabatan",
      render: (_, row) => (
        <Tooltip
          title={`${row?.jft?.name || ""} ${row?.jft?.jenjang_jab ? `- ${row?.jft?.jenjang_jab}` : ""}`}
        >
          <div>
            <MantineText size="sm" lineClamp={1}>
              {row?.jft?.name || "-"}
            </MantineText>
            {row?.jft?.jenjang_jab && (
              <MantineBadge size="xs" color="blue" tt="none">
                {row?.jft?.jenjang_jab}
              </MantineBadge>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 80,
      align: "center",
      render: (_, row) => {
        return <CreateSertifikasiSIASN nip={nip} row={row} type="transfer" />;
      },
    },
  ];

  const columns = [
    {
      title: "Dok",
      key: "file",
      width: 80,
      align: "center",
      render: (_, row) => {
        return (
          <Space direction="vertical" size={4}>
            {row?.path?.[1683] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1683]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />}>
                  1683
                </Button>
              </a>
            )}
            {row?.path?.[1680] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1680]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button size="small" icon={<IconFileText size={14} />}>
                  1680
                </Button>
              </a>
            )}
          </Space>
        );
      },
    },
    {
      title: "Jenis & Nama",
      key: "jenis_nama",
      render: (_, row) => (
        <Tooltip
          title={`Jenis: ${row?.jenisSertifikasiNama || "-"} | Nama: ${row?.namaSertifikasi || "-"}`}
        >
          <div>
            <MantineBadge size="xs" color="blue" tt="none" style={{ marginBottom: 4 }}>
              {row?.jenisSertifikasiNama || "-"}
            </MantineBadge>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.namaSertifikasi || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "No. & Tgl. Sertifikat",
      key: "no_tgl",
      render: (_, row) => (
        <Tooltip
          title={`Nomor: ${row?.noSertifikat || "-"} | Tanggal: ${row?.tanggalSertifikat || "-"}`}
        >
          <div>
            <MantineText size="sm" lineClamp={1}>
              {row?.noSertifikat || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.tanggalSertifikat || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Masa Berlaku",
      key: "masa_berlaku",
      render: (_, row) => (
        <Tooltip
          title={`Mulai: ${row?.masaBerlakuSertMulai || "-"} | Selesai: ${row?.masaBerlakuSertSelesai || "-"}`}
        >
          <div>
            <MantineText size="xs">
              {row?.masaBerlakuSertMulai || "-"}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              s/d {row?.masaBerlakuSertSelesai || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Gelar",
      key: "gelar",
      render: (_, row) => (
        <Tooltip
          title={`Depan: ${row?.gelarDepanSert || "-"} | Belakang: ${row?.gelarBelakangSert || "-"}`}
        >
          <Space size={4}>
            {row?.gelarDepanSert && (
              <MantineBadge size="xs" color="cyan" tt="none">
                {row?.gelarDepanSert}
              </MantineBadge>
            )}
            {row?.gelarBelakangSert && (
              <MantineBadge size="xs" color="grape" tt="none">
                {row?.gelarBelakangSert}
              </MantineBadge>
            )}
            {!row?.gelarDepanSert && !row?.gelarBelakangSert && (
              <MantineText size="xs" c="dimmed">
                -
              </MantineText>
            )}
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Lembaga & Sumber",
      key: "lembaga_sumber",
      render: (_, row) => (
        <Tooltip
          title={`Lembaga: ${row?.lembagaSertifikasiNama || "-"} | Sumber: ${row?.sumber || "-"}`}
        >
          <div>
            <MantineText size="sm" lineClamp={1}>
              {row?.lembagaSertifikasiNama || "-"}
            </MantineText>
            <MantineBadge size="xs" color="green" tt="none">
              {row?.sumber || "-"}
            </MantineBadge>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 100,
      align: "center",
      render: (_, row) => {
        return (
          <Space size="small">
            <Popconfirm
              title="Hapus Sertifikasi"
              description="Apakah anda yakin ingin menghapus sertifikasi ini?"
              onConfirm={() => hapusSertifikasi({ nip, id: row?.id })}
              okText="Ya"
              cancelText="Tidak"
            >
              <Button
                size="small"
                danger
                icon={<IconTrash size={14} />}
                loading={isLoadingHapus}
              />
            </Popconfirm>
              <UploadDokumen
                id={row?.id}
                idRefDokumen={"1683"}
                invalidateQueries={["sertifikasi", nip]}
                nama="Sertifikasi"
              />
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <Space>
          <IconCertificate size={20} />
          <span>Data Sertifikasi</span>
          <MantineBadge size="sm" color="blue">
            SIMASTER: {dataMaster?.length || 0}
          </MantineBadge>
          <MantineBadge size="sm" color="green">
            SIASN: {data?.length || 0}
          </MantineBadge>
        </Space>
      }
      extra={<CreateSertifikasiSIASN nip={nip} />}
      style={{ marginTop: 16 }}
    >
      <Stack>
      <Table
        title={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <MantineText fw="bold">SIMASTER</MantineText>
              <Tooltip title="Refresh data SIMASTER">
              <Button
                  size="small"
                  icon={<IconRefresh size={14} />}
                  onClick={() => refetchMaster()}
                  loading={isFetchingMaster}
                />
              </Tooltip>
            </div>
        )}
        loading={isLoadingMaster || isFetchingMaster}
        columns={columnsMaster}
        pagination={false}
        dataSource={dataMaster}
        rowKey={(row) => row?.kompetensi_id}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          size="small"
          scroll={{ x: "max-content" }}
      />
      <Table
        title={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <MantineText fw="bold">SIASN</MantineText>
              <Tooltip title="Refresh data SIASN">
                <Button
                  size="small"
                  icon={<IconRefresh size={14} />}
                  onClick={() => refetchSiasn()}
                  loading={isFetchingSiasn}
                />
              </Tooltip>
            </div>
        )}
          loading={isLoading || isFetchingSiasn}
        columns={columns}
        pagination={false}
        dataSource={data}
        rowKey={(row) => row?.id}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          size="small"
          scroll={{ x: "max-content" }}
      />
      </Stack>
    </Card>
  );
};

export default CompareSertifikasiByNip;
