import {
  Avatar,
  Card,
  Col,
  Input,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  getEmployeeIPASN,
  getRekonIPASNDashboard,
  getUnorSimaster,
} from "@/services/rekon.services";
import { Form, TreeSelect, Button } from "antd";
import { FileExcelOutlined, SearchOutlined } from "@ant-design/icons";
import XLSX from "xlsx";
import { clearQuery } from "@/utils/client-utils";
import useScrollRestoration from "@/hooks/useScrollRestoration";

const DetailIPASN = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["rekon-ipasn-detail", router?.query?.skpd_id],
    queryFn: () =>
      getRekonIPASNDashboard({
        skpd_id: router?.query?.skpd_id,
        type: "test",
      }),
  });

  return (
    <>
      <Row gutter={[12, 12]}>
        <Col md={8} xs={24} sm={24}>
          <Card>
            <Statistic title="PNS" value={data?.data?.rerata_total_pns} />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kompetensi (PNS)"
              value={data?.data?.rerata_kompetensi_pns}
              suffix="/ 40"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Disiplin (PNS)"
              value={data?.data?.rerata_disiplin_pns}
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kinerja (PNS)"
              value={data?.data?.rerata_kinerja_pns}
              suffix="/ 30"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Pendidikan (PNS)"
              value={data?.data?.rerata_kualifikasi_pns}
              suffix="/ 25"
            />
          </Card>
        </Col>
        <Col md={8} xs={24} sm={24}>
          <Card>
            <Statistic title="PPPK" value={data?.data?.rerata_total_pppk} />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kompetensi (PPPK)"
              value={data?.data?.rerata_kompetensi_pppk}
              suffix="/ 40"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Disiplin (PPPK)"
              value={data?.data?.rerata_disiplin_pppk}
              suffix="/ 5"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Kinerja (PPPK)"
              value={data?.data?.rerata_kinerja_pppk}
              suffix="/ 30"
            />
          </Card>
        </Col>
        <Col md={4} xs={24} sm={12}>
          <Card>
            <Statistic
              title="Pendidikan (PPPK)"
              value={data?.data?.rerata_kualifikasi_pppk}
              suffix="/ 25"
            />
          </Card>
        </Col>
      </Row>
    </>
  );
};

