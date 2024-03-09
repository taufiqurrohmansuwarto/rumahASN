import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ReactJson from "@/components/ReactJson";
import { dataSealById, logBsreSeal } from "@/services/log.services";
import { formatDateFull } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Card,
  Collapse,
  Input,
  Modal,
  Skeleton,
  Space,
  Table,
  Tag,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ModalDetail = ({ itemid, open, onClose }) => {
  const {
    data: dataResponseSeal,
    isLoading: isLoadingSeal,
    isFetching,
    refetch,
  } = useQuery(["data-seal", itemid], () => dataSealById(itemid), {
    refetchOnWindowFocus: false,
    enabled: false,
  });

  useEffect(() => {
    if (itemid) {
      refetch();
    }
  }, [itemid, refetch]);

  return (
    <Modal
      title={`Data seal dengan nomer ${itemid}`}
      open={open}
      onCancel={onClose}
      width={800}
    >
      <Skeleton loading={isFetching}>
        {dataResponseSeal && (
          <Collapse>
            <Collapse.Panel header="Request Data" key="1">
              <div
                style={{
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                <ReactJson src={JSON?.parse(dataResponseSeal?.request_data)} />
              </div>
            </Collapse.Panel>
            <Collapse.Panel header="Response Data" key="2">
              <div
                style={{
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                <ReactJson src={JSON?.parse(dataResponseSeal?.response_data)} />
              </div>
            </Collapse.Panel>
          </Collapse>
        )}
      </Skeleton>
    </Modal>
  );
};

function LogBSRE() {
  const router = useRouter();

  const [query, setQuery] = useState({
    page: router?.query?.page || 1,
    limit: router?.query?.limit || 25,
  });

  const [itemId, setItemId] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (item) => {
    setItemId(item?.id);
    setOpenModal(true);
  };

  const handleChange = (page) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page,
      },
    });

    setQuery((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleSearch = (value) => {
    if (!value) {
      value = undefined;
    }

    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        search: value,
        page: 1,
      },
    });

    setQuery((prev) => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const handleCloseModal = () => {
    setItemId(null);
    setOpenModal(false);
  };

  const { data, isLoading, isFetching } = useQuery(
    ["log-bsre-seal", query],
    () => logBsreSeal(query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  const columns = [
    {
      title: "Nama / Cara Masuk",
      key: "nama",
      render: (text) => (
        <Space>
          <span>{text?.user?.username}</span>
          <Tag color="yellow">{text?.user?.group}</Tag>
        </Space>
      ),
    },
    {
      title: "Aksi",
      dataIndex: "action",
    },
    {
      title: "Status",
      key: "status",
      render: (item) => {
        return (
          <>
            <Tag
              style={{
                cursor: "pointer",
              }}
              color={item?.status === "SUCCESS" ? "green" : "red"}
            >
              {item?.status}
            </Tag>
          </>
        );
      },
    },
    {
      title: "Waktu",
      key: "waktu",
      render: (item) => <span>{formatDateFull(item?.created_at)}</span>,
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (item) => <a onClick={() => handleOpenModal(item)}>detail</a>,
    },
  ];

  return (
    <>
      <Head>
        <title>Log Unduh Sertifikat TTE</title>
      </Head>
      <PageContainer
        title="Log BSrE"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/webinar-series">
                  <a>Webinar Series</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Log</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Card title="Daftar Log Unduh">
          <ModalDetail
            itemid={itemId}
            open={openModal}
            onClose={handleCloseModal}
          />
          <Table
            loading={isLoading || isFetching}
            title={() => <Input.Search onSearch={handleSearch} enterButton />}
            pagination={{
              position: ["bottomRight", "topRight"],
              showTotal: (total) => `Total ${total} data`,
              showSizeChanger: false,
              current: parseInt(router?.query?.page) || 1,
              pageSize: query?.limit,
              total: data?.total,
              onChange: handleChange,
            }}
            columns={columns}
            dataSource={data?.data}
          />
        </Card>
      </PageContainer>
    </>
  );
}

LogBSRE.getLayout = function getLayout(page) {
  return <Layout active="/logs/bsre">{page}</Layout>;
};

LogBSRE.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogBSRE;
