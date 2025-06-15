import Layout from "@/components/Layout";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import { Breadcrumb, message } from "antd";
import React from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  commentUserCreate,
  commentUserDelete,
  commentUserIndex,
  commentUserUpdate,
} from "@/services/webinar.services";
import WebinarSeriesComments from "@/components/WebinarSeries/WebinarSeriesComments";
import PageContainer from "@/components/PageContainer";
import Link from "next/link";

function WebinarComments() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const id = router?.query?.id;

  const { data, isLoading } = useQuery(
    ["my-webinar-comments", id],
    () => commentUserIndex(id),
    {
      enabled: !!id,
      keepPreviousData: true,
    }
  );

  // hapus
  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => commentUserCreate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["my-webinar-comments", id]);
        message.success("Berhasil menambahkan komentar");
      },
      onError: () => {
        message.error("Gagal menambahkan komentar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["my-webinar-comments", id]);
      },
    }
  );

  // ubah
  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => commentUserUpdate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["my-webinar-comments", id]);
        message.success("Berhasil mengubah komentar");
      },
      onError: () => {
        message.error("Gagal mengubah komentar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["my-webinar-comments", id]);
      },
    }
  );

  // tambah
  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => commentUserDelete(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["my-webinar-comments", id]);
        message.success("Berhasil menghapus komentar");
      },
      onError: () => {
        message.error("Gagal menghapus komentar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["my-webinar-comments", id]);
      },
    }
  );

  const { data: myWebinar, isLoading: isLoadingMyWebinar } = useQuery(
    ["webinar-user-detail", id],
    () => webinarUserDetail(id),
    {
      keepPreviousData: true,
    }
  );

  const breadcrumb = [
    {
      title: "Beranda",
      href: "/",
      isActive: true,
    },
    {
      title: "Daftar Webinar Saya",
      href: "/webinar-series/my-webinar",
      isActive: true,
    },
    {
      title: myWebinar?.webinar_series?.title || "Detail Webinar",
      href: `/webinar-series/my-webinar/${router?.query?.id}/comments` || "/",
      isActive: false,
    },
  ];

  return (
    <PageContainer
      onBack={() => router.push(`/webinar-series/my-webinar`)}
      title="Diskusi"
      breadcrumbRender={() => (
        <Breadcrumb>
          {breadcrumb.map((item) => (
            <Breadcrumb.Item key={item.title}>
              {item.isActive ? (
                <Link href={item.href}>{item.title}</Link>
              ) : (
                item.title
              )}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      loading={isLoading}
    >
      <WebinarUserDetailLayout loading={isLoading} active="comments">
        <WebinarSeriesComments
          youtubeUrl={myWebinar?.webinar_series?.youtube_url}
          data={data}
          create={create}
          hapus={hapus}
          isLoadingCreate={isLoadingCreate}
          isLoadingHapus={isLoadingHapus}
          isLoadingUpate={isLoadingUpdate}
          update={update}
        />
      </WebinarUserDetailLayout>
    </PageContainer>
  );
}

WebinarComments.Auth = {
  action: "manage",
  subject: "tickets",
};

WebinarComments.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

export default WebinarComments;
