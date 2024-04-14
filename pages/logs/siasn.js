import LogSIASNFilter from "@/components/Filter/LogSIASNFilter";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ReactJson from "@/components/ReactJson";
import { logSIASN } from "@/services/log.services";
import { useQuery } from "@tanstack/react-query";
import {
  BackTop,
  Breadcrumb,
  Card,
  Collapse,
  Modal,
  Space,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { upperCase } from "lodash";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
dayjs.locale("id");
dayjs.extend(relativeTime);

const showModalInformation = (item) => {
  Modal.info({
    title: "Detail Log Seal BSrE",
    centered: true,
    width: 800,
    content: (
      <Collapse>
        <Collapse.Panel header="Request Data" key="1">
          <div
            style={{
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {item?.request_data && (
              <ReactJson src={JSON.parse(item?.request_data)} />
            )}
          </div>
        </Collapse.Panel>
      </Collapse>
    ),
  });
};

function LogSIASN() {
  const router = useRouter();

  const query = router?.query;

  const { data, isLoading, isFetching } = useQuery(
    ["logs-siasn", query],
    () => logSIASN(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const gotoDetail = (nip) => {
    router.push(`/apps-managements/integrasi/siasn/${nip}`);
  };

  const handleChangePage = (page, limit) => {
    router.push({
      pathname: "/logs/siasn",
      query: {
        ...query,
        page,
      },
    });
  };

  const columns = [
    {
      title: "Aktor",
      key: "actor",
      render: (text) => (
        <Space direction="vertical">
          {text?.user?.username}
          <Tag color="blue">{text?.employee_number}</Tag>
        </Space>
      ),
    },
    {
      title: "Aksi",
      key: "type",
      render: (text) => (
        <Space>
          <Tag color="green">{text?.type}</Tag>
          <Tag color="red">{upperCase(text?.siasn_service)}</Tag>
        </Space>
      ),
    },
    {
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (text) => (
        <>{dayjs(text?.created_at).format("DD MMM YYYY HH:mm:ss")}</>
      ),
    },
    {
      title: "Role",
      key: "role",
      render: (text) => (
        <div>
          {text?.user?.role} from {text?.user?.from}
        </div>
      ),
    },
    {
      title: "Current Role",
      key: "current_role",
      render: (text) => <div>{text?.user?.current_role}</div>,
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text) => (
        <a onClick={() => gotoDetail(text?.employee_number)}>Detail</a>
      ),
    },
    {
      title: "Show Data",
      key: "show_data",
      render: (_, record) => (
        <a onClick={() => showModalInformation(record)}>show data</a>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Log SIASN</title>
      </Head>
      <PageContainer
        title="Log"
        subTitle="Layanan SIASN"
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
                  <a>Integrasi SIASN</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Log</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <BackTop />
        <Card title="Tabel Log SIASN">
          <LogSIASNFilter />
          <Table
            size="small"
            pagination={{
              showSizeChanger: false,
              position: ["bottomRight", "topRight"],
              current: parseInt(query?.page) || 1,
              pageSize: 15,
              total: data?.total,
              onChange: handleChangePage,
            }}
            columns={columns}
            loading={isLoading || isFetching}
            dataSource={data?.data}
            rowKey={(row) => row?.id}
          />
        </Card>
      </PageContainer>
    </>
  );
}

LogSIASN.getLayout = function getLayout(page) {
  return <Layout active="/logs/siasn">{page}</Layout>;
};

LogSIASN.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogSIASN;
