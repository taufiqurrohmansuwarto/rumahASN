import Layout from "@/components/Layout";
import AbsenceEtries from "@/components/WebinarSeries/AbsenceEtries";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import {
  absenceEntries,
  createAbsenceEntries,
  deleteAbsenceEntries,
  updateAbsenceEntries,
} from "@/services/webinar.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

function Absences() {
  const router = useRouter();
  const { id } = router?.query;

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["webinar-series-absence-entries", id],
    () => absenceEntries(id),
    {}
  );

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createAbsenceEntries(data),
    {
      onSuccess: () => {},
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-absence-entries", id]);
      },
    }
  );

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateAbsenceEntries(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-absence-entries", id]);
      },
    }
  );

  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => deleteAbsenceEntries(data),
    {
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-series-absence-entries", id]);
      },
    }
  );

  return (
    <AdminLayoutDetailWebinar loading={isLoading} active="absences">
      <AbsenceEtries
        id={id}
        data={data}
        create={create}
        isLoadingCreate={isLoadingCreate}
        update={update}
        isLoadingUpdate={isLoadingUpdate}
        remove={remove}
        isLoadingRemove={isLoadingRemove}
      />
    </AdminLayoutDetailWebinar>
  );
}

Absences.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Absences.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Absences;
