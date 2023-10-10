import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  deleteLayanan,
  readLayanan,
} from "@/services/layanan-kepegawaian.services";
import { formatDateFull } from "@/utils/client-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Divider,
  Popconfirm,
  Space,
  Table,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const LayananKepegawaian = () => {
  const [query, setQuery] = useState({});
  const router = useRouter();

  const queryClient = useQueryClient();

  const { mutateAsync: hapus } = useMutation((data) => deleteLayanan(data), {
    onSuccess: () => {
      message.success("Berhasil menghapus data");
    },
    onError: () => {
      message.error("Gagal menghapus data");
    },
    onSettled: () => queryClient.invalidateQueries(["layanan-kepegawaian"]),
  });

  const handleHapus = async (id) => await hapus(id);

  const handleEdit = (id) =>
    router.push(`/apps-managements/layanan-kepegawaian/${id}/edit`);

  const handleCreate = () =>
    router.push(`/apps-managements/layanan-kepegawaian/create`);

  const { data, isLoading } = useQuery(
    ["layanan-kepegawaian", query],
    () => readLayanan(query),
    {
      keepPreviousData: true,
    }
  );

  const columns = [
    {
      title: "Judul",
      dataIndex: "title",
    },
    {
      title: "Bidang",
      key: "bidang",
      render: (_, row) => row?.bidang?.label,
    },
    {
      title: "Tgl. Dibuat",
      key: "dibuat pada",
      render: (_, row) => formatDateFull(row?.created_at),
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => (
        <Space>
          <a>Detail</a>
          <Divider type="vertical" />
          <a onClick={() => handleEdit(row?.id)}>Edit</a>
          <Divider type="vertical" />
          <Popconfirm
            onConfirm={async () => await handleHapus(row?.id)}
            title="Apakah anda yakin ingin menghapus data?"
          >
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Layanan Kepegawaian</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <a>Layanan Kepegawaian</a>
              </Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Daftar Layanan Kepegawaian"
        content="Admin"
      >
        <Button onClick={handleCreate}>Buat Layanan</Button>
        <Table
          columns={columns}
          rowKey={(row) => row?.id}
          dataSource={data?.data}
          loading={isLoading}
        />
      </PageContainer>
    </>
  );
};

LayananKepegawaian.getLayout = function (page) {
  return <Layout active="/apps-managements/layanan-kepegawaian">{page}</Layout>;
};

LayananKepegawaian.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default LayananKepegawaian;
