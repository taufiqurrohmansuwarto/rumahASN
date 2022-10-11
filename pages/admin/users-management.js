import { useQuery } from "@tanstack/react-query";
import { Avatar, Button, Card, Input, Table } from "antd";
import { useState } from "react";
import { getUsers } from "../../services";
import AdminLayout from "../../src/components/AdminLayout";
import PageContainer from "../../src/components/PageContainer";

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
    title: "Role",
    dataIndex: "current_role",
    key: "current_role",
  },
  {
    title: "Aksi",
    key: "aksi",
    render: (text, record) => <Button>Rubah</Button>,
  },
];

const Dashboard = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data, isLoading } = useQuery(["users"], () => getUsers(query));
  const [visible, setVisible] = useState(false);

  return (
    <PageContainer>
      <div>{JSON.stringify(data)}</div>
      <Card>
        <Table
          title={() => (
            <Input.Search
              value={query?.search}
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
  );
};

Dashboard.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Dashboard.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Dashboard;
