import Layout from "@/components/Layout";
import AdminLayoutWebinar from "@/components/WebinarSeries/AdminLayoutWebinar";
import { readAllWebinar, removeWebinar } from "@/services/webinar.services";
import { StatusWebinar, formatDateWebinar } from "@/utils/client-utils";
import { PlusOutlined } from "@ant-design/icons";
import { Input, Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
  Input as InputAntd,
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
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const handleSearch = (value) => {
    setQuery({
      ...query,
      search: value,
    });
  };

  const handleCreate = () => {
    router.push("/apps-managements/webinar-series/create");
  };

  const columns = [
    {
      title: "Webinar Series",
      key: "webinar_series_xs",
      render: (text) => {
        return (
          <Stack>
            {text?.episode} - {text?.title}
            <div>
              {formatDateWebinar(text?.start_date)} -{" "}
              {formatDateWebinar(text?.end_date)}
            </div>
          </Stack>
        );
      },
      responsive: ["xs"],
    },
    {
      title: "Series",
      dataIndex: "episode",
      responsive: ["sm"],
    },
    {
      title: "Judul",
      key: "title",
      render: (text) => {
        return (
          <Link href={`/apps-managements/webinar-series/${text?.id}/detail`}>
            <a>{text?.title}</a>
          </Link>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Tanggal",
      key: "tanggal",
      render: (text) => {
        return (
          <span>
            {formatDateWebinar(text?.start_date)} -{" "}
            {formatDateWebinar(text?.end_date)}
          </span>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Peserta",
      key: "type_participant",
      render: (text) => {
        return <span>{text?.type_participant?.join(", ")}</span>;
      },
      responsive: ["sm"],
    },
    {
      title: "Status",
      key: "status",
      render: (text) => <StatusWebinar status={text?.status} />,
      responsive: ["sm"],
    },
    {
      title: "Status Pendaftaran",
      key: "status_registration",
      render: (text) => (
        <Tag color={text?.is_open ? "green" : "red"}>
          {text?.is_open ? "Buka" : "Tutup"}
        </Tag>
      ),
      responsive: ["sm"],
    },
    {
      title: "Total Peserta",
      dataIndex: "participants_count",
      responsive: ["sm"],
    },
    {
      title: "Download Sertifikat?",
      key: "is_allow_download_certificate",
      render: (text) => {
        return (
          <span>{text?.is_allow_download_certificate ? "Ya" : "Tidak"}</span>
        );
      },
      responsive: ["sm"],
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Admin - Webinar Series</title>
      </Head>
      <AdminLayoutWebinar
        title="Rumah ASN"
        content="Daftar Webinar Series"
        loading={isLoading}
      >
        <Card>
          <Button
            style={{
              marginBottom: 16,
            }}
            onClick={handleCreate}
            type="primary"
            icon={<PlusOutlined />}
          >
            Webinar Series
          </Button>
          <Table
            title={() => (
              <InputAntd.Search
                allowClear
                onSearch={handleSearch}
                style={{
                  width: 400,
                }}
              />
            )}
            columns={columns}
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
        </Card>
      </AdminLayoutWebinar>
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
