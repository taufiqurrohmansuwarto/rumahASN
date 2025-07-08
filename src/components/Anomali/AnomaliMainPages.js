import PageContainer from "@/components/PageContainer";
import {
  Avatar,
  Modal,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  FloatButton,
  Grid,
  Input,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import { useState } from "react";

import UserByDateAnomali from "@/components/Anomali/UserByDateAnomali";
import Bar from "@/components/Plots/Bar";
import Pie from "@/components/Plots/Pie";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import {
  aggregateAnomali2023,
  daftarAnomali23,
  deleteAllAnomali2023,
  downloadAnomali2023,
  uploadDataAnomali2023,
} from "@/services/anomali.services";
import {
  BarChartOutlined,
  BugOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  FilterOutlined,
  PieChartOutlined,
  SearchOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const PieChart = ({ data }) => {
  const config = {
    appendPadding: 10,
    data,
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
    },
    interactions: [
      {
        type: "element-active",
      },
    ],
  };

  return (
    <>
      <Pie {...config} />
    </>
  );
};

const BarChart = ({ data }) => {
  const config = {
    data,
    isStack: true,
    xField: "value",
    yField: "label",
    seriesField: "type",
  };

  return <Bar {...config} />;
};

const BarChart2 = ({ data }) => {
  const config = {
    data,
    xField: "value",
    yField: "label",
    seriesField: "label",
    legend: {
      position: "top-left",
    },
  };
  return <Bar {...config} />;
};

const anomaliTypes = [
  "TMT CPNS LBHBESAR TMT PNS",
  "JABATAN KOSONG",
  "CLTN SETELAH TANGGAL AKHIR",
  "BUP MASIH AKTIF",
  "STRUKTURAL GANDA",
  "UNOR NONAKTIF",
  "FORMASI JF BELUM DIANGKAT",
  "BELUM SKP TH SEBELUMNYA",
  "JFU NOMENKLATUR JF",
  "NIK BELUM VALID",
  "GELAR KOSONG",
  "EMAIL PRIBADI KOSONG SALAH FORMAT",
  "NOMOR HP KOSONG",
  "TK PEND JF TMS",
];

const UploadExcel = () => {
  const [fileList, setFileList] = useState([]);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const queryClient = useQueryClient();

  const { mutateAsync, isLoading } = useMutation(
    (data) => uploadDataAnomali2023(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengunggah file");
        setFileList([]);
      },
      onError: () => {
        message.error("Gagal mengunggah file");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["anomali-2023"]);
      },
    }
  );

  const handleUpload = async () => {
    try {
      const file = fileList[0];
      const formData = new FormData();
      formData.append("file", file);
      await mutateAsync(formData);
      message.success("Berhasil mengunggah file");
      setFileList([]);
    } catch (error) {
      message.error("Gagal mengunggah file");
    }
  };

  const props = {
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <Space
      direction={isMobile ? "vertical" : "horizontal"}
      style={{ width: isMobile ? "100%" : "auto" }}
    >
      <Upload
        showUploadList={{
          downloadIcon: false,
          previewIcon: false,
          removeIcon: true,
          showDownloadIcon: false,
          showPreviewIcon: false,
          showRemoveIcon: true,
        }}
        {...props}
        multiple={false}
        fileList={fileList}
        maxCount={1}
        accept=".xlsx,.xls"
      >
        <Button icon={<UploadOutlined />} size={isMobile ? "small" : "middle"}>
          {isMobile ? "Pilih File" : "Pilih File Excel"}
        </Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={isLoading || fileList.length === 0}
        loading={isLoading}
        icon={<UploadOutlined />}
        size={isMobile ? "small" : "middle"}
      >
        {isLoading ? "Mengunggah..." : isMobile ? "Upload" : "Upload File"}
      </Button>
    </Space>
  );
};

