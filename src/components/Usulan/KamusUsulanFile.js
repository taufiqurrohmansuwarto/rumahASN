import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { getSubmissionsFileRefs } from "@/services/submissions.services";
import { Button, Table } from "antd";
import { PlusOutlined } from "@ant-design/icons";

function KamusUsulanFile() {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["submissions_files"],
    () => getSubmissionsFileRefs(),
    {}
  );

  const createKamusUsulan = () => {
    router.push("/apps-managements/submissions/files/create");
  };

  const columns = [
    {
      title: "Kode",
      dataIndex: "kode",
    },
    {
      title: "Active",
      key: "is_active",
      render: (_, row) => {
        return <>{row?.is_active ? "Ya" : "Tidak"}</>;
      },
    },
    {
      title: "Wajib",
      key: "is_primary",
      render: (_, row) => {
        return <>{row?.is_primary ? "Ya" : "Tidak"}</>;
      },
    },

    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <a
          onClick={() =>
            router.push(`/apps-managements/submissions/files/${record.kode}`)
          }
        >
          Detail
        </a>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        onClick={createKamusUsulan}
        icon={<PlusOutlined />}
      >
        File Usulan
      </Button>
      <Table
        rowKey={(row) => row?.kode}
        dataSource={data}
        columns={columns}
        pagination={false}
        loading={isLoading}
      />
    </div>
  );
}

export default KamusUsulanFile;