const EmployeeIPASN = () => {
  useScrollRestoration();
  const router = useRouter();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rekon-ipasn-employees", router?.query],
    queryFn: () => getEmployeeIPASN(router?.query),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const handleTableChange = (pagination, filters, sorter) => {
    const query = clearQuery({
      ...router?.query,
      page: pagination?.current || router?.query?.page, // Gunakan current page dari pagination
      perPage: pagination?.pageSize,
      sort: sorter?.field,
      order: sorter?.order,
    });

    router.push({
      pathname: "/rekon/dashboard/ipasn",
      query,
    });
  };

  const handleSearch = (value) => {
    const query = clearQuery({
      ...router?.query,
      search: value || undefined,
      page: 1, // Reset ke halaman pertama saat pencarian
    });

    router.push({
      pathname: "/rekon/dashboard/ipasn",
      query,
    });
  };

  const renderSearchFilter = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => (
    <div style={{ padding: 8 }}>
      <Input
        placeholder="Cari nama"
        value={selectedKeys[0] || router?.query?.search}
        onChange={(e) =>
          setSelectedKeys(e.target.value ? [e.target.value] : [])
        }
        onPressEnter={() => {
          confirm();
          handleSearch(selectedKeys[0]);
        }}
        style={{ width: 300, marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => {
            confirm();
            handleSearch(selectedKeys[0]);
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
            setSelectedKeys([]); // Pastikan state lokal juga direset
            handleSearch(undefined); // Kirim undefined untuk menghapus parameter search
          }}
          size="small"
          style={{ width: 90 }}
        >
          Reset
        </Button>
      </Space>
    </div>
  );

  const renderValue = (value, max) => `${value || 0}/${max}`;

  const columns = [
    {
      title: "Foto",
      dataIndex: "foto_master",
      render: (text) => <Avatar size={90} shape="square" src={text} />,
    },
    {
      title: "Nama",
      key: "nama_master",
      width: 250,
      render: (_, record) => (
        <Space direction="vertical">
          <Typography.Link
            onClick={() =>
              router.push(`/rekon/pegawai/${record?.nip_master}/detail`)
            }
          >
            {record?.nama_master}
          </Typography.Link>
          <Typography.Text>{record?.nip}</Typography.Text>
          <Typography.Text strong>{record?.jabatan_master}</Typography.Text>
        </Space>
      ),
      sorter: true,
      filterSearch: true,
      filterDropdown: renderSearchFilter,
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
      ),
    },
    {
      title: "Perangkat Daerah",
      dataIndex: "opd_master",
      sorter: true,
      render: (text) => text || "-",
    },
    {
      title: "Status Kepegawaian",
      dataIndex: "status_master",
    },
    {
      title: "Kualifikasi",
      dataIndex: "kualifikasi",
      sorter: true,
      render: (value) => renderValue(value, 25),
    },
    {
      title: "Kompetensi",
      dataIndex: "kompetensi",
      sorter: true,
      render: (value) => renderValue(value, 40),
    },
    {
      title: "Kinerja",
      dataIndex: "kinerja",
      sorter: true,
      render: (value) => renderValue(value, 30),
    },
    {
      title: "Disiplin",
      dataIndex: "disiplin",
      sorter: true,
      render: (value) => renderValue(value, 5),
    },
    {
      title: "Total",
      dataIndex: "total",
      sorter: true,
      render: (value) => renderValue(value, 100),
    },

    {
      title: "Aksi",
      key: "aksi",
      render: () => (
        <a
          onClick={() =>
            router.push(`/rekon/pegawai/${record?.nip_master}/detail`)
          }
        >
          <SearchOutlined />
        </a>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={data?.data}
      loading={isLoading || isFetching}
      rowKey="nip"
      onChange={handleTableChange}
      pagination={{
        position: ["bottomRight", "topRight"],
        showSizeChanger: false,
        total: data?.totalData,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} items`,
        pageSize: data?.perPage,
        current: data?.page,
      }}
    />
  );
};

const RekonIPASNDetail = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["rekon-unor-simaster"],
    () => getUnorSimaster(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { mutateAsync: rekonIpasn, isLoading: isRekonIpasnLoading } =
    useMutation({
      mutationFn: () => getRekonIPASN({ skpd_id: router?.query?.skpd_id }),
    });

  const handleDownload = async () => {
    const result = await rekonIpasn();
    const { data, averageTotal } = result;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "IPASN");
    XLSX.writeFile(workbook, "IPASN.xlsx");
  };

  const handleChange = (value) => {
    router.push(`/rekon/dashboard/ipasn?skpd_id=${value}`);
  };

  return (
    <Row gutter={[12, 12]}>
      <Col md={12} xs={24}>
        <Form.Item>
          <TreeSelect
            treeNodeFilterProp="title"
            placeholder="Ketik nama unit organisasi"
            listHeight={400}
            showSearch
            style={{ width: "100%" }}
            treeData={data}
            value={router?.query?.skpd_id}
            onSelect={handleChange}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Button
          icon={<FileExcelOutlined />}
          type="primary"
          loading={isRekonIpasnLoading}
          disabled={isRekonIpasnLoading}
          onClick={handleDownload}
        >
          Unduh Data
        </Button>
      </Col>
      <Col md={24} xs={24}>
        <Card>
          <DetailIPASN />
        </Card>
      </Col>
      <Col md={24} xs={24}>
        <Card>
          <EmployeeIPASN />
        </Card>
      </Col>
    </Row>
  );
};

export default RekonIPASNDetail;
