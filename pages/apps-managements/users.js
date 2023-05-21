import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Card, Input, Popconfirm, Table, message } from "antd";
import { useState } from "react";
import { getUsers, toggleAdminAgent } from "@/services/index";
import PageContainer from "@/components/PageContainer";
import { formatDate } from "@/utils/index";
import Layout from "@/components/Layout";
import Head from "next/head";

const Dashboard = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
  });

  const { data, isLoading } = useQuery(
    ["users", query],
    () => getUsers(query),
    {
      enabled: !!query,
    }
  );

  const queryClient = useQueryClient();

  const { mutate: toggle, isLoading: isLoadingToggle } = useMutation(
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

  const columns = [
    {
      title: "Foto",
      key: "foto",
      render: (text, record) => {
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
      title: "Dari",
      dataIndex: "from",
      key: "from",
    },
    {
      title: "Role",
      dataIndex: "current_role",
      key: "current_role",
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
        <Popconfirm
          onConfirm={() => handleToggle(record?.custom_id)}
          title={`${record?.username} akan dirubah menjadi ${
            record?.current_role === "agent" ? "Admin" : "Agent"
          }. Apakah anda yakin?`}
        >
          <a>Toggle Role</a>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Manajemen Aplikasi</title>
      </Head>
      <PageContainer title="Manajemen Aplikasi" subTitle="Pengguna">
        <Card>
          <Table
            size="small"
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
            loading={isLoading}
            pagination={{
              total: data?.total,
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
