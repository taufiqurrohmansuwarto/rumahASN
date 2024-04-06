import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  FloatButton,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import { useEffect, useState } from "react";

import QueryFilter from "@/components/QueryFilter";
import {
  aggregateAnomali2023,
  daftarAnomali23,
  downloadAnomali2023,
  uploadDataAnomali2023,
} from "@/services/anomali.services";
import { UploadOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import UserByDateAnomali from "@/components/Anomali/UserByDateAnomali";
import Pie from "@/components/Plots/Pie";
import Bar from "@/components/Plots/Bar";

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
  "BELUM_SKP_TH_BERJALAN",
  "BUP masih Aktif",
  "CPNS_LEBIH_2TH",
  "FORMASI_JF_BELUMDIANGKAT",
  "UNOR_NONAKTIF",
  "JABATAN_KOSONG",
  "TMTCPNS_LBHBESAR_TMTPNS",
  "STRUKTURAL GANDA",
];

const UploadExcel = () => {
  const [fileList, setFileList] = useState([]);

  const { mutateAsync, isLoading } = useMutation((data) =>
    uploadDataAnomali2023(data)
  );

  const handleUpload = async () => {
    try {
      const file = fileList[0];
      const formData = new FormData();
      formData.append("file", file);
      await mutateAsync(formData);
      message.success("Berhasil mengunggah file");
    } catch (error) {
      message.error("Gagal mengunggah file");
    }
  };
  const props = {
    beforeUpload: (file) => {
      // console.log(file);
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <>
      <Upload
        showUploadList={{
          downloadIcon: false,
          previewIcon: false,
          removeIcon: false,
          showDownloadIcon: false,
          showPreviewIcon: false,
          showRemoveIcon: false,
        }}
        {...props}
        multiple={false}
        fileList={fileList}
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>
      <Button
        type="primary"
        onClick={handleUpload}
        disabled={isLoading || fileList.length === 0}
        loading={isLoading}
        style={{
          marginTop: 16,
        }}
      >
        {isLoading ? "Uploading" : "Start Upload"}
      </Button>
    </>
  );
};

const ListAnomali = () => {
  const router = useRouter();
  const query = router.query;

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
        link.download = "file.xlsx";
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
      title: "NIP",
      key: "nip_baru",
      render: (text) => (
        <Link href={`/apps-managements/integrasi/siasn/${text?.nip_baru}`}>
          <a>{text.nip_baru}</a>
        </Link>
      ),
    },

    {
      title: "Jenis Anomali",
      dataIndex: "jenis_anomali_nama",
    },
    {
      title: "Sudah Diperbaiki?",
      key: "sudah_diperbaiki",
      render: (text) => (
        <Tag color={text.is_repaired ? "green" : "red"}>
          {text.is_repaired ? "Sudah" : "Belum"}
        </Tag>
      ),
    },
    {
      title: "Oleh",
      key: "oleh",
      render: (text) => <>{text?.user?.username}</>,
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
    },
  ];

  const Filter = () => {
    const [form] = Form.useForm();
    const router = useRouter();
    const query = router.query;

    useEffect(() => {
      form.setFieldsValue({
        jenis_anomali: query?.jenis_anomali,
        is_repaired:
          query?.is_repaired === "true" || query?.is_repaired === true,
      });
    }, [query, form]);

    const handleReset = () => {
      form.resetFields();
      router.push({
        pathname: "/apps-managements/anomali-data-2023",
        query: {},
      });
    };

    const handleFinish = (value) => {
      console.log(value);
      router.push({
        pathname: "/apps-managements/anomali-data-2023",
        query: {
          ...query,
          ...value,
          page: 1,
        },
      });
    };

    return (
      <QueryFilter
        form={form}
        onFinish={handleFinish}
        onReset={handleReset}
        layout="vertical"
        defaultCollapsed
        collapseRender={(collapsed) =>
          collapsed ? "Filter" : "Sembunyikan Filter"
        }
        submitter={{
          searchConfig: {
            resetText: "Reset",
            submitText: "Cari",
          },
        }}
      >
        <Form.Item name="jenis_anomali" label="Pilih Jenis Anomali">
          <Select
            allowClear
            style={{
              width: "100%",
            }}
          >
            {anomaliTypes.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          valuePropName="checked"
          name="is_repaired"
          label="Sudah diperbaiki?"
        >
          <Checkbox />
        </Form.Item>
      </QueryFilter>
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

  return (
    <>
      <Card
        title="Data Anomali 2023"
        style={{
          marginBottom: 12,
        }}
      >
        <Space direction="vertical">
          <UploadExcel />
          <Button
            loading={isLoadingDownload}
            onClick={handleDownload}
            disabled={isLoadingDownload}
          >
            Download
          </Button>
        </Space>
        <Filter />
        <Table
          size="small"
          pagination={{
            onChange: handleChangePage,
            position: ["bottomRight", "topRight"],
            pageSize: parseInt(query?.limit) || 20,
            showSizeChanger: false,
            total: data?.total,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} data`,
            current: parseInt(query?.page) || 1,
          }}
          dataSource={data?.data}
          loading={isLoading || isFetching}
          columns={columns}
        />
      </Card>
      <AggregateAnomali23 />
    </>
  );
};

const AggregateAnomali23 = () => {
  const { data, isLoading, isFetching } = useQuery(
    ["aggregate-anomali-2023"],
    () => aggregateAnomali2023()
  );

  return (
    <Skeleton loading={isLoading || isFetching}>
      <Row gutter={[12, 12]}>
        <Col md={12} xs={24}>
          <Card title="Pekerjaan admin berdasarkan tanggal">
            <UserByDateAnomali />
          </Card>
        </Col>
        <Col md={12} xs={24}>
          <Card title="Persentase">
            <PieChart data={data?.pieChart} />
          </Card>
        </Col>
        <Col md={12} xs={24}>
          <Card title="Progress">
            <BarChart data={data?.barFirst} />
          </Card>
        </Col>
        <Col md={12} xs={24}>
          <Card title="Progress User">
            <BarChart2 data={data?.barSecond} />
          </Card>
        </Col>
      </Row>
    </Skeleton>
  );
};

function AnomaliData2023() {
  const router = useRouter();

  useEffect(() => {
    // On before route change save scroll position
    router.events.on("routeChangeStart", saveScrollPosition);
    // On route change restore scroll position
    router.events.on("routeChangeComplete", restoreScrollPosition);

    return () => {
      router.events.off("routeChangeStart", saveScrollPosition);
      router.events.off("routeChangeComplete", restoreScrollPosition);
    };
  }, [router]);

  function saveScrollPosition() {
    window.sessionStorage.setItem("scrollPosition", window.scrollY.toString());
  }

  function restoreScrollPosition() {
    const scrollY = window.sessionStorage.getItem("scrollPosition") ?? "0";
    window.scrollTo(0, parseInt(scrollY));
  }

  return (
    <>
      <Head>
        <title>Anomali Data 2023</title>
      </Head>
      <PageContainer
        title="Buku Kerja Anomali 2023"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/integrasi/siasn">
                  <a>Integrasi</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Anomali 2023</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
        <ListAnomali />
      </PageContainer>
    </>
  );
}

AnomaliData2023.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/anomali-data-2023">{page}</Layout>;
};

AnomaliData2023.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default AnomaliData2023;
