import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge as MantineBadge, Stack, Text as MantineText } from "@mantine/core";
import { IconRefresh, IconUsers } from "@tabler/icons-react";
import { Button, Card, Space, Table, Tooltip } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { dataAnakByNip, dataPasanganByNip } from "@/services/siasn-services";
import { rwAnakByNip } from "@/services/master.services";
import { refJenisAnak } from "@/utils/data-utils";

function CompareAnakByNip() {
  const router = useRouter();
  const { nip } = router.query;

  const {
    data: dataAnak,
    isLoading: loadingAnak,
    refetch: refetchAnak,
    isFetching: isFetchingAnak,
  } = useQuery({
    queryKey: ["anak-siasn", nip],
    queryFn: () => dataAnakByNip(nip),
    enabled: !!nip,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const {
    data: dataAnakSimaster,
    isLoading: loadingAnakSimaster,
    refetch: refetchAnakSimaster,
    isFetching: isFetchingAnakSimaster,
  } = useQuery({
    queryKey: ["anak-simaster", nip],
    queryFn: () => rwAnakByNip(nip),
    enabled: !!nip,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
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
    {
      title: "Nama & Gender",
      key: "nama",
      render: (_, row) => (
        <Tooltip title={`${row?.nama} - ${row?.jenisKelamin === "M" ? "Pria" : "Wanita"}`}>
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.nama}
            </MantineText>
            <MantineBadge size="xs" color={row?.jenisKelamin === "M" ? "blue" : "pink"}>
              {row?.jenisKelamin === "M" ? "Pria" : "Wanita"}
            </MantineBadge>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Tanggal Lahir",
      key: "tglLahir",
      render: (_, row) => (
        <MantineText size="xs">
          {dayjs(row?.tglLahir).format("DD-MM-YYYY")}
        </MantineText>
      ),
    },
    {
      title: "Ayah & Status",
      key: "ayah_status",
      render: (_, row) => {
        const ayah = dataPasanganSiasn?.find((item) => item?.id === row?.ayahId)?.nama;
        const status = refJenisAnak.find((item) => item?.id === row?.jenisAnak)?.label;
        return (
          <Tooltip title={`Ayah: ${ayah || "Tidak tersedia"} - Status: ${status || "Tidak tersedia"}`}>
            <div>
              <MantineText size="xs" lineClamp={1}>
                {ayah || "Tidak tersedia"}
              </MantineText>
              <MantineBadge size="xs" color="green" tt="none" style={{ marginTop: 2 }}>
                {status || "Tidak tersedia"}
              </MantineBadge>
            </div>
          </Tooltip>
        );
      },
    },
  ];

  const columnsSimaster = [
    {
      title: "Nama & Gender",
      key: "nama",
      render: (_, row) => (
        <Tooltip title={`${row?.nama} - ${row?.jk === "L" ? "Pria" : "Wanita"}`}>
          <div>
            <MantineText size="sm" fw={500} lineClamp={1}>
              {row?.nama}
            </MantineText>
            <MantineBadge size="xs" color={row?.jk === "L" ? "blue" : "pink"}>
              {row?.jk === "L" ? "Pria" : "Wanita"}
            </MantineBadge>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lahir",
      render: (tgl) => (
        <MantineText size="xs">
          {tgl}
        </MantineText>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, row) => (
        <MantineBadge size="sm" color="green" tt="none">
          {row?.status_anak?.status_anak || "Tidak tersedia"}
        </MantineBadge>
      ),
    },
  ];
  return (
    <Card
      title={
        <Space>
          <IconUsers size={20} />
          <span>Data Anak</span>
          <MantineBadge size="sm" color="blue">
            SIMASTER: {dataAnakSimaster?.length || 0}
          </MantineBadge>
          <MantineBadge size="sm" color="green">
            SIASN: {dataAnak?.length || 0}
          </MantineBadge>
        </Space>
      }
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
                  onClick={() => refetchAnakSimaster()}
                  loading={isFetchingAnakSimaster}
                />
              </Tooltip>
            </div>
          )}
          pagination={false}
          columns={columnsSimaster}
          dataSource={dataAnakSimaster}
          loading={loadingAnakSimaster || isFetchingAnakSimaster}
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
                  onClick={() => refetchAnak()}
                  loading={isFetchingAnak}
                />
              </Tooltip>
            </div>
          )}
          pagination={false}
          columns={columns}
          dataSource={dataAnak}
          loading={loadingAnak || isFetchingAnak}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          size="small"
          scroll={{ x: "max-content" }}
        />
      </Stack>
    </Card>
  );
}

export default CompareAnakByNip;
