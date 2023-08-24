import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { readAllWebinar, removeWebinar } from "@/services/webinar.services";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Divider, Popconfirm, Space, Table, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

const WebinarSeries = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const gotoEdit = (id) => {
    router.push(`/apps-managements/webinar-series/${id}/edit`);
  };

  const { mutate: deleteWebinar, isLoading: isLoadingDelete } = useMutation(
    (id) => removeWebinar(id),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus webinar series");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-admin"]);
      },
    }
  );

  const handleDelete = (id) => {
    deleteWebinar(id);
  };

  const [query, setQuery] = useState({
    page: 1,
    limit: 25,
  });

  const { data, isLoading } = useQuery(
    ["webinar-series-admin", query],
    () => readAllWebinar(query),
    {}
  );

  const handleCreate = () => {
    router.push("/apps-managements/webinar-series/create");
  };

  const columns = [
    {
      title: "Nomer Series",
      dataIndex: "episode",
    },
    {
      title: "Judul",
      dataIndex: "name",
    },
    {
      title: "Tgl. Buka Pendaftaran",
      dataIndex: "open_registration",
    },
    {
      title: "Tgl. Tutup Pendaftaran",
      dataIndex: "close_registration",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text, record) => {
        return (
          <Space>
            <a
              onClick={() =>
                router.push(
                  `/apps-managements/webinar-series/${record?.id}/detail`
                )
              }
            >
              Detail
            </a>
            <Divider type="vertical" />
            <a onClick={() => gotoEdit(record?.id)}>Edit</a>
            <Divider type="vertical" />
            <Popconfirm
              onConfirm={() => {
                handleDelete(record?.id);
              }}
              title="Apakah anda yakin ingin menghapus data?"
            >
              <a>Hapus</a>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Series</title>
      </Head>
      <PageContainer
        title={"Rumah ASN"}
        content="Webinar Series"
        loading={isLoading}
      >
        <Table
          columns={columns}
          title={() => (
            <Button
              onClick={handleCreate}
              type="primary"
              icon={<PlusOutlined />}
            >
              Webinar Series
            </Button>
          )}
          dataSource={data?.data}
          rowKey={(row) => row?.id}
          loading={isLoading}
          pagination={{
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
        />
      </PageContainer>
    </>
  );
};

WebinarSeries.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

WebinarSeries.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default WebinarSeries;
