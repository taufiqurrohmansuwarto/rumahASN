import {
  getOpdFasilitator,
  getOpdFasilitatorFull,
} from "@/services/master.services";
import { getPengadaanParuhWaktu } from "@/services/siasn-services";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { Text } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Space, Table, Typography } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { createColumns } from "./DaftarPegawaiParuhWaktuColumns";
import DaftarPegawaiParuhWaktuFilter from "./DaftarPegawaiParuhWaktuFilter";
import ModalDetailParuhWaktu from "./ModalDetailParuhWaktu";
import { useDownloadParuhWaktu } from "./useDownloadParuhWaktu";

const { Title } = Typography;

const DaftarPegawaiParuhWaktu = () => {
  const router = useRouter();
  const {
    page = 1,
    limit = 10,
    nama,
    nip,
    no_peserta,
    opd_id,
    min_gaji,
    max_gaji,
    unor_type = "simaster",
    is_blud,
    luar_perangkat_daerah,
    unor_match,
  } = router.query;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const handleShowDetail = (record) => {
    setSelectedData(record);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedData(null);
  };

  const { data: unor, isLoading: isLoadingUnor } = useQuery(
    ["unor-fasilitator"],
    () => getOpdFasilitator(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: unorFull, isLoading: isLoadingUnorFull } = useQuery(
    ["unor-fasilitator-full-master"],
    () => getOpdFasilitatorFull(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["daftar-pegawai-paruh-waktu", router?.query],
    queryFn: () => getPengadaanParuhWaktu(router?.query),
    enabled: !!router?.query,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const { handleDownload, isMutating } = useDownloadParuhWaktu(router.query);

  const handleSearch = (field, value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        [field]: value || undefined,
        page: 1,
      },
    });
  };

  const handleGajiChange = (field, value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        [field]: value || undefined,
        page: 1,
      },
    });
  };

  const handleGajiRangeChange = (minValue, maxValue) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        min_gaji: minValue || undefined,
        max_gaji: maxValue || undefined,
        page: 1,
      },
    });
  };

  const handleUnorTypeChange = (value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        unor_type: value || undefined,
        page: 1,
      },
    });
  };

  const handleTreeSelectChange = (value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        opd_id: value || undefined,
        page: 1,
      },
    });
  };

  const handleFilterChange = (field, value) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        [field]: value || undefined,
        page: 1,
      },
    });
  };

  const clearFilter = () => {
    router.push({
      pathname: router.pathname,
      query: { page: 1 },
    });
  };

  const columns = createColumns(handleShowDetail, data?.has_action);
  const hasFilter =
    nama ||
    nip ||
    no_peserta ||
    opd_id ||
    min_gaji ||
    max_gaji ||
    is_blud ||
    luar_perangkat_daerah ||
    unor_match;

  return (
    <div>
      <div style={{ maxWidth: "100%" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "none",
          }}
        >
          {/* Header Section */}
          <div
            style={{
              background: "#FF4500",
              color: "white",
              padding: "24px",
              textAlign: "center",
              borderRadius: "12px 12px 0 0",
              margin: "-24px -24px 0 -24px",
            }}
          >
            <IconUsers size={24} style={{ marginBottom: "8px" }} />
            <Title level={3} style={{ color: "white", margin: 0 }}>
              Pegawai Paruh Waktu
            </Title>
            <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px" }}>
              Data pegawai PPPK paruh waktu
            </Text>
          </div>

          {/* Filter Section */}
          <DaftarPegawaiParuhWaktuFilter
            nama={nama}
            nip={nip}
            no_peserta={no_peserta}
            opd_id={opd_id}
            min_gaji={min_gaji}
            max_gaji={max_gaji}
            unor_type={unor_type}
            is_blud={is_blud}
            luar_perangkat_daerah={luar_perangkat_daerah}
            unor_match={unor_match}
            unor={unor}
            hasFilter={hasFilter}
            onSearch={handleSearch}
            onTreeSelectChange={handleTreeSelectChange}
            onGajiChange={handleGajiChange}
            onUnorTypeChange={handleUnorTypeChange}
            onFilterChange={handleFilterChange}
            onClearFilter={clearFilter}
          />

          {/* Total Gaji Section */}
          {data?.total_gaji !== undefined && (
            <div
              style={{
                padding: "16px",
                background: "#f5f5f5",
                borderRadius: "8px",
                marginTop: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <Text fw={600} size="sm" c="dimmed">
                    Total Gaji:
                  </Text>
                  <Text
                    fw={700}
                    size="lg"
                    c="green"
                    style={{ marginLeft: "8px" }}
                  >
                    Rp {Number(data?.total_gaji || 0).toLocaleString("id-ID")}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Total Records: {data?.total || 0}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div
            style={{
              padding: "12px 0",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Space wrap>
              <Button
                icon={<ReloadOutlined />}
                loading={isLoading || isRefetching}
                onClick={() => refetch()}
                style={{ borderRadius: 6, fontWeight: 500 }}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={isMutating}
                onClick={handleDownload}
                style={{
                  background: "#FF4500",
                  borderColor: "#FF4500",
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                Unduh Data
              </Button>
            </Space>
          </div>

          {/* Table Section */}
          <div style={{ marginTop: "16px" }}>
            <Table
              columns={columns}
              dataSource={data?.data}
              rowKey="id"
              loading={isLoading || isFetching}
              scroll={{ x: 970 }}
              size="middle"
              style={{
                borderRadius: "12px",
                overflow: "hidden",
              }}
              pagination={{
                position: ["bottomRight"],
                total: data?.total || 0,
                pageSize: parseInt(limit),
                current: parseInt(page),
                showSizeChanger: false,
                onChange: (newPage) => {
                  router.push({
                    pathname: router.pathname,
                    query: {
                      ...router.query,
                      page: newPage,
                    },
                  });
                },
                showTotal: (total, range) =>
                  `${range[0].toLocaleString(
                    "id-ID"
                  )}-${range[1].toLocaleString(
                    "id-ID"
                  )} dari ${total.toLocaleString("id-ID")} records`,
                style: { margin: "16px 0" },
              }}
              locale={{
                emptyText: (
                  <div style={{ padding: "60px", textAlign: "center" }}>
                    <IconUsers
                      size={48}
                      style={{ color: "#d1d5db", marginBottom: 16 }}
                    />
                    <div>
                      <Text size="lg" c="dimmed">
                        Tidak ada data
                      </Text>
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <Text size="sm" c="dimmed">
                        Belum ada data pegawai paruh waktu
                      </Text>
                    </div>
                  </div>
                ),
              }}
            />
          </div>
        </Card>
      </div>

      {/* Modal Detail */}
      <ModalDetailParuhWaktu
        unorFull={unorFull}
        isLoadingUnorFull={isLoadingUnorFull}
        unor={unor}
        isLoadingUnor={isLoadingUnor}
        visible={modalVisible}
        onClose={handleCloseModal}
        data={selectedData}
      />
    </div>
  );
};

export default DaftarPegawaiParuhWaktu;
