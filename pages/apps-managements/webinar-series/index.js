import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { readAllWebinar, removeWebinar } from "@/services/webinar.services";
import {
  StatusWebinar,
  formatDateSimple
} from "@/utils/client-utils";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Divider,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
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
      dataIndex: "title",
    },
    {
      title: "Tanggal",
      key: "tanggal",
      render: (text) => {
        return (
          <span>
            {formatDateSimple(text?.start_date)} -{" "}
            {formatDateSimple(text?.end_date)}
          </span>
        );
      },
    },
    {
      title: "Tipe Peserta",
      key: "type_participant",
      render: (text) => {
        return <span>{text?.type_participant?.join(", ")}</span>;
      },
    },
    {
      title: "Status",
      key: "status",
      render: (text) => <StatusWebinar status={text?.status} />,
    },
    {
      title: "Status Pendaftaran",
      key: "status_registration",
      render: (text) => (
        <Tag color={text?.is_open ? "green" : "red"}>
          {text?.is_open === "open" ? "Buka" : "Tutup"}
        </Tag>
      ),
    },
    {
      title: "Total Peserta",
      dataIndex: "participants_count",
    },
    {
      title: "Download Sertifikat?",
      key: "is_allow_download_certificate",
      render: (text) => {
        return (
          <span>{text?.is_allow_download_certificate ? "Ya" : "Tidak"}</span>
        );
      },
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
        <title>Rumah ASN - Admin - Webinar Series</title>
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
              <Breadcrumb.Item>Daftar Webinar Series Admin</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title={"Rumah ASN"}
        content="Manajemen Admin Webinar Series"
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
