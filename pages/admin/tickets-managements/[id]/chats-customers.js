import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { detailTicket } from "../../../../services/admin.services";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AdminLayout from "../../../../src/components/AdminLayout";
import ChatAgentToCustomerAdmin from "../../../../src/components/ChatAgentToCustomerAdmin";

const AdminsChatsCustomers = () => {
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
      active="chats-customers"
      id={router?.query?.id}
      role="admin"
    >
      <ChatAgentToCustomerAdmin id={id} />
    </ActiveLayout>
  );
};

AdminsChatsCustomers.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

AdminsChatsCustomers.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default AdminsChatsCustomers;
