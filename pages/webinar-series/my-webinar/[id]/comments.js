import Layout from "@/components/Layout";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import { Card, message } from "antd";
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

  return (
    <WebinarUserDetailLayout loading={isLoading} active="comments">
      <WebinarSeriesComments
        data={data}
        create={create}
        hapus={hapus}
        isLoadingCreate={isLoadingCreate}
        isLoadingHapus={isLoadingHapus}
        isLoadingUpate={isLoadingUpdate}
        update={update}
      />
    </WebinarUserDetailLayout>
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
