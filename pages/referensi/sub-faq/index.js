import Layout from "@/components/Layout";
import { deleteSubFaq, getSubFaqs } from "@/services/index";
import { formatDate } from "@/utils/index";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Divider, Popconfirm, Space, Table, message } from "antd";
import { useRouter } from "next/router";

const { default: AdminLayout } = require("@/components/AdminLayout");
const { default: PageContainer } = require("@/components/PageContainer");

const SubFAQ = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(["sub-faqs"], () => getSubFaqs());

  const queryClient = useQueryClient();

  const { mutate: hapus } = useMutation((id) => deleteSubFaq(id), {
    onSettled: () => {
      message.success("Berhasil menghapus sub faq");
      queryClient.invalidateQueries(["sub-faqs"]);
    },
    onError: (error) => {
      console.error(error);
      message.error("Gagal menghapus sub faq");
    },
  });

  const handleDelete = (id) => {
    hapus(id);
  };

  const gotoEdit = (id) => {
    router.push(`/referensi/sub-faq/${id}/edit`);
  };

  const gotoCreate = () => {
    router.push(`/referensi/sub-faq/create`);
  };

  const columns = [
    {
      title: "FAQ",
      key: "faq",
      render: (_, row) => row?.faq?.name,
    },
    {
      title: "Pertanyaan",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "Jawaban",
      dataIndex: "answer",
      key: "answer",
    },

    {
      title: "Dibuat oleh",
      key: "created_by",
      render: (text, record) => {
        return record?.created_by?.username;
      },
    },
    {
      title: "Dibuat pada",
      key: "created_at",
      render: (_, row) => formatDate(row?.created_at),
    },
    {
      title: "Aksi",
      key: "action",
      render: (text, record) => (
        <Space>
          <a
            onClick={() => {
              gotoEdit(record?.id);
            }}
          >
            Edit
          </a>
          <Divider type="vertical" />
          <Popconfirm
            onConfirm={() => handleDelete(record?.id)}
            title="Apakah anda ingin menghapus data?"
          >
            Hapus
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Kamus Referensi" subTitle="Sub FAQ">
      <Card>
        <Button
          style={{ marginBottom: 16 }}
          icon={<PlusOutlined />}
          type="primary"
          onClick={gotoCreate}
        >
          Sub FAQ
        </Button>
        <Table
          columns={columns}
          pagination={false}
          rowKey={(row) => row?.id}
          dataSource={data}
          loading={isLoading}
        />
      </Card>
    </PageContainer>
  );
};

SubFAQ.getLayout = function getLayout(page) {
  return <Layout active={"/referensi/sub-faq"}>{page}</Layout>;
};

SubFAQ.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default SubFAQ;
