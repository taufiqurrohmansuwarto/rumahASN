import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import WebinarSeriesComments from "@/components/WebinarSeries/WebinarSeriesComments";
import {
  commentAdminCreate,
  commentAdminDelete,
  commentAdminIndex,
  commentAdminUpdate,
  downloadComments,
} from "@/services/webinar.services";
import { CloudDownloadOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FloatButton, Button, message } from "antd";
import { useRouter } from "next/router";

function Comments() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const id = router?.query?.id;

  const { data, isLoading } = useQuery(
    ["webinar-series-admin-comments", id],
    () => commentAdminIndex(id),
    {
      enabled: !!id,
      keepPreviousData: true,
    }
  );

  // hapus
  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => commentAdminCreate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["webinar-series-admin-comments", id]);
        message.success("Berhasil menambahkan komentar");
      },
      onError: () => {
        message.error("Gagal menambahkan komentar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-admin-comments", id]);
      },
    }
  );

  // ubah
  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => commentAdminUpdate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["webinar-series-admin-comments", id]);
        message.success("Berhasil mengubah komentar");
      },
      onError: () => {
        message.error("Gagal mengubah komentar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-admin-comments", id]);
      },
    }
  );

  // tambah
  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => commentAdminDelete(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["webinar-series-admin-comments", id]);
        message.success("Berhasil menghapus komentar");
      },
      onError: () => {
        message.error("Gagal menghapus komentar");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-admin-comments", id]);
      },
    }
  );

  const { data: detailAdmin, isLoading: isLoadingDetailAdmin } = useQuery(
    ["webinar-series-admin-detail", router?.query?.id],
    () => detailWebinar(router?.query?.id),
    {}
  );

  const { mutateAsync: download, isLoading: isLoadingDownload } = useMutation(
    (data) => downloadComments(data),
    {}
  );

  const handleDownload = async () => {
    try {
      const data = await download(router?.query?.id);

      const url = window.URL.createObjectURL(
        new Blob([data], { type: "application/vnd.ms-excel" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "komentar.xlsx");
      document.body.appendChild(link);
      link.click();

      message.success("Berhasil mengunduh data");
    } catch (error) {
      message.error("Gagal mengunduh data");
    }
  };

  return (
    <AdminLayoutDetailWebinar loading={isLoading} active="comments">
      <FloatButton.BackTop />
      <Button
        disabled={isLoadingDownload}
        onClick={handleDownload}
        loading={isLoadingDownload}
        type="primary"
        icon={<CloudDownloadOutlined />}
        style={{
          marginBottom: 16,
        }}
      >
        Unduh Komentar
      </Button>
      <WebinarSeriesComments
        youtubeUrl={detailAdmin?.youtube_url}
        data={data}
        create={create}
        isloadingCreate={isLoadingCreate}
        update={update}
        isloadingUpdate={isLoadingUpdate}
        hapus={hapus}
        isloadingHapus={isLoadingHapus}
      />
    </AdminLayoutDetailWebinar>
  );
}

Comments.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Comments.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Comments;
