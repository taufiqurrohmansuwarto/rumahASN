import LogSIASNFilter from "@/components/Filter/LogSIASNFilter";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import ReactJson from "@/components/ReactJson";
import { logSIASN } from "@/services/log.services";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Card,
  Collapse,
  FloatButton,
  Grid,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
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

const showModalInformation = (item, title = "BsRE") => {
  Modal.info({
    title: `Detail Log ${title}`,
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

  const breakPoint = Grid.useBreakpoint();

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
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (text) => {
        return (
          <Space direction="vertical">
            <Typography.Text>{text?.user?.username}</Typography.Text>
            <Typography.Text>{text?.employee_number}</Typography.Text>
            <Tag color="yellow">
              {text?.type} {upperCase(text?.siasn_service)}
            </Tag>

            <Space>
              <a onClick={() => gotoDetail(text?.employee_number)}>Detail</a>
              <a onClick={() => showModalInformation(text)}>Show Data</a>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Aktor",
      key: "actor",
      render: (text) => (
        <Space direction="vertical">
          {text?.user?.username}
          <Tag color="blue">{text?.employee_number}</Tag>
        </Space>
      ),
      responsive: ["sm"],
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
      responsive: ["sm"],
    },
    {
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (text) => (
        <>{dayjs(text?.created_at).format("DD MMM YYYY HH:mm:ss")}</>
      ),
      responsive: ["sm"],
    },
    {
      title: "Role",
      key: "role",
      render: (text) => (
        <div>
          {text?.user?.role} from {text?.user?.from}
        </div>
      ),
      responsive: ["sm"],
    },
    {
      title: "Current Role",
      key: "current_role",
      render: (text) => <div>{text?.user?.current_role}</div>,
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text) => (
        <a onClick={() => gotoDetail(text?.employee_number)}>Detail</a>
      ),
      responsive: ["sm"],
    },
    {
      title: "Show Data",
      key: "show_data",
      render: (_, record) => (
        <a onClick={() => showModalInformation(record)}>show data</a>
      ),
      responsive: ["sm"],
    },
  ];

  return (
    <>
      <Head>
        <title>Log SIASN</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Log"
        subTitle="Layanan SIASN"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/integrasi/siasn">
                  Integrasi SIASN
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Log</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <FloatButton.BackTop />
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
