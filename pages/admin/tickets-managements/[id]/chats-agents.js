import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { detailTicket } from "../../../../services/admin.services";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AdminLayout from "../../../../src/components/AdminLayout";

const AdminChatsAgents = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["admin-tickets", id],
    () => detailTicket(id),
    {}
  );

  return (
    <ActiveLayout
      loading={isLoading}
      id={router?.query?.id}
      role="admin"
      active="chats-agents"
    >
      <div>Sebentar masih belum diimplementasikan</div>
    </ActiveLayout>
  );
};

AdminChatsAgents.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

AdminChatsAgents.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminChatsAgents;