const ListAnomali = () => {
  const router = useRouter();
  const query = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  const { mutateAsync: download, isLoading: isLoadingDownload } = useMutation(
    () => downloadAnomali2023()
  );

  const handleDownload = async () => {
    try {
      const data = await download();
      if (data) {
        const blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "anomali-2023.xlsx";
        link.click();

        URL.revokeObjectURL(url);
      }
      message.success("Berhasil mengunduh file");
    } catch (error) {
      message.error("Gagal mengunduh file");
    }
  };

  const { data, isLoading, isFetching } = useQuery(
    ["anomali-2023", query],
    () => daftarAnomali23(query),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: !!query,
    }
  );

  const handleChange = (value) => {
    if (!value) {
      router.push({
        pathname: "/apps-managements/anomali-data-2023",
        query: {},
      });
    } else {
      const currentQuery = {
        ...query,
        jenis_anomali: value,
        page: 1,
      };
      router.push({
        pathname: "/apps-managements/anomali-data-2023",
        query: currentQuery,
      });
    }
  };

  const columns = [
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            👤 Data Pegawai
          </Text>
        </Space>
      ),
      key: "nip_baru",
      width: 200,
      render: (record) => (
        <Stack>
          <Flex align="center" gap={6}>
            <Avatar
              shape="square"
              src={record?.pegawai_simaster?.foto}
              size={isMobile ? 24 : 40}
              icon={<UserOutlined />}
            />
            <Link
              href={`/apps-managements/integrasi/siasn/${record?.nip_baru}`}
            >
              <Flex vertical gap={0}>
                <Text>{record?.nip_baru}</Text>
                <Text
                  style={{
                    fontWeight: 600,
                    color: "#1a1a1a",
                    lineHeight: 1.2,
                  }}
                  ellipsis={{ tooltip: record?.pegawai_simaster?.nama_master }}
                >
                  {record?.pegawai_simaster?.nama_master}
                </Text>
              </Flex>
            </Link>
          </Flex>
          <Text secondary style={{ fontSize: 11 }}>
            {record?.pegawai_simaster?.opd_master}
          </Text>
        </Stack>
      ),
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BugOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            🔍 Jenis Anomali
          </Text>
        </Space>
      ),
      dataIndex: "jenis_anomali_nama",
      key: "jenis_anomali",
      render: (text) => (
        <div
          style={{
            padding: isMobile ? "8px" : "12px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #fff 0%, #f8f9fa 100%)",
            border: "1px solid #e8e8e8",
            textAlign: "center",
            transition: "all 0.3s ease",
          }}
        >
          <Tag
            color="purple"
            style={{
              borderRadius: "16px",
              fontSize: isMobile ? "9px" : "10px",
              fontWeight: 600,
              padding: "4px 8px",
              margin: 0,
              maxWidth: "100%",
              display: "inline-block",
              textAlign: "center",
            }}
          >
            {text}
          </Tag>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            ✅ Status Perbaikan
          </Text>
        </Space>
      ),
      key: "sudah_diperbaiki",
      align: "center",
      render: (record) => (
        <Tag
          color={record.is_repaired ? "success" : "error"}
          icon={
            record.is_repaired ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
        >
          {record.is_repaired ? "Sudah" : "Belum"}
        </Tag>
      ),
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            👨‍💻 Dikelola Oleh
          </Text>
        </Space>
      ),
      key: "oleh",
      render: (record) => (
        <Text
          style={{
            fontSize: isMobile ? "10px" : "12px",
            fontWeight: 600,
            color: "#1890ff",
          }}
        >
          {record?.user?.username || "N/A"}
        </Text>
      ),
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            📝 Deskripsi
          </Text>
        </Space>
      ),
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Text
          style={{
            fontSize: isMobile ? "10px" : "11px",
            color: "#666",
            fontWeight: 500,
            lineHeight: 1.4,
          }}
          ellipsis={{ tooltip: text }}
        >
          {text || "Tidak ada deskripsi"}
        </Text>
      ),
    },
    {
      title: (
        <Space>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EyeOutlined style={{ color: "white", fontSize: "10px" }} />
          </div>
          <Text strong style={{ color: "#1a1a1a" }}>
            ⚡ Aksi
          </Text>
        </Space>
      ),
      key: "action",
      align: "center",
      render: (record) => (
        <Tooltip title={`Lihat detail pegawai NIP: ${record?.nip_baru}`}>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              router.push(
                `/apps-managements/integrasi/siasn/${record?.nip_baru}`
              );
            }}
            icon={<EyeOutlined />}
          >
            {isMobile ? "Detail" : "Detail"}
          </Button>
        </Tooltip>
      ),
    },
  ];

  const handleSearch = (value) => {
    const searchValue = value?.trim() || undefined;
    router.push({
      pathname: "/apps-managements/anomali-data-2023",
      query: {
        ...query,
        search: searchValue,
        page: 1,
      },
    });
  };

  const clearFilter = () => {
    const { jenis_anomali, is_repaired, search, ...restQuery } = router.query;
    router.push({
      pathname: "/apps-managements/anomali-data-2023",
      query: { ...restQuery, page: 1 },
    });
  };

  const handleSelectChange = (value) => {
    router.push({
      pathname: "/apps-managements/anomali-data-2023",
      query: {
        ...query,
        jenis_anomali: value,
        page: 1,
      },
    });
  };

  const handleCheckboxChange = (checked) => {
    router.push({
      pathname: "/apps-managements/anomali-data-2023",
      query: {
        ...query,
        is_repaired: checked ? true : undefined,
        page: 1,
      },
    });
  };

  const Filter = () => {
    return (
      <Flex vertical gap={isMobile ? 8 : 12}>
        <Flex
          align={isMobile ? "flex-start" : "center"}
          gap={isMobile ? 8 : 12}
          wrap
          justify="space-between"
          vertical={isMobile}
        >
          <Flex
            align="center"
            gap={isMobile ? 8 : isTablet ? 10 : 12}
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
              <SearchOutlined
                style={{
                  color: "#666",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
              <Input.Search
                placeholder={
                  isMobile
                    ? "Cari NIP/Nama..."
                    : "Cari berdasarkan NIP atau nama pegawai..."
                }
                defaultValue={query?.search}
                onSearch={handleSearch}
                style={{
                  width: isMobile ? 140 : isTablet ? 180 : 250,
                }}
                allowClear
                size={isMobile ? "small" : "middle"}
                enterButton={
                  <Button type="primary" size={isMobile ? "small" : "middle"}>
                    Cari
                  </Button>
                }
              />
            </Flex>

            <Flex align="center" gap={6}>
              <BugOutlined
                style={{
                  color: "#666",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
              <Select
                placeholder="Jenis Anomali"
                value={query?.jenis_anomali}
                onChange={handleSelectChange}
                style={{ width: isMobile ? 140 : isTablet ? 160 : 200 }}
                allowClear
                size={isMobile ? "small" : "middle"}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {anomaliTypes.map((item) => (
                  <Select.Option key={item} value={item}>
                    {item}
                  </Select.Option>
                ))}
              </Select>
            </Flex>

            <Flex align="center" gap={6}>
              <div
                style={{
                  width: isMobile ? "12px" : "14px",
                  height: isMobile ? "12px" : "14px",
                  borderRadius: "4px",
                  background:
                    "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: "8px", fontWeight: 600 }}
                >
                  ✓
                </Text>
              </div>
              <Checkbox
                checked={query?.is_repaired === "true"}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                style={{
                  fontSize: isMobile ? "11px" : "14px",
                  fontWeight: 500,
                }}
              >
                <Text
                  style={{
                    color: "#1a1a1a",
                    fontSize: isMobile ? "11px" : "14px",
                    fontWeight: 500,
                  }}
                >
                  Sudah Diperbaiki
                </Text>
              </Checkbox>
            </Flex>

            {(query?.jenis_anomali || query?.is_repaired || query?.search) && (
              <Button size="small" onClick={clearFilter}>
                Clear All
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Active Filter Tags */}
        {(query?.jenis_anomali || query?.is_repaired || query?.search) && (
          <Flex align="center" gap={8} wrap>
            {query?.jenis_anomali && (
              <Tag
                color="purple"
                closable
                onClose={() => {
                  const { jenis_anomali, ...restQuery } = router.query;
                  router.push({
                    pathname: "/apps-managements/anomali-data-2023",
                    query: { ...restQuery, page: 1 },
                  });
                }}
                style={{
                  borderRadius: "12px",
                  fontSize: "11px",
                  padding: "2px 8px",
                }}
              >
                🔍 {query.jenis_anomali}
              </Tag>
            )}

            {query?.search && (
              <Tag
                color="blue"
                closable
                onClose={() => {
                  const { search, ...restQuery } = router.query;
                  router.push({
                    pathname: "/apps-managements/anomali-data-2023",
                    query: { ...restQuery, page: 1 },
                  });
                }}
                style={{
                  borderRadius: "12px",
                  fontSize: "11px",
                  padding: "2px 8px",
                }}
              >
                🔍 &quot;{query.search}&quot;
              </Tag>
            )}

            {query?.is_repaired && (
              <Tag
                color="green"
                closable
                onClose={() => {
                  const { is_repaired, ...restQuery } = router.query;
                  router.push({
                    pathname: "/apps-managements/anomali-data-2023",
                    query: { ...restQuery, page: 1 },
                  });
                }}
                style={{
                  borderRadius: "12px",
                  fontSize: "11px",
                  padding: "2px 8px",
                }}
              >
                ✓ Sudah Diperbaiki
              </Tag>
            )}
          </Flex>
        )}
      </Flex>
    );
  };

  const handleChangePage = (page) => {
    const currentQuery = {
      ...query,
      page: page,
    };
    router.push({
      pathname: "/apps-managements/anomali-data-2023",
      query: currentQuery,
    });
  };

  const handleChangeCheckbox = (value) => {
    const checked = value.target.checked;
    const currentQuery = {
      ...query,
      is_repaired: checked,
      page: 1,
    };
    router.push({
      pathname: "/apps-managements/anomali-data-2023",
      query: currentQuery,
    });
  };

  const queryClient = useQueryClient();

  const { mutateAsync: hapusAnomali, isLoading: isLoadingHapus } = useMutation({
    mutationFn: () => deleteAllAnomali2023(),
    onSuccess: () => {
      message.success("Data anomali berhasil dihapus");
    },
    onError: () => {
      message.error("Gagal menghapus data anomali");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["anomali-2023"]);
    },
  });

  const handleHapusSemua = () => {
    Modal.confirm({
      title: "Hapus Semua Data Anomali",
      content: "Apakah anda yakin ingin menghapus semua data anomali?",
      onOk: async () => {
        await hapusAnomali();
      },
    });
  };

  return (
    <div>
      {/* Header */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex align="center" gap={isMobile ? 12 : 16} wrap>
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
            <DatabaseOutlined
              style={{
                color: "white",
                fontSize: isMobile ? "16px" : "20px",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Title
              level={isMobile ? 4 : 3}
              style={{ margin: 0, color: "#1a1a1a" }}
            >
              🔍 Data Anomali 2023
            </Title>
            <Text
              type="secondary"
              style={{ fontSize: isMobile ? "12px" : "14px" }}
            >
              Monitoring dan pengelolaan data anomali pegawai tahun 2023
            </Text>
          </div>
        </Flex>
      </Card>

      {/* Actions Card */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Flex
          align={isMobile ? "flex-start" : "center"}
          gap={isMobile ? 12 : 16}
          wrap
          justify="space-between"
          vertical={isMobile}
        >
          <Flex align="center" gap={8}>
            <UploadOutlined
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
              Kelola Data:
            </Text>
          </Flex>
          <Space
            direction={isMobile ? "vertical" : "horizontal"}
            style={{ width: isMobile ? "100%" : "auto" }}
          >
            <UploadExcel />
            <Button
              type="primary"
              loading={isLoadingDownload}
              onClick={handleDownload}
              disabled={isLoadingDownload}
              icon={<DownloadOutlined />}
              size={isMobile ? "small" : "middle"}
            >
              {isMobile ? "Download" : "Download Excel"}
            </Button>
            <Button danger onClick={handleHapusSemua}>
              Hapus Semua
            </Button>
          </Space>
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
        <Filter />
      </Card>

      {/* Stats Card */}
      {data && (
        <Card
          style={{
            marginBottom: isMobile ? "12px" : "20px",
            borderRadius: isMobile ? "8px" : "12px",
            border: "1px solid #e8e8e8",
          }}
        >
          <Flex justify="space-around" align="center" wrap>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#FF4500",
                }}
              >
                {data.total?.toLocaleString() || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Total Anomali
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#52c41a",
                }}
              >
                {data.data?.filter((item) => item.is_repaired).length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Sudah Diperbaiki
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#ff4d4f",
                }}
              >
                {data.data?.filter((item) => !item.is_repaired).length || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Belum Diperbaiki
              </Text>
            </Flex>
            <Flex vertical align="center" style={{ minWidth: "80px" }}>
              <Text
                style={{
                  fontSize: isMobile ? "18px" : "24px",
                  fontWeight: 600,
                  color: "#722ed1",
                }}
              >
                {new Set(
                  data.data?.map((item) => item.nip_baru).filter(Boolean)
                ).size || 0}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: isMobile ? "10px" : "12px" }}
              >
                Pegawai Unik
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Table */}
      <Card
        style={{
          marginBottom: isMobile ? "12px" : "20px",
          borderRadius: isMobile ? "8px" : "12px",
          border: "1px solid #e8e8e8",
        }}
      >
        <Table
          dataSource={data?.data}
          columns={columns}
          loading={isLoading || isFetching}
          rowKey="id"
          size={isMobile ? "small" : "middle"}
          scroll={{ x: isMobile ? 800 : isTablet ? 1000 : undefined }}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          pagination={{
            onChange: handleChangePage,
            current: parseInt(query?.page) || 1,
            pageSize: parseInt(query?.limit) || 20,
            total: data?.total,
            showTotal: (total, range) => (
              <Text
                style={{ color: "#666", fontSize: isMobile ? "11px" : "14px" }}
              >
                {isMobile ? (
                  `${range[0]}-${range[1]} / ${total.toLocaleString()}`
                ) : (
                  <>
                    Menampilkan{" "}
                    <Text strong style={{ color: "#FF4500" }}>
                      {range[0]}-{range[1]}
                    </Text>{" "}
                    dari{" "}
                    <Text strong style={{ color: "#FF4500" }}>
                      {total.toLocaleString()}
                    </Text>{" "}
                    data anomali
                  </>
                )}
              </Text>
            ),
            showSizeChanger: !isMobile,
            pageSizeOptions: ["10", "20", "30", "50"],
            simple: isMobile,
            style: {
              marginTop: isMobile ? "12px" : "20px",
              padding: isMobile ? "8px 0" : "16px 0",
              borderTop: "1px solid #f0f0f0",
            },
          }}
        />
      </Card>

      {/* Charts Section */}
      <AggregateAnomali23 />
    </div>
  );
};

const AggregateAnomali23 = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading, isFetching } = useQuery(
    ["aggregate-anomali-2023"],
    () => aggregateAnomali2023()
  );

  if (isLoading || isFetching) {
    return (
      <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]}>
        {[1, 2, 3, 4].map((item) => (
          <Col md={12} xs={24} key={item}>
            <Card
              style={{
                borderRadius: isMobile ? "8px" : "12px",
                border: "1px solid #e8e8e8",
              }}
            >
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[isMobile ? 12 : 20, isMobile ? 12 : 20]}>
      <Col md={12} xs={24}>
        <Card
          style={{
            borderRadius: isMobile ? "8px" : "12px",
          }}
          title={
            <Flex align="center" gap={8}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #FF4500 0%, #ff6b35 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserOutlined style={{ color: "white", fontSize: "10px" }} />
              </div>
              <Text
                strong
                style={{
                  color: "#1a1a1a",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                📊 Aktivitas Admin
              </Text>
            </Flex>
          }
          hoverable
        >
          <UserByDateAnomali />
        </Card>
      </Col>
      <Col md={12} xs={24}>
        <Card
          style={{
            borderRadius: isMobile ? "8px" : "12px",
          }}
          title={
            <Flex align="center" gap={8}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #722ed1 0%, #9254de 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PieChartOutlined
                  style={{ color: "white", fontSize: "10px" }}
                />
              </div>
              <Text
                strong
                style={{
                  color: "#1a1a1a",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                📈 Distribusi Status
              </Text>
            </Flex>
          }
          hoverable
        >
          <PieChart data={data?.pieChart} />
        </Card>
      </Col>
      <Col md={12} xs={24}>
        <Card
          style={{
            borderRadius: isMobile ? "8px" : "12px",
          }}
          title={
            <Flex align="center" gap={8}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChartOutlined
                  style={{ color: "white", fontSize: "10px" }}
                />
              </div>
              <Text
                strong
                style={{
                  color: "#1a1a1a",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                📊 Progress Perbaikan
              </Text>
            </Flex>
          }
          hoverable
        >
          <BarChart data={data?.barFirst} />
        </Card>
      </Col>
      <Col md={12} xs={24}>
        <Card
          style={{
            borderRadius: isMobile ? "8px" : "12px",
          }}
          title={
            <Flex align="center" gap={8}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <UserOutlined style={{ color: "white", fontSize: "10px" }} />
              </div>
              <Text
                strong
                style={{
                  color: "#1a1a1a",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                👥 Progress per User
              </Text>
            </Flex>
          }
          hoverable
        >
          <BarChart2 data={data?.barSecond} />
        </Card>
      </Col>
    </Row>
  );
};

function AnomaliMainPages() {
  useScrollRestoration();

  return (
    <>
      <PageContainer
        title="Buku Kerja Anomali 2023"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/integrasi/siasn">Integrasi</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Anomali 2023</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        <ListAnomali />
      </PageContainer>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #ffffff !important;
          color: #1a1a1a !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #ff4500 !important;
          padding: 12px 8px !important;
          font-size: 12px !important;
        }

        @media (min-width: 768px) {
          .ant-table-thead > tr > th {
            padding: 16px 12px !important;
            font-size: 14px !important;
          }
        }

        .ant-table-thead > tr > th:first-child {
          border-top-left-radius: 8px !important;
        }

        .ant-table-thead > tr > th:last-child {
          border-top-right-radius: 8px !important;
        }

        .table-row-light {
          background-color: #ffffff !important;
        }

        .table-row-dark {
          background-color: #fafafa !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #fff7e6 !important;
          transition: all 0.2s ease !important;
        }

        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: 8px 6px !important;
          transition: all 0.2s ease !important;
        }

        @media (min-width: 768px) {
          .ant-table-tbody > tr > td {
            padding: 12px !important;
          }
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

        .ant-table-container {
          border-radius: 8px !important;
          overflow: hidden !important;
        }

        @media (max-width: 768px) {
          .ant-table-pagination {
            text-align: center !important;
          }

          .ant-pagination-simple .ant-pagination-simple-pager {
            margin: 0 8px !important;
          }

          .ant-card-head {
            padding: 12px 16px !important;
          }

          .ant-card-body {
            padding: 16px !important;
          }

          .ant-btn {
            height: 28px !important;
            padding: 0 12px !important;
            font-size: 12px !important;
          }
        }
      `}</style>
    </>
  );
}

export default AnomaliMainPages;
