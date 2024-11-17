import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  alterUserCoach,
  dropUserCoach,
} from "@/services/coaching-clinics.services";
import { getUsers, toggleAdminAgent } from "@/services/index";
import { formatDate } from "@/utils/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Breadcrumb,
  Card,
  Divider,
  Input,
  Popconfirm,
  Table,
  Tag,
  message,
} from "antd";
import { toUpper } from "lodash";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const checkFrom = (from) => {
  if (from === "pttpk") {
    return "blue";
  } else if (from === "master") {
    return "yellow";
  }
};

const Dashboard = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
  });

  const { data, isLoading, isFetching } = useQuery(
    ["users", query],
    () => getUsers(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const queryClient = useQueryClient();

  const { mutateAsync: makeUserBKDCoach, isLoading: isLoadingUserBKDCoach } =
    useMutation((data) => alterUserCoach(data), {
      onSettled: () => queryClient.invalidateQueries(["users"]),
      onError: () => message.error("Gagal mengubah status coaching"),
      onSuccess: () => {
        message.success("Berhasil mengubah status coaching");
        queryClient.invalidateQueries(["users"]);
      },
    });

  const {
    mutateAsync: dropUserBKDCoach,
    isLoading: isLoadingDropUserBKDCoach,
  } = useMutation((data) => dropUserCoach(data), {
    onSettled: () => queryClient.invalidateQueries(["users"]),
    onError: () => message.error("Gagal mengubah status coaching"),
    onSuccess: () => {
      message.success("Berhasil mengubah status coaching");
      queryClient.invalidateQueries(["users"]);
    },
  });

  const { mutateAsync: toggle, isLoading: isLoadingToggle } = useMutation(
    (data) => toggleAdminAgent(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah role");
        queryClient.invalidateQueries(["users"]);
      },
      onError: () => {
        message.error("Gagal mengubah role");
      },
      onSettled: () => queryClient.invalidateQueries(["users"]),
    }
  );

  const handleToggle = (id) => {
    toggle(id);
  };

  const handleToggleCoach = (row) => {
    if (row?.is_consultant) {
      dropUserBKDCoach(row?.custom_id);
    } else {
      makeUserBKDCoach(row?.custom_id);
    }
  };

  const columns = [
    {
      title: "Foto",
      key: "foto",
      render: (_, record) => {
        return <Avatar alt="foto profil" src={record?.image} />;
      },
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "NIP",
      dataIndex: "employee_number",
      key: "employee_number",
    },
    {
      title: "Asal Login",
      key: "from",
      render: (_, record) => (
        <Tag color={checkFrom(record?.from)}>{toUpper(record?.from)}</Tag>
      ),
    },
    {
      title: "Kewenangan",
      dataIndex: "current_role",
      key: "current_role",
    },
    {
      title: "Coaching?",
      key: "is_consultant",
      render: (_, record) => (
        <div>{record?.is_consultant ? "Ya" : "Tidak"}</div>
      ),
    },
    {
      title: "Login Terakhir",
      key: "last_login",
      render: (_, record) => <div>{formatDate(record?.last_login)}</div>,
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, record) => (
        <>
          <Popconfirm
            onConfirm={async () => await handleToggle(record?.custom_id)}
            title={`${record?.username} akan dirubah menjadi ${
              record?.current_role === "agent" ? "Admin" : "Agent"
            }. Apakah anda yakin?`}
          >
            Ubah Kewenangan
          </Popconfirm>
          <Divider type="vertical" />
          <Popconfirm
            onConfirm={async () => await handleToggleCoach(record)}
            title={`${record?.username} akan dirubah menjadi ${
              record?.is_consultant ? "Coaching" : "User Biasa"
            }. Apakah anda yakin?`}
          >
            Ubah Coaching?
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Manajemen Pengguna</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Manajemen Pengguna</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Manajemen Aplikasi"
        subTitle="Pengguna"
      >
        <Card>
          <Table
            title={() => (
              <Input.Search
                style={{ width: 300 }}
                onChange={(e) => {
                  setQuery({
                    ...query,
                    search: e?.target?.value,
                  });
                }}
              />
            )}
            rowKey={(row) => row?.custom_id}
            dataSource={data?.data}
            columns={columns}
            loading={isLoading || isFetching}
            pagination={{
              onChange: (page, limit) => {
                setQuery({
                  ...query,
                  page,
                  limit,
                });
              },
              total: data?.total,
              showTotal: (total) => `Total ${total} pengguna`,
              position: ["bottomRight", "topRight"],
              showSizeChanger: false,
            }}
          />
        </Card>
      </PageContainer>
    </>
  );
};

Dashboard.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Dashboard.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Dashboard;
