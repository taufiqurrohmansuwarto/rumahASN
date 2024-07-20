import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  readAllPolling,
  removePooling,
  updatePolling,
} from "@/services/polls.services";
import { formatDateFull } from "@/utils/client-utils";
import { PlusOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  Divider,
  Grid,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
function Votes() {
  const router = useRouter();
  const handleCreate = () => router.push(`/apps-managements/votes/create`);

  const queryClient = useQueryClient();

  const { mutate, isLoading: loadingRemove } = useMutation(
    (data) => removePooling(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus voting!");
        queryClient.invalidateQueries("votes-admins");
      },
      onError: () => {
        message.error("Gagal menghapus voting!");
      },
    }
  );

  const { mutate: update, isLoading: loadingUpdate } = useMutation(
    (data) => updatePolling(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("votes-admins");
        message.success("Berhasil mengubah voting!");
      },
    }
  );

  const handleActive = (data) => {
    if (data?.is_active) {
      const currentData = {
        id: data?.id,
        data: {
          is_active: false,
        },
      };
      update(currentData);
    } else {
      const currentData = {
        id: data?.id,
        data: {
          is_active: true,
        },
      };
      update(currentData);
    }
  };

  const handleRemove = (id) => {
    mutate(id);
  };

  const { data, isLoading } = useQuery(
    ["votes-admins"],
    () => readAllPolling(),
    {}
  );

  const columns = [
    {
      title: "Pertanyaan, Status",
      key: "pertanyaanStatus",
      responsive: ["xs"],
      render: (text) => (
        <>
          <Link href={`/apps-managements/votes/${text?.id}/detail`}>
            <a>{text?.question}</a>
          </Link>
          <br />
          <Tag color={text?.is_active ? "green" : "red"}>
            {text?.is_active ? "Aktif" : "Tidak Aktif"}
          </Tag>
        </>
      ),
    },
    {
      title: "Aksi",
      key: "aksiXs",
      responsive: ["xs"],
      render: (row) => {
        return (
          <Stack>
            <a onClick={() => handleActive(row)}>
              {row?.is_active ? "Nonaktifkan" : "Aktifkan"}
            </a>
            <a
              onClick={() =>
                router.push(`/apps-managements/votes/${row?.id}/update`)
              }
            >
              Edit
            </a>
            <br />
            <Popconfirm
              title="Apakah anda yakin menghapus voting ini?"
              onConfirm={() => handleRemove(row?.id)}
            >
              <a>Hapus</a>
            </Popconfirm>
          </Stack>
        );
      },
    },
    {
      title: "Pertanyaan",
      key: "question",
      render: (row) => {
        return (
          <Link
            href={`
            /apps-managements/votes/${row.id}/detail
          `}
          >
            <a>{row.question}</a>
          </Link>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (row) => {
        return <div>{formatDateFull(row?.created_at)}</div>;
      },
      responsive: ["sm"],
    },
    {
      title: "Status",
      key: "status",
      render: (row) => {
        return (
          <Tag color={row?.is_active ? "green" : "red"}>
            {row?.is_active ? "Aktif" : "Tidak Aktif"}
          </Tag>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "id",
      responsive: ["sm"],
      render: (_, row) => (
        <Space>
          <a onClick={() => handleActive(row)}>
            {row?.is_active ? "Nonaktifkan" : "Aktifkan"}
          </a>
          <Divider type="vertical" />
          <a
            onClick={() =>
              router.push(`/apps-managements/votes/${row?.id}/update`)
            }
          >
            Edit
          </a>
          <Divider type="vertical" />
          <Popconfirm
            title="Apakah anda yakin menghapus voting ini?"
            onConfirm={() => handleRemove(row?.id)}
          >
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Polling</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Polling</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Rumah ASN - Polling"
      >
        <Card>
          <Button
            style={{
              marginBottom: 16,
            }}
            onClick={handleCreate}
            type="primary"
            icon={<PlusOutlined />}
          >
            Polling Baru
          </Button>
          <Table
            pagination={false}
            columns={columns}
            dataSource={data}
            loading={isLoading}
            rowKey={(row) => row?.id}
          />
        </Card>
      </PageContainer>
    </>
  );
}

Votes.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Votes.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Votes;
