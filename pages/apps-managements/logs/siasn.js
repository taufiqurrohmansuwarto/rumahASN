import Layout from "@/components/Layout";
import { logSIASN } from "@/services/log.services";
import { useQuery } from "@tanstack/react-query";
import { Input, Table } from "antd";
import { useState } from "react";
import moment from "moment";

function LogSIASN() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 50,
  });

  const { data, isLoading } = useQuery(
    ["logs-siasn", query],
    () => logSIASN(query),
    {
      enabled: !!query,
    }
  );

  const handleSearch = (e) => {
    setQuery({
      ...query,
      employeeNumber: e,
    });
  };

  const columns = [
    {
      title: "Aktor",
      key: "actor",
      render: (text) => <>{text?.user?.username}</>,
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Layanan",
      dataIndex: "siasn_service",
    },
    {
      title: "Employee Number",
      dataIndex: "employee_number",
    },
    {
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (text) => (
        <>{moment(text?.created_at).format("DD MMM YYYY HH:mm:ss")}</>
      ),
    },
  ];

  return (
    <div>
      <Table
        title={() => (
          <Input.Search
            allowClear
            onSearch={handleSearch}
            placeholder="NIP"
            style={{
              width: 300,
            }}
          />
        )}
        pagination={{
          position: ["bottomRight", "topRight"],
          current: query?.page,
          pageSize: query?.limit,
          total: data?.total,
          onChange: (page, limit) => {
            setQuery({
              ...query,
              page,
              limit,
            });
          },
        }}
        columns={columns}
        loading={isLoading}
        dataSource={data?.data}
        rowKey={(row) => row?.id}
      />
    </div>
  );
}

LogSIASN.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/logs">{page}</Layout>;
};

LogSIASN.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LogSIASN;
