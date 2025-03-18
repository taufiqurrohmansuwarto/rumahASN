import {
  getRekonPGEmployees,
  getUnorSimaster,
} from "@/services/rekon.services";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  FloatButton,
  Input,
  Row,
  Space,
  Table,
  TreeSelect,
  Modal,
  Typography,
  Tooltip,
} from "antd";
import { useRouter } from "next/router";
import { BookOutlined, SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { clearQuery } from "@/utils/client-utils";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { useState } from "react";

const getFilePath = (record, kode) => {
  const path = record?.dokumen_usulan?.[`${kode}`]?.dok_uri;
  return `/helpdesk/api/siasn/ws/download?filePath=${path}`;
};

const ModalFileUsulan = ({ open, onClose, record }) => {
  return (
    <Modal title="File Usulan" open={open} onCancel={onClose} width={800}>
      <Space direction="vertical">
        <Space>
          <BookOutlined />
          <a
            href={getFilePath(record, "1166")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokumen Tugas Belajar / Surat Pengganti Belajar
          </a>
        </Space>
        <Space>
          <BookOutlined />
          <a
            href={getFilePath(record, "1167")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokumen SK CPNS
          </a>
        </Space>
        <Space>
          <BookOutlined />
          <a
            href={getFilePath(record, "1168")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokumen SK PNS
          </a>
        </Space>
        <Space>
          <BookOutlined />
          <a
            href={getFilePath(record, "1169")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokumen SK Jabatan Fungsional
          </a>
        </Space>
        <Space>
          <BookOutlined />
          <a
            href={getFilePath(record, "1171")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokumen Sertifikat Akreditasi Jurusan
          </a>
        </Space>
        <Space>
          <BookOutlined />
          <a
            href={getFilePath(record, "1172")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokumen Kenaikan Pangkat Terakhir
          </a>
        </Space>
        <Space>
          <BookOutlined />
          <a
            href={getFilePath(record, "1173")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokumen Ijazah
          </a>
        </Space>
        <Space>
          <BookOutlined />
          <a
            href={getFilePath(record, "1174")}
            target="_blank"
            rel="noopener noreferrer"
          >
            Dokumen Transkrip
          </a>
        </Space>
      </Space>
    </Modal>
  );
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
    router.push({ pathname: "/rekon/dashboard/pg", query });
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
          loading={isLoading}
        />
      </Col>
    </Row>
  );
};

function RekonPGDetail() {
  useScrollRestoration();
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["rekon-pg-employees", router?.query],
    queryFn: () => getRekonPGEmployees(router?.query),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });

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

  const [openModal, setOpenModal] = useState(false);
  const [record, setRecord] = useState(null);

  const handleOpenModal = (record) => {
    setOpenModal(true);
    setRecord(record);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setRecord(null);
  };

  const columns = [
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
      title: "Tgl. Usulan",
      key: "tgl_usulan",
      width: 150,
      render: (_, record) => (
        <>
          <Typography.Text>
            {dayjs(record?.tgl_usulan).format("DD-MM-YYYY")}
          </Typography.Text>
        </>
      ),
      sorter: true,
    },
    {
      title: "Perangkat Daerah",
      dataIndex: "opd_master",
    },
    {
      title: "Status Usulan",
      key: "status_usulan_nama",
      dataIndex: "status_usulan_nama",
      sorter: true,
    },

    {
      title: "Alasan Tolak Tambahan",
      key: "alasan_tolak_tambahan",
      dataIndex: "alasan_tolak_tambahan",
      sorter: true,
    },
    {
      title: "Alasan Tolak Nama",
      key: "alasan_tolak_nama",
      dataIndex: "alasan_tolak_nama",
      sorter: true,
    },

    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <Space>
          <a
            onClick={() =>
              router.push(`/rekon/pegawai/${record?.nip_master}/detail`)
            }
          >
            <Tooltip title="Detail">
              <SearchOutlined />
            </Tooltip>
          </a>
          <a onClick={() => handleOpenModal(record)}>
            <Tooltip title="File Usulan">
              <BookOutlined />
            </Tooltip>
          </a>
        </Space>
      ),
    },
  ];

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
      pathname: "/rekon/dashboard/pg",
      query,
    });
  };

  const handleSearch = (value) => {
    const query = clearQuery({
      ...router?.query,
      search: value,
      page: 1,
    });
    router.push({ pathname: "/rekon/dashboard/pg", query });
  };

  return (
    <Card title="Data Usulan PG">
      <FloatButton.BackTop />
      <Filter />
      <Table
        dataSource={data?.data}
        columns={columns}
        rowKey={(row) => row?.id}
        loading={isLoading}
        onChange={handleChange}
        pagination={{
          current: router?.query?.page,
          pageSize: 10,
          position: ["bottomRight", "topRight"],
          showSizeChanger: false,
          total: data?.totalData,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
        }}
      />
      <ModalFileUsulan
        open={openModal}
        onClose={handleCloseModal}
        record={record}
      />
    </Card>
  );
}

export default RekonPGDetail;
