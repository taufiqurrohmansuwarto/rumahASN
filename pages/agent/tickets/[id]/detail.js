import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, message, Modal, Skeleton, Space } from "antd";
import { useRouter } from "next/router";
import {
  akhiriPekerjaanSelesai,
  akhirPekerjaanTidakSelesai,
  detailTicket,
} from "../../../../services/agents.services";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AgentKerjakan from "../../../../src/components/AgentKerjakan";
import AgentLayout from "../../../../src/components/AgentLayout";
import AgentTicketDetail from "../../../../src/components/AgentTicketDetail";

const TicketsDetail = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    ["agent-tickets", router?.query?.id],
    () => detailTicket(router?.query?.id)
  );

  const { mutateAsync: akhiriSelesai } = useMutation(
    (id) => akhiriPekerjaanSelesai(id),
    {
      onSettled: () =>
        queryClient.invalidateQueries(["agent-tickets", router?.query?.id]),
      onSuccess: () => message.success("Berhasil mengakhiri pekerjaan"),
      onError: () => message.error("Gagal mengakhiri pekerjaan"),
    }
  );

  const { mutateAsync: akhiriTolak } = useMutation(
    (id) => akhirPekerjaanTidakSelesai(id),
    {
      onSettled: () =>
        queryClient.invalidateQueries(["agent-tickets", router?.query?.id]),
      onSuccess: () => message.success("Berhasil mengakhiri pekerjaan"),
      onError: () => message.error("Gagal mengakhiri pekerjaan"),
    }
  );

  const handleAkhiriSelesai = () => {
    Modal.confirm({
      title: "Akhiri pekerjaan",
      content:
        "Apakah anda yakin ingin mengakhiri pekerjaan ini dengan status selesai?",
      onOk: async () => {
        await akhiriSelesai(router?.query?.id);
      },
    });
  };

  const handleAkhiriTolak = () => {
    Modal.confirm({
      title: "Akhiri pekerjaan",
      content:
        "Apakah anda yakin ingin mengakhiri pekerjaan ini dengan status ditolak?",
      onOk: async () => {
        await akhiriTolak(router?.query?.id);
      },
    });
  };

  return (
    <ActiveLayout role="agent" id={router?.query?.id}>
      <Skeleton loading={isLoading}>
        {data?.status_code === "DIAJUKAN" && data?.chooser ? (
          <AgentKerjakan data={data} />
        ) : (
          <AgentTicketDetail data={data} />
        )}
      </Skeleton>
    </ActiveLayout>
  );
};

TicketsDetail.getLayout = (page) => {
  return <AgentLayout active="/agent/tickets">{page}</AgentLayout>;
};

TicketsDetail.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default TicketsDetail;
