import { getSubmissionReference } from "@/services/submissions.services";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Table } from "antd";
import { useRouter } from "next/router";
import { PlusOutlined } from "@ant-design/icons";

import dayjs from "dayjs";

dayjs.locale("id");
require("dayjs/locale/id");

function KamusUsulan() {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["submissions-references"],
    () => getSubmissionReference(),
    {}
  );

  const createKamusUsulan = () => {
    router.push("/apps-managements/submissions/references/create");
  };

  const columns = [
    {
      title: "Jenis Usulan",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Tipe Pengusul",
      key: "submitter_type",
      render: (_, row) => {
        return <>{JSON.stringify(row?.submitter_type)}</>;
      },
    },
    {
      title: "Pembuat",
      key: "creator",
      render: (_, row) => {
        return <>{row?.user?.username}</>;
      },
    },
    {
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (_, row) => {
        return <>{dayjs(row?.created_at).format("DD-MM-YYYY")}</>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      render: (text, record) => (
        <a
          onClick={() =>
            router.push(`/apps-managements/submissions/references/${record.id}`)
          }
        >
          Detail
        </a>
      ),
    },
  ];

  return (
    <Card>
      <Button
        style={{
          marginBottom: 16,
        }}
        type="primary"
        icon={<PlusOutlined />}
        onClick={createKamusUsulan}
      >
        Kamus Usulan
      </Button>
      <Table
        dataSource={data}
        pagination={false}
        columns={columns}
        rowKey={(row) => row?.id}
        loading={isLoading}
      />
    </Card>
  );
}

export default KamusUsulan;
