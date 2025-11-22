import {
  getRwKinerjaPeriodikByNip,
  removeKinerjaPeriodikByNip,
} from "@/services/siasn-services";
import {
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import {
  IconChartBar,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import CreateKinerjaPeriodik from "./CreateKinerjaPeriodik";

const CompareKinerjaPeriodikNip = ({ nip }) => {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery(
    ["kinerja-periodik", nip],
    () => getRwKinerjaPeriodikByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      enabled: !!nip,
    }
  );

  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => removeKinerjaPeriodikByNip(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus data kinerja periodik");
        refetch();
      },
      onError: (error) => {
        message.error("Gagal menghapus data kinerja periodik");
      },
    }
  );

  const handleHapus = async (row) => {
    const payload = {
      id: row.id,
      nip: row.nip,
    };

    await hapus(payload);
  };

  const columns = [
    {
      title: "Tahun & Periode",
      key: "tahun_periode",
      render: (_, row) => (
        <Tooltip
          title={`Tahun: ${row?.tahun || "-"} | Periode: ${row?.bulanMulaiPenilaian || "-"} s/d ${row?.bulanSelesaiPenilaian || "-"}`}
        >
          <div>
            <MantineBadge size="sm" color="blue">
              {row?.tahun || "-"}
            </MantineBadge>
            <MantineText size="xs" style={{ marginTop: 4 }}>
              {row?.bulanMulaiPenilaian || "-"} - {row?.bulanSelesaiPenilaian || "-"}
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan",
      render: (jabatan) => (
        <MantineText size="sm" lineClamp={2}>
          {jabatan || "-"}
        </MantineText>
      ),
    },
    {
      title: "Kuadran & %",
      key: "kuadran_persen",
      render: (_, row) => (
        <Tooltip
          title={`Kuadran: ${row?.kuadranKinerjaNilai || "-"} | Persentase: ${row?.persentase || 0}%`}
        >
          <div>
            <MantineBadge size="sm" color="green">
              Q{row?.kuadranKinerjaNilai || "-"}
            </MantineBadge>
            <MantineText size="xs" style={{ marginTop: 4 }}>
              {row?.persentase || 0}%
            </MantineText>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Koefisien",
      dataIndex: "koefisen",
      render: (koef) => (
        <MantineBadge size="sm" color="cyan">
          {koef || "-"}
        </MantineBadge>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 60,
      align: "center",
      render: (_, row) => (
          <Popconfirm
          title="Hapus Kinerja Periodik"
          description="Apakah anda yakin ingin menghapus data ini?"
            onConfirm={() => handleHapus(row)}
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
      ),
    },
  ];

  return (
    <Card
      id="kinerja-periodik"
      title={
        <Space>
          <IconChartBar size={20} />
          <span>Kinerja Periodik</span>
          <MantineBadge size="sm" color="blue">
            {data?.length || 0} Data
          </MantineBadge>
        </Space>
      }
      extra={
        <Space>
        <CreateKinerjaPeriodik />
          <Tooltip title="Refresh data Kinerja Periodik">
            <Button
              size="small"
              icon={<IconRefresh size={14} />}
              onClick={() => refetch()}
              loading={isFetching}
            />
          </Tooltip>
        </Space>
      }
      style={{ marginTop: 16 }}
    >
        <Table
          pagination={false}
          columns={columns}
          dataSource={data}
        loading={isLoading || isFetching}
        rowClassName={(_, index) =>
          index % 2 === 0 ? "table-row-light" : "table-row-dark"
        }
        size="small"
        scroll={{ x: "max-content" }}
        />
    </Card>
  );
};

export default CompareKinerjaPeriodikNip;
