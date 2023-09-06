import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import WebinarSeriesComments from "@/components/WebinarSeries/WebinarSeriesComments";
import {
  commentAdminCreate,
  commentAdminDelete,
  commentAdminIndex,
  commentAdminUpdate,
} from "@/services/webinar.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

function Comments() {
  const router = useRouter();

  const id = router?.query?.id;

  const { data, isLoading } = useQuery(
    ["webinar-series-admin-comments", id],
    () => commentAdminIndex(id),
    {}
  );

  // hapus
  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => commentAdminCreate(data),
    {}
  );

  // ubah
  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => commentAdminUpdate(data),
    {}
  );

  // tambah
  const { mutate: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => commentAdminDelete(data),
    {}
  );

  return (
    <AdminLayoutDetailWebinar loading={isLoading} active="comments">
      <WebinarSeriesComments
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
