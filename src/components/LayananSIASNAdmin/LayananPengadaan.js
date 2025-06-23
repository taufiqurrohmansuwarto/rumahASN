import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  downloadAllDokumenPengadaanProxy,
  generateSK,
  getPengadaanProxy,
  refStatusUsul,
  resetUploadDokumenPengadaanProxy,
  syncPengadaan,
  syncPengadaanProxy,
  uploadDokumenPengadaanProxy,
} from "@/services/siasn-services";
import { clearQuery } from "@/utils/client-utils";
import {
  CalendarOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  DownOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Flex,
  FloatButton,
  Grid,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { trim } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

dayjs.extend(relativeTime);

const formatYear = "YYYY";
const PAGE_SIZE = 25;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const ResetButton = ({ id, type }) => {
  const router = useRouter();
  const { mutate: resetUploadDokumen, isLoading: isResettingUploadDokumen } =
    useMutation((data) => resetUploadDokumenPengadaanProxy(data), {
      onSuccess: () => {
        message.success("Data berhasil direset");
      },
      onError: (error) => {
        message.error(error?.message || "Gagal mereset data");
      },
    });

  return (
    <Button
      size="small"
      type="default"
      icon={<CloudUploadOutlined />}
      loading={isResettingUploadDokumen}
      onClick={() =>
        resetUploadDokumen({
          id,
          query: { tahun: router?.query?.tahun, type },
        })
      }
      style={{
        backgroundColor: "#f5f5f5",
        borderColor: "#d9d9d9",
        color: "#595959",
        fontSize: "10px",
        height: "26px",
        borderRadius: "6px",
        fontWeight: 500,
        minWidth: "60px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      Reset
    </Button>
  );
};

const UnduhSemuaDokumen = () => {
  const router = useRouter();
  const { mutateAsync: downloadAll, isLoading: isDownloadingAll } = useMutation(
    (data) => downloadAllDokumenPengadaanProxy(data),
    {
      onSuccess: () => {
        message.success("Data berhasil diunduh");
      },
      onError: (error) => {
        message.error(error?.message || "Gagal mengunduh data");
      },
    }
  );

  const handleDownload = (selectedType) => {
    Modal.confirm({
      title: `Unduh Semua ${selectedType === "pertek" ? "Pertek" : "SK"}`,
      content: "Apakah anda yakin ingin mengunduh semua dokumen?",
      onOk: async () => {
        const result = await downloadAll({
          tahun: router?.query?.tahun || dayjs().format(formatYear),
          type: selectedType,
        });
        saveAs(
          result,
          `Dokumen ${selectedType === "pertek" ? "Pertek" : "SK"}-${
            router?.query?.tahun || dayjs().format(formatYear)
          }.zip`
        );
      },
    });
  };

  const items = [
    {
      key: "1",
      label: "Pertek",
      onClick: () => handleDownload("pertek"),
    },
    {
      key: "2",
      label: "SK",
      onClick: () => handleDownload("sk"),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button icon={<CloudDownloadOutlined />} loading={isDownloadingAll}>
        Unduh Semua <DownOutlined />
      </Button>
    </Dropdown>
  );
};

const AmbilSemuaDokumen = () => {
  const router = useRouter();
  const { mutateAsync: uploadAll, isLoading: isUploadingAll } = useMutation(
    (data) => uploadDokumenPengadaanProxy(data),
    {
      onSuccess: () => {
        message.success("Data berhasil diambil");
      },
      onError: (error) => {
        message.error(error?.message || "Gagal mengambil data");
      },
    }
  );

  const handleDownload = (selectedType) => {
    Modal.confirm({
      title: `Ambil Semua ${selectedType === "pertek" ? "Pertek" : "SK"}`,
      content: "Apakah anda yakin ingin mengambil semua dokumen?",
      onOk: async () => {
        await uploadAll({
          tahun: router?.query?.tahun || dayjs().format(formatYear),
          type: selectedType,
        });
      },
    });
  };

  const items = [
    {
      key: "1",
      label: "Pertek",
      onClick: () => handleDownload("pertek"),
    },
    {
      key: "2",
      label: "SK",
      onClick: () => handleDownload("sk"),
    },
  ];

  return (
    <Dropdown menu={{ items }} placement="bottomRight">
      <Button icon={<CloudUploadOutlined />} loading={isUploadingAll}>
        Ambil Semua <DownOutlined />
      </Button>
    </Dropdown>
  );
};

const DownloadDokumenSK = () => {
  const router = useRouter();
  const { mutateAsync: downloadSK, isLoading: isDownloadingSK } = useMutation({
    mutationFn: () => generateSK(router?.query),
    onSuccess: () => {
      message.success("Data berhasil diunduh");
    },
    onError: (error) => {
      message.error(error?.message || "Gagal mengunduh data");
    },
  });

  const handleDownload = async () => {
    const result = await downloadSK({
      tahun: router?.query?.tahun || dayjs().format(formatYear),
    });
    saveAs(
      result,
      `SK_${router?.query?.tahun || dayjs().format(formatYear)}.zip`
    );
  };

  return (
    <Button
      icon={<CloudDownloadOutlined />}
      type="primary"
      loading={isDownloadingSK}
      onClick={handleDownload}
    >
      Download SK
    </Button>
  );
};

function LayananPengadaan() {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  // State untuk filter input
  const [filterInputs, setFilterInputs] = useState({
    nama: router?.query?.nama || "",
    nip: router?.query?.nip || "",
    no_peserta: router?.query?.no_peserta || "",
  });

  // Sinkronisasi filterInputs dengan URL saat router.query berubah
  useEffect(() => {
    setFilterInputs({
      nama: router?.query?.nama || "",
      nip: router?.query?.nip || "",
      no_peserta: router?.query?.no_peserta || "",
    });
  }, [router?.query?.nama, router?.query?.nip, router?.query?.no_peserta]);

  // Function untuk apply filter hanya saat Enter
  const handleApplyFilter = () => {
    const searchParam = {
      tahun: router?.query?.tahun || dayjs().format(formatYear),
      page: 1,
      limit: PAGE_SIZE,
      ...filterInputs,
    };

    // Hapus parameter yang kosong
    Object.keys(filterInputs).forEach((key) => {
      if (!filterInputs[key]) {
        delete searchParam[key];
      }
    });

    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query: searchParam,
    });
  };

  const { mutateAsync: download, isLoading: isDownloading } = useMutation({
    mutationFn: () =>
      getPengadaanProxy({
        limit: -1,
        tahun: router?.query?.tahun || dayjs().format(formatYear),
      }),
    onSuccess: () => {
      message.success("Data berhasil diunduh");
    },
    onError: (error) => {
      message.error(error?.message || "Gagal mengunduh data");
    },
  });

  const jenisJabatan = (data) => {
    if (data?.jenis_jabatan_id === 2) {
      return `${trim(data?.jabatan_fungsional_nama)} ${
        data?.sub_jabatan_fungsional_nama
      }`;
    } else if (data?.jenis_jabatan_id === 4) {
      return data?.jabatan_fungsional_umum_nama;
    } else {
      return "";
    }
  };

  // unduh semua dokumen berdasarkan tahun per layanna (pengadaan)
  const { mutateAsync: downloadAll, isLoading: isDownloadingAll } = useMutation(
    {
      mutationFn: () =>
        downloadAllDokumenPengadaanProxy({
          tahun: router?.query?.tahun || dayjs().format(formatYear),
        }),
    }
  );

  // ambil semua dokumen berdasarkan tahun ke minio
  const {
    mutateAsync: uploadDokumenPengadaan,
    isLoading: isUploadingDokumenPengadaan,
  } = useMutation({
    mutationFn: () =>
      uploadDokumenPengadaanProxy({
        tahun: router?.query?.tahun || dayjs().format(formatYear),
      }),
  });

  const handleDownloadWithExcelJS = async () => {
    try {
      const data = await download();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Pengadaan");

      // Menambahkan header dengan format yang lebih baik
      const headers = [
        "NIP",
        "Nama Lengkap",
        "Gelar Depan",
        "Gelar Belakang",
        "Nama Lengkap (Gelar)",
        "Tanggal Lahir",
        "Tempat Lahir",
        "Gaji",
        "Nomor Peserta",
        "Periode",
        "Jenis Formasi",
        "Pendidikan",
        "Tanggal Lulus",
        "TMT CPNS",
        "Pangkat/Golongan",
        "Unit Kerja SIASN",
        "Unit Kerja SIASN ID",
        "Unit Kerja SIMASTER",
        "Unit Kerja SIMASTER ID",
        "TMT CPNS",
        "Tgl. Usulan",
        "Unor Pertek",
        "Nomer Pertek",
        "Tanggal Pertek",
        "Jabatan",
        "Status Usulan",
      ];

      // Menambahkan header ke worksheet
      const headerRow = worksheet.addRow(headers);

      // Mempercantik header
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
      });

      // Mengatur lebar kolom agar lebih optimal
      worksheet.columns = headers.map((header) => ({
        header,
        width:
          header === "Nama Lengkap"
            ? 25
            : header === "Pendidikan"
            ? 30
            : header === "Jenis Formasi"
            ? 20
            : 15,
      }));

      // Menambahkan data
      data?.data?.forEach((row) => {
        const dataRow = worksheet.addRow([
          row.nip,
          row.nama,
          row?.usulan_data?.data?.glr_depan,
          row?.usulan_data?.data?.glr_belakang,
          trim(
            `${row?.usulan_data?.data?.glr_depan || ""} ${row?.nama || ""} ${
              row?.usulan_data?.data?.glr_belakang || ""
            }`
          ),
          row?.usulan_data?.data?.tgl_lahir,
          row?.usulan_data?.data?.tempat_lahir,
          row?.usulan_data?.data?.gaji_pokok,
          row?.usulan_data?.data?.no_peserta,
          row.periode,
          row.jenis_formasi_nama,
          row?.usulan_data?.data?.pendidikan_pertama_nama,
          row?.usulan_data?.data?.tgl_tahun_lulus,
          row?.usulan_data?.data?.tmt_cpns,
          row?.usulan_data?.data?.golongan_nama,
          row?.unor_siasn,
          row?.unor_siasn_id,
          row?.unor_simaster,
          row?.unor_simaster_id,
          row?.tmt_cpns,
          row?.tgl_usulan,
          `${row?.usulan_data?.data?.unor_nama} - ${row?.usulan_data?.data?.unor_induk_nama}`,
          row?.no_pertek,
          row?.tgl_pertek ? dayjs(row?.tgl_pertek).format("DD-MM-YYYY") : "-",
          jenisJabatan(row?.usulan_data?.data),
          row.status_usulan_nama,
        ]);

        // Menambahkan border untuk setiap sel data
        dataRow.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      const now = dayjs().format("DD-MM-YYYY");

      // Membuat buffer dan menyimpan file
      const excelBuffer = await workbook.xlsx.writeBuffer();
      const fileName = `Data_Pengadaan_${
        router?.query?.tahun || dayjs().format(formatYear)
      }_${now}.xlsx`;

      saveAs(new Blob([excelBuffer]), fileName);
    } catch (error) {
      message.error("Error");
    }
  };

  const handleDownload = async () => {
    const data = await download();
    console.log(data);
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data?.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(new Blob([excelBuffer]), "data.xlsx");
  };

  useScrollRestoration();
  const queryClient = useQueryClient();

  const { mutateAsync: syncProxy, isLoading: isSyncingProxy } = useMutation({
    mutationFn: () => syncPengadaanProxy(router?.query),
    onSuccess: () => {
      message.success("Data berhasil disinkronkan");
      queryClient.invalidateQueries("daftar-pengadaan-proxy");
    },
    onError: (error) => {
      message.error(error?.message || "Gagal menyinkronkan data");
    },
    onSettled: () => {
      queryClient.invalidateQueries("daftar-pengadaan-proxy");
    },
  });

  const { mutate: sync, isLoading: isSyncing } = useMutation({
    mutationFn: () => syncPengadaan(router?.query),
    onSuccess: () => {
      message.success("Data berhasil disinkronkan");
      queryClient.invalidateQueries("daftar-pengadaan");
    },
    onError: (error) => {
      message.error(error?.message || "Gagal menyinkronkan data");
    },
  });

  const handleChange = (value) => {
    if (value) {
      router.push({
        pathname: "/layanan-siasn/pengadaan",
        query: { tahun: value.format(formatYear), page: 1 },
      });
    } else {
      // Clear tahun filter when date is cleared
      const { tahun, ...restQuery } = router.query;
      router.push({
        pathname: "/layanan-siasn/pengadaan",
        query: { ...restQuery, page: 1 },
      });
    }
  };

  const { data, isLoading, isFetching, refetch, error } = useQuery(
    ["daftar-pengadaan-proxy", router?.query],
    () => getPengadaanProxy(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
      refetchOnWindowFocus: false,
    }
  );

  const { data: statusUsul, isLoading: isLoadingStatusUsul } = useQuery(
    ["status-usulan"],
    () => refStatusUsul(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleSearch = (value, key) => {
    const query = clearQuery({
      ...router?.query,
      [key]: value,
      page: 1,
    });
    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query,
    });
  };

  const renderFilterStatusUsul = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
    dataIndex,
  }) => {
    return (
      <div style={{ padding: 8 }}>
        <Select
          placeholder="Pilih status usulan"
          value={selectedKeys}
          onChange={(value) => {
            setSelectedKeys(value || []);
            // Tidak langsung memanggil confirm() agar dropdown tidak langsung tertutup
          }}
          style={{ width: 250, marginBottom: 8 }}
          options={statusUsul?.map((item) => ({
            label: item.nama,
            value: item.id,
          }))}
          allowClear
          onClear={() => {
            clearFilters();
            handleSearch(undefined, dataIndex);
          }}
          loading={isLoadingStatusUsul}
          mode="multiple"
          maxTagCount={2}
          showSearch
          optionFilterProp="label"
          dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          tagRender={(props) => (
            <Tag
              color="blue"
              closable={props.closable}
              onClose={props.onClose}
              style={{ marginRight: 3 }}
            >
              {props.label}
            </Tag>
          )}
          dropdownRender={(menu) => (
            <div>
              <div
                style={{ padding: "8px", borderBottom: "1px solid #e8e8e8" }}
              >
                <Typography.Text strong>Status Usulan</Typography.Text>
              </div>
              {menu}
              <div
                style={{
                  padding: "8px",
                  borderTop: "1px solid #e8e8e8",
                  textAlign: "right",
                }}
              >
                <Button
                  size="small"
                  type="primary"
                  onClick={() => {
                    // Pastikan nilai selectedKeys tetap ada saat confirm dan tutup dropdown
                    confirm();
                    handleSearch(selectedKeys, dataIndex);
                  }}
                  style={{ marginRight: 8 }}
                >
                  Terapkan
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    clearFilters();
                    setSelectedKeys([]);
                    handleSearch(undefined, dataIndex);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        />
      </div>
    );
  };

  const renderSearchFilter = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
    dataIndex,
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder={`Cari ${dataIndex}`}
        value={selectedKeys[0] || router?.query?.[dataIndex]}
        onChange={(e) =>
          setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
        onPressEnter={() => {
          confirm();
          handleSearch(selectedKeys[0], dataIndex);
        }}
        style={{ width: 300, marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => {
            confirm();
            handleSearch(selectedKeys[0], dataIndex);
          }}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}
        >
          Cari
        </Button>
        <Button
          onClick={() => {
            clearFilters();
            setSelectedKeys([]);
            handleSearch(undefined, dataIndex);
          }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </Space>
    </div>
  );

  const reload = () => {
    const resetQuery = {
      tahun: router?.query?.tahun,
      page: 1,
      limit: PAGE_SIZE,
    };
    setFilterInputs({
      nama: "",
      nip: "",
      no_peserta: "",
    });
    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query: resetQuery,
    });
  };

  const handleChangePage = ({ current, pageSize }) => {
    const updatedQuery = {
      ...router?.query,
      page: current,
      limit: pageSize,
    };

    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query: updatedQuery,
    });
  };

  // Helper function untuk mendapatkan konfigurasi status
  const getStatusConfig = (status) => {
    const statusMap = {
      "Sdh di TTD - Pertek": {
        color: "success",
        icon: "✅",
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
      },
      "Sdh di TTD - SK": {
        color: "blue",
        icon: "📄",
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
      },
      "Menunggu Persetujuan": {
        color: "warning",
        icon: "⏳",
        bgColor: "#fff7e6",
        borderColor: "#ffd666",
      },
      Ditolak: {
        color: "error",
        icon: "❌",
        bgColor: "#fff2f0",
        borderColor: "#ffccc7",
      },
    };

    return (
      statusMap[status] || {
        color: "default",
        icon: "📋",
        bgColor: "#fafafa",
        borderColor: "#d9d9d9",
      }
    );
  };

  // Helper function untuk mendapatkan konfigurasi jenis formasi
  const getJenisFormasiConfig = (jenis) => {
    const jenisMap = {
      "PPPK GURU KHUSUS": {
        color: "purple",
        icon: "🎓",
        bgColor: "#f9f0ff",
        borderColor: "#d3adf7",
      },
      "PPPK GURU": {
        color: "cyan",
        icon: "👨‍🏫",
        bgColor: "#e6fffb",
        borderColor: "#87e8de",
      },
      "PPPK TEKNIS": {
        color: "blue",
        icon: "⚙️",
        bgColor: "#f0f5ff",
        borderColor: "#adc6ff",
      },
      ASN: {
        color: "gold",
        icon: "👔",
        bgColor: "#fff7e6",
        borderColor: "#ffd666",
      },
    };

    return (
      jenisMap[jenis] || {
        color: "default",
        icon: "📈",
        bgColor: "#fafafa",
        borderColor: "#d9d9d9",
      }
    );
  };

  const columns = [
    {
      title: "👤 Data Pegawai",
      key: "data_pegawai",
      render: (_, record) => (
        <div>
          <Flex vertical gap={6}>
            <Text
              strong
              style={{
                fontSize: isMobile ? "12px" : "14px",
                color: "#1a1a1a",
                lineHeight: 1.2,
              }}
              ellipsis={{ tooltip: record?.nama }}
            >
              {record?.nama}
            </Text>

            <Flex align="center" gap={4}>
              <Text
                style={{
                  fontSize: isMobile ? "9px" : "10px",
                  color: "#999",
                  fontWeight: 500,
                }}
              >
                NIP:
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "11px",
                  color: "#595959",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {record?.nip}
              </Text>
            </Flex>

            <Flex align="center" gap={4}>
              <Text
                style={{
                  fontSize: isMobile ? "9px" : "10px",
                  color: "#999",
                  fontWeight: 500,
                }}
              >
                No. Peserta:
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "11px",
                  color: "#1890ff",
                  fontFamily: "monospace",
                  fontWeight: 600,
                }}
              >
                {record?.usulan_data?.data?.no_peserta}
              </Text>
            </Flex>
          </Flex>
        </div>
      ),
    },
    {
      title: "📊 Formasi & Jabatan",
      key: "formasi_jabatan",
      render: (_, record) => {
        const jenisConfig = getJenisFormasiConfig(record?.jenis_formasi_nama);
        return (
          <div>
            <Flex vertical gap={6}>
              <Tag
                color={jenisConfig.color}
                style={{
                  borderRadius: "8px",
                  fontSize: isMobile ? "9px" : "10px",
                  fontWeight: 600,
                  padding: "4px 8px",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {jenisConfig.icon} {record?.jenis_formasi_nama}
              </Tag>

              <Flex align="center" gap={4}>
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#999",
                    fontWeight: 500,
                  }}
                >
                  Periode:
                </Text>
                <Tag
                  color="blue"
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "6px",
                    margin: 0,
                  }}
                >
                  {record?.periode}
                </Tag>
              </Flex>

              {record?.usulan_data?.data?.jabatan_fungsional_nama && (
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#595959",
                    fontWeight: 500,
                  }}
                  ellipsis={{
                    tooltip: record?.usulan_data?.data?.jabatan_fungsional_nama,
                  }}
                >
                  👔 {record?.usulan_data?.data?.jabatan_fungsional_nama}
                </Text>
              )}

              {record?.tmt_cpns && (
                <Text
                  style={{
                    fontSize: isMobile ? "9px" : "10px",
                    color: "#8c8c8c",
                  }}
                >
                  📅 TMT: {record?.tmt_cpns}
                </Text>
              )}
            </Flex>
          </div>
        );
      },
    },
    {
      title: "🔄 Status & Dokumen",
      key: "status_dokumen",
      filterDropdown: renderFilterStatusUsul,
      filterIcon: (filtered) => (
        <FilterOutlined
          style={{
            color: filtered ? "#1890ff" : undefined,
          }}
        />
      ),
      render: (_, record) => {
        const statusConfig = getStatusConfig(record?.status_usulan_nama);
        return (
          <div>
            <Flex vertical gap={8}>
              <Tag
                color={statusConfig.color}
                style={{
                  borderRadius: "8px",
                  fontSize: isMobile ? "9px" : "10px",
                  fontWeight: 600,
                  padding: "4px 8px",
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {statusConfig.icon} {record?.status_usulan_nama}
              </Tag>

              {(record?.path_ttd_pertek || record?.path_ttd_sk) && (
                <Flex vertical gap={4}>
                  <Text
                    style={{
                      fontSize: isMobile ? "9px" : "10px",
                      color: "#666",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    📄 Dokumen:
                  </Text>
                  <Flex gap={6} wrap justify="center">
                    {record?.path_ttd_pertek && (
                      <Button
                        size="small"
                        type="primary"
                        icon={<FilePdfOutlined />}
                        style={{
                          backgroundColor: "#ff4500",
                          borderColor: "#ff4500",
                          color: "#fff",
                          fontSize: isMobile ? "10px" : "11px",
                          height: "28px",
                          borderRadius: "6px",
                          fontWeight: 600,
                          minWidth: "70px",
                          boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
                        }}
                        href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                        target="_blank"
                      >
                        Pertek
                      </Button>
                    )}
                    {record?.path_ttd_sk && (
                      <Button
                        size="small"
                        type="primary"
                        icon={<FilePdfOutlined />}
                        style={{
                          backgroundColor: "#1890ff",
                          borderColor: "#1890ff",
                          color: "#fff",
                          fontSize: isMobile ? "10px" : "11px",
                          height: "28px",
                          borderRadius: "6px",
                          fontWeight: 600,
                          minWidth: "70px",
                          boxShadow: "0 2px 4px rgba(24, 144, 255, 0.3)",
                        }}
                        href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                        target="_blank"
                      >
                        SK
                      </Button>
                    )}
                  </Flex>

                  <Flex
                    gap={6}
                    wrap
                    justify="center"
                    style={{ marginTop: "8px" }}
                  >
                    <Button
                      type="primary"
                      size="small"
                      style={{
                        backgroundColor: "#ff4500",
                        borderColor: "#ff4500",
                        color: "#fff",
                        fontSize: isMobile ? "10px" : "11px",
                        height: "28px",
                        borderRadius: "6px",
                        fontWeight: 600,
                        minWidth: "80px",
                        boxShadow: "0 2px 4px rgba(255, 69, 0, 0.3)",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() => {
                        // Handle detail view logic here
                        router.push(
                          `/layanan-siasn/pengadaan/detail/${record?.id}`
                        );
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = "#ff6b35";
                        e.target.style.transform = "translateY(-1px)";
                        e.target.style.boxShadow =
                          "0 4px 8px rgba(255, 69, 0, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "#ff4500";
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 2px 4px rgba(255, 69, 0, 0.3)";
                      }}
                    >
                      👁️ Detail
                    </Button>
                  </Flex>
                </Flex>
              )}

              {record?.alasan_tolak_tambahan && (
                <div
                  style={{
                    backgroundColor: "#fff2f0",
                    border: "1px solid #ffccc7",
                    borderRadius: "6px",
                    padding: "6px",
                    marginTop: "4px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: isMobile ? "8px" : "9px",
                      color: "#ff4d4f",
                      fontStyle: "italic",
                      textAlign: "center",
                      display: "block",
                      fontWeight: 500,
                    }}
                    ellipsis={{ tooltip: record?.alasan_tolak_tambahan }}
                  >
                    ⚠️ {record?.alasan_tolak_tambahan}
                  </Text>
                </div>
              )}
            </Flex>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          backgroundColor: "#fff2f0",
          borderRadius: "12px",
          border: "1px solid #ffccc7",
        }}
      >
        <Text type="danger" style={{ fontSize: "16px" }}>
          ❌ Error: {error.message}
        </Text>
      </div>
    );
  }

  // Calculate statistics
  const totalData = data?.total || 0;
  const dataTTDPertek =
    data?.data?.filter((item) => item?.path_ttd_pertek)?.length || 0;
  const dataTTDSK =
    data?.data?.filter((item) => item?.path_ttd_sk)?.length || 0;
  const dataMenunggu =
    data?.data?.filter((item) => item?.status_usulan_nama?.includes("Menunggu"))
      ?.length || 0;

  return (
    <div>
      <FloatButton.BackTop />

      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex align="center" gap={isMobile ? 12 : 16} wrap>
          {!isMobile && (
            <div
              style={{
                width: isMobile ? "40px" : "48px",
                height: isMobile ? "40px" : "48px",
                backgroundColor: "#FF4500",
                borderRadius: isMobile ? "8px" : "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TeamOutlined
                style={{
                  color: "white",
                  fontSize: isMobile ? "16px" : "20px",
                }}
              />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <Title
              level={isMobile ? 4 : 3}
              style={{ margin: 0, color: "#1a1a1a" }}
            >
              👥 Integrasi Pengadaan ASN
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Monitoring dan sinkronisasi data pengadaan ASN dari SIASN
            </Text>
          </div>
        </Flex>
      </Card>

      {/* Filter Card */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex
          align={isMobile ? "flex-start" : "center"}
          gap={isMobile ? 8 : 12}
          wrap
          justify="space-between"
          vertical={isMobile}
        >
          <Flex
            align="center"
            gap={isMobile ? 6 : 8}
            wrap
            style={{ flex: 1, width: isMobile ? "100%" : "auto" }}
          >
            <Flex align="center" gap={8}>
              <FilterOutlined
                style={{
                  color: "#FF4500",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              />
              <Text
                strong
                style={{
                  color: "#1a1a1a",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                Filter:
              </Text>
            </Flex>

            <Flex align="center" gap={6}>
              <CalendarOutlined
                style={{
                  color: "#666",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
              <DatePicker
                value={
                  router?.query?.tahun
                    ? dayjs(router?.query?.tahun, formatYear)
                    : dayjs()
                }
                picker="year"
                onChange={handleChange}
                format={formatYear}
                placeholder="Pilih Tahun"
                style={{ width: isMobile ? 130 : 160 }}
                size={isMobile ? "small" : "middle"}
              />
            </Flex>

            <Flex align="center" gap={6}>
              <UserOutlined
                style={{
                  color: "#666",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
              <Input
                placeholder="Cari nama (Enter)..."
                value={filterInputs.nama}
                onChange={(e) => {
                  setFilterInputs((prev) => ({
                    ...prev,
                    nama: e.target.value,
                  }));
                }}
                onPressEnter={handleApplyFilter}
                style={{ width: isMobile ? 120 : 160 }}
                size={isMobile ? "small" : "middle"}
                allowClear
                onClear={() => {
                  setFilterInputs((prev) => ({ ...prev, nama: "" }));
                  handleApplyFilter();
                }}
              />
            </Flex>

            <Flex align="center" gap={6}>
              <DatabaseOutlined
                style={{
                  color: "#666",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
              <Input
                placeholder="Cari NIP (Enter)..."
                value={filterInputs.nip}
                onChange={(e) => {
                  setFilterInputs((prev) => ({ ...prev, nip: e.target.value }));
                }}
                onPressEnter={handleApplyFilter}
                style={{ width: isMobile ? 120 : 160 }}
                size={isMobile ? "small" : "middle"}
                allowClear
                onClear={() => {
                  setFilterInputs((prev) => ({ ...prev, nip: "" }));
                  handleApplyFilter();
                }}
              />
            </Flex>

            <Flex align="center" gap={6}>
              <FileTextOutlined
                style={{
                  color: "#666",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
              <Input
                placeholder="Cari no. peserta (Enter)..."
                value={filterInputs.no_peserta}
                onChange={(e) => {
                  setFilterInputs((prev) => ({
                    ...prev,
                    no_peserta: e.target.value,
                  }));
                }}
                onPressEnter={handleApplyFilter}
                style={{ width: isMobile ? 140 : 180 }}
                size={isMobile ? "small" : "middle"}
                allowClear
                onClear={() => {
                  setFilterInputs((prev) => ({ ...prev, no_peserta: "" }));
                  handleApplyFilter();
                }}
              />
            </Flex>

            <Button
              loading={isFetching}
              onClick={reload}
              style={{
                borderColor: "#FF4500",
                color: "#FF4500",
                fontSize: isMobile ? "11px" : "14px",
                fontWeight: 600,
                height: isMobile ? "28px" : "36px",
                borderRadius: "6px",
                transition: "all 0.3s ease",
                background: "linear-gradient(135deg, #fff 0%, #fff7f0 100%)",
              }}
              size={isMobile ? "small" : "middle"}
              icon={<ReloadOutlined />}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#ff6b35";
                e.target.style.color = "#ff6b35";
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 2px 6px rgba(255, 69, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#FF4500";
                e.target.style.color = "#FF4500";
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              🔄 Reset
            </Button>

            {data?.sync_time && (
              <Tag
                color="blue"
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  padding: "4px 8px",
                  borderRadius: "8px",
                }}
              >
                🕐 Sync:{" "}
                {dayjs(data.sync_time).locale("id").format("DD/MM/YY HH:mm")}
              </Tag>
            )}
          </Flex>

          <Flex
            gap={isMobile ? 8 : 12}
            wrap
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              loading={isDownloading}
              onClick={handleDownloadWithExcelJS}
              style={{
                background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                borderColor: "#52c41a",
                fontSize: isMobile ? "11px" : "14px",
                fontWeight: 600,
                height: isMobile ? "32px" : "40px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)",
                transition: "all 0.3s ease",
              }}
              size={isMobile ? "small" : "middle"}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(82, 196, 26, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(82, 196, 26, 0.3)";
              }}
            >
              📊 Ekspor Excel
            </Button>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              loading={isSyncingProxy}
              onClick={() => {
                Modal.confirm({
                  title: "🔄 Sinkronisasi Data SIASN",
                  content:
                    "Apakah Anda yakin ingin melakukan sinkronisasi data dari SIASN? Proses ini akan memperbarui data terbaru.",
                  okText: "Ya, Sinkron",
                  cancelText: "Batal",
                  icon: <SyncOutlined style={{ color: "#FF4500" }} />,
                  onOk: async () => {
                    await syncProxy();
                  },
                });
              }}
              style={{
                background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                borderColor: "#FF4500",
                fontSize: isMobile ? "11px" : "14px",
                fontWeight: 600,
                height: isMobile ? "32px" : "40px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(255, 69, 0, 0.3)",
                transition: "all 0.3s ease",
              }}
              size={isMobile ? "small" : "middle"}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(255, 69, 0, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(255, 69, 0, 0.3)";
              }}
            >
              🔄 Sinkron SIASN
            </Button>
          </Flex>
        </Flex>
      </Card>

      {/* Statistics Card */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "20px" : "24px",
                  fontWeight: "bold",
                  color: "#FF4500",
                }}
              >
                {totalData}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                👥 Total Data
              </Text>
            </Flex>
          </Col>

          <Col xs={12} sm={6}>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "20px" : "24px",
                  fontWeight: "bold",
                  color: "#52c41a",
                }}
              >
                {dataTTDPertek}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                ✅ TTD Pertek
              </Text>
            </Flex>
          </Col>

          <Col xs={12} sm={6}>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "20px" : "24px",
                  fontWeight: "bold",
                  color: "#1890ff",
                }}
              >
                {dataTTDSK}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                📄 TTD SK
              </Text>
            </Flex>
          </Col>

          <Col xs={12} sm={6}>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "20px" : "24px",
                  fontWeight: "bold",
                  color: "#faad14",
                }}
              >
                {dataMenunggu}
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : "12px",
                  color: "#666",
                  textAlign: "center",
                }}
              >
                ⏳ Menunggu
              </Text>
            </Flex>
          </Col>
        </Row>
      </Card>

      {/* Table Card */}
      <Card
        style={{
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? "12px" : "14px",
            color: "#666",
            marginBottom: "16px",
            padding: "8px 12px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          📊 Data Pengadaan ASN Periode{" "}
          <Text strong style={{ color: "#FF4500" }}>
            📅 {router?.query?.tahun}
          </Text>{" "}
          • Total: <Text strong>{totalData}</Text> data
        </div>

        <Table
          rowKey={(row) => row?.id}
          columns={columns}
          dataSource={data?.data}
          loading={isLoading || isFetching}
          pagination={{
            total: data?.total ?? 0,
            showTotal: (total) => `Total ${total} data`,
            showSizeChanger: false,
            current: router?.query?.page ?? 1,
            pageSize: router?.query?.limit ?? PAGE_SIZE,
            position: ["bottomCenter"],
            size: isMobile ? "small" : "middle",
          }}
          onChange={handleChangePage}
          size={isMobile ? "small" : "middle"}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </Card>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #ff4500 !important;
          padding: ${isMobile ? "12px 8px" : "16px 12px"} !important;
          font-size: ${isMobile ? "11px" : "14px"} !important;
        }

        .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 12px !important;
        }

        .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 12px !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: ${isMobile ? "8px 6px" : "12px"} !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #fff7e6 !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item-active {
          background: linear-gradient(
            135deg,
            #ff4500 0%,
            #ff6b35 100%
          ) !important;
          border-color: #ff4500 !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.3) !important;
        }

        .ant-pagination-item-active a {
          color: white !important;
          font-weight: 600 !important;
        }

        .ant-pagination-item:hover {
          border-color: #ff4500 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(255, 69, 0, 0.2) !important;
          transition: all 0.2s ease !important;
        }

        .ant-pagination-item:hover a {
          color: #ff4500 !important;
        }

        .ant-picker:hover,
        .ant-picker-focused {
          border-color: #ff4500 !important;
          box-shadow: 0 0 0 2px rgba(255, 69, 0, 0.2) !important;
        }

        .ant-table-container {
          border-radius: 12px !important;
          overflow: hidden !important;
        }

        .table-row-light {
          background-color: #ffffff !important;
        }

        .table-row-dark {
          background-color: #fafafa !important;
        }

        .ant-card {
          transition: all 0.3s ease !important;
          overflow: hidden !important;
          border-radius: 12px !important;
        }

        .ant-card:hover {
          border-color: #ff4500 !important;
        }

        .ant-card-body {
          border-radius: 12px !important;
        }

        @media (max-width: 768px) {
          .ant-table-thead > tr > th {
            font-size: 11px !important;
            padding: 8px 6px !important;
          }

          .ant-table-tbody > tr > td {
            padding: 8px 6px !important;
            font-size: 11px !important;
          }

          .ant-table-pagination {
            text-align: center !important;
          }

          .ant-pagination-simple .ant-pagination-simple-pager {
            margin: 0 8px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default LayananPengadaan;
