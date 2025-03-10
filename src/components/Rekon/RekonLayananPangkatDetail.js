import {
  getRekonPangkatByPegawai,
  getUnorSimaster,
} from "@/services/rekon.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  Card,
  Table,
  Typography,
  Space,
  Avatar,
  Input,
  Button,
  TreeSelect,
  Row,
  Col,
  DatePicker,
  Tooltip,
} from "antd";

import { FilePdfOutlined, SearchOutlined } from "@ant-design/icons";
import { clearQuery } from "@/utils/client-utils";
import dayjs from "dayjs";
import useScrollRestoration from "@/hooks/useScrollRestoration";

const DEFAULT_PERIODE = "01-04-2025";
const queryFormat = "DD-MM-YYYY";
const format = "MM-YYYY";

const getFirstDayOfMonth = (date) => {
  return dayjs(date).startOf("month").format(queryFormat);
};

const Filter = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["rekon-unor-simaster"],
    () => getUnorSimaster(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleChange = (value) => {
    const query = clearQuery({
      ...router?.query,
      skpd_id: value,
      page: 1,
    });
    router.push({ pathname: "/rekon/dashboard/kenaikan-pangkat", query });
  };

  const handleChangePeriode = (value) => {
    const query = clearQuery({
      ...router?.query,
      tmtKp: getFirstDayOfMonth(value),
      page: 1,
    });
    router.push({ pathname: "/rekon/dashboard/kenaikan-pangkat", query });
  };

  return (
    <Row gutter={[12, 12]}>
      <Col md={12} xs={24}>
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
      </Col>
      <Col md={12} xs={24}>
        <DatePicker.MonthPicker
          format={{
            format,
            type: "mask",
          }}
          onChange={handleChangePeriode}
          allowClear={false}
          defaultValue={dayjs(DEFAULT_PERIODE, queryFormat)}
          disabledDate={(current) => {
            return (
              current &&
              (current.month() === 0 || // Januari
                current.month() === 2 || // Maret
                current.month() === 4 || // Mei
                current.month() === 6 || // Juli
                current.month() === 8 || // September
                current.month() === 10) // November
            );
          }}
        />
      </Col>
    </Row>
  );
};

function RekonLayananPangkatDetail() {
  useScrollRestoration();
  const router = useRouter();
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["rekon-pangkat-by-pegawai", router?.query],
    queryFn: () => getRekonPangkatByPegawai(router?.query),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

  const handleChange = (pagination, filters, sorter, extra) => {
    console.log(sorter);
    const query = clearQuery({
      ...router?.query,
      page: pagination?.current,
      perPage: pagination?.pageSize,
      sort: sorter?.columnKey,
      order: sorter?.order,
    });

    router.push({
      pathname: "/rekon/dashboard/kenaikan-pangkat",
      query,
    });
  };

  const handleSearch = (value) => {
    const query = clearQuery({
      ...router?.query,
      search: value,
      page: 1,
    });
    router.push({ pathname: "/rekon/dashboard/kenaikan-pangkat", query });
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

  const columns = [
    {
      title: "File",
      dataIndex: "file",
      render: (_, record) => {
        return (
          <Space>
            {record?.path_ttd_sk && (
              <Tooltip title="File SK">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  rel="noopener noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: "Foto",
      dataIndex: "foto_master",
      render: (text) => <Avatar size={90} shape="square" src={text} />,
    },
    {
      title: "Nama",
      key: "nama_master",
      render: (_, record) => (
        <Space direction="vertical">
          <Typography.Link
            onClick={() =>
              router.push(`/rekon/pegawai/${record?.nip_master}/detail`)
            }
          >
            {record?.nama_master}
          </Typography.Link>
          <Typography.Text>{record?.nip_master}</Typography.Text>
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
    },
    {
      title: "TMT KP",
      dataIndex: "tmtKp",
    },
    {
      title: "Status Usulan",
      dataIndex: "statusUsulanNama",
    },
    {
      title: "Jenis KP",
      dataIndex: "jenis_kp",
    },
    {
      title: "Alasan tolak",
      key: "alasan_tolak_tambahan",
      dataIndex: "alasan_tolak_tambahan",
      sorter: true,
    },

    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
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
    <Row gutter={[12, 12]}>
      <Col md={24} xs={24}>
        <Filter />
      </Col>
      <Col md={24} xs={24}>
        <Card>
          <Table
            columns={columns}
            pagination={{
              current: router?.query?.page,
              pageSize: 10,
              position: ["bottomRight", "topRight"],
              showSizeChanger: false,
              total: data?.totalData,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total}`,
            }}
            onChange={handleChange}
            dataSource={data?.data}
            loading={isLoading || isFetching}
          />
        </Card>
      </Col>
    </Row>
  );
}

export default RekonLayananPangkatDetail;
