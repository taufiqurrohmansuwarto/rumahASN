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
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  DatePicker,
  Divider,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { trim } from "lodash";
import { useRouter } from "next/router";
import { useState } from "react";
import * as XLSX from "xlsx";

const formatYear = "YYYY";
const PAGE_SIZE = 25;

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
      type="primary"
      icon={<CloudUploadOutlined />}
      loading={isResettingUploadDokumen}
      onClick={() =>
        resetUploadDokumen({
          id,
          query: { tahun: router?.query?.tahun, type },
        })
      }
    >
      {type === "pertek" ? "Pertek" : "SK"}
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
          row.status_usulan_nama.nama,
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

  const [query, setQuery] = useState({
    tahun: router.query.tahun || dayjs().format(formatYear),
    page: 1,
    limit: PAGE_SIZE,
  });

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
    setQuery({
      tahun: value.format(formatYear),
      page: 1,
    });
    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query: { tahun: value.format(formatYear), page: 1 },
    });
  };

  const { data, isLoading, isFetching, refetch } = useQuery(
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
    refetch();
    setQuery({
      tahun: router?.query?.tahun,
      page: 1,
      limit: PAGE_SIZE,
    });
    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query: { tahun: router?.query?.tahun, page: 1, limit: PAGE_SIZE },
    });
  };

  const handleChangePage = ({ current, pageSize }) => {
    const updatedQuery = {
      ...router?.query,
      page: current,
      limit: pageSize,
    };

    setQuery(updatedQuery);
    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query: updatedQuery,
    });
  };

  const columns = [
    {
      title: "Informasi",
      key: "informasi",
      render: (_, record) => {
        return (
          <Space direction="vertical">
            <Typography.Text>{record?.nama}</Typography.Text>
            <Typography.Text>{record?.nip}</Typography.Text>
            <Typography.Text type="secondary">
              {record?.no_peserta}
            </Typography.Text>
            <Tag color="blue">{record?.periode}</Tag>
            <Tag color="yellow">{record?.jenis_formasi_nama}</Tag>
          </Space>
        );
      },
      responsive: ["xs"],
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <Space>
            {record?.path_ttd_sk && (
              <Tooltip title="File SK">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              </Tooltip>
            )}
            {record?.path_ttd_pertek && (
              <Tooltip title="File Pertek">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              </Tooltip>
            )}
          </Space>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "No. Peserta",
      key: "no_peserta",
      dataIndex: "no_peserta",
      render: (_, row) => row?.usulan_data?.data?.no_peserta,
      filterSearch: true,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) =>
        renderSearchFilter({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          dataIndex: "no_peserta",
        }),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      responsive: ["sm"],
    },
    {
      title: "Unor",
      key: "unor",
      width: 250,
      render: (_, row) => <>{row?.unor_siasn}</>,
    },
    {
      title: "TMT CPNS",
      dataIndex: "tmt_cpns",
    },
    {
      title: "Tgl. Usulan",
      dataIndex: "tgl_usulan",
    },
    {
      title: "Nama",
      dataIndex: "nama",
      responsive: ["sm"],
      filterSearch: true,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) =>
        renderSearchFilter({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          dataIndex: "nama",
        }),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Jenis Formasi Nama",
      dataIndex: "jenis_formasi_nama",
      responsive: ["sm"],
    },
    {
      title: "Periode",
      dataIndex: "periode",
      responsive: ["sm"],
    },

    {
      title: "Status Usulan",
      key: "status_usulan",
      width: 200,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        dataIndex,
      }) =>
        renderFilterStatusUsul({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
          dataIndex: "status_usulan",
        }),
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
      render: (_, row) => (
        <Space direction="vertical">
          <Tag color={row?.status_usulan_nama?.color}>
            {row?.status_usulan_nama}
          </Tag>
          <Typography.Text type="secondary">
            {row?.alasan_tolak_tambahan}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => {
        return (
          <Space>
            {row?.path_ttd_pertek && <ResetButton id={row?.id} type="pertek" />}
            <Divider orientation="vertical" />
            {row?.path_ttd_sk && <ResetButton id={row?.id} type="sk" />}
          </Space>
        );
      },
      responsive: ["sm"],
    },
  ];

  return (
    <Card title="Integrasi Pengadaan">
      <Form layout="inline">
        <Form.Item label="Tahun Pengadaan">
          <DatePicker
            value={dayjs(query?.tahun, formatYear)}
            picker="year"
            onChange={handleChange}
            format={formatYear}
          />
        </Form.Item>
        <Form.Item>
          <Button
            icon={<ReloadOutlined />}
            loading={isFetching}
            onClick={reload}
          >
            Reset Filter
          </Button>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            icon={<DatabaseOutlined />}
            loading={isSyncingProxy}
            onClick={() => {
              Modal.confirm({
                title: "Sinkron Data SIASN",
                content: "Apakah anda yakin ingin sinkron data SIASN?",
                onOk: async () => {
                  await syncProxy();
                },
              });
            }}
          >
            Sinkro SIASN
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16, marginTop: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            loading={isDownloading}
            onClick={handleDownloadWithExcelJS}
          >
            Ekspor
          </Button>
          {/* Komponen untuk mengambil semua dokumen */}
          {/* Komponen untuk mengunduh semua dokumen */}
          {/* Komponen untuk mengunduh dokumen SK */}
        </Space>
      </div>

      <Table
        rowKey={(row) => row?.id}
        pagination={{
          position: ["bottomRight", "topRight"],
          total: data?.total ?? 0,
          showTotal: (total) => `Total ${total} data`,
          showSizeChanger: false,
          current: query?.page ?? 1,
          pageSize: query?.limit ?? PAGE_SIZE,
        }}
        dataSource={data?.data}
        columns={columns}
        loading={isLoading || isFetching}
        onChange={handleChangePage}
      />
    </Card>
  );
}

export default LayananPengadaan;
