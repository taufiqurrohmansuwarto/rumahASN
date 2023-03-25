import { deleteSubFaq, getSubFaqs } from "@/services/index";
import { formatDate } from "@/utils/index";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Divider, message, Popconfirm, Space, Table } from "antd";
import { useRouter } from "next/router";

const { default: AdminLayout } = require("@/components/AdminLayout");
const { default: PageContainer } = require("@/components/PageContainer");

const Categories = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(["sub-faqs"], () => getSubFaqs());

  const queryClient = useQueryClient();

  const { mutate: hapus } = useMutation((id) => deleteSubFaq(id), {
    onSettled: () => {
      queryClient.invalidateQueries(["sub-faqs"]);
      message.success("Berhasil menghapus sub faq");
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
    router.push(`/admin/ref/sub-faq/${id}/edit`);
  };

  const gotoCreate = () => {
    router.push(`/admin/ref/sub-faq/create`);
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
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Card>
        <Button
          style={{ marginBottom: 16 }}
          icon={<PlusOutlined />}
          type="primary"
          onClick={gotoCreate}
        >
          Tambah
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

Categories.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Categories.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Categories;
