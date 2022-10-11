import { useQuery } from "@tanstack/react-query";
import { getPriorities } from "../../../services";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const Priorities = () => {
  const { data, isLoading } = useQuery(["priorities"], () => getPriorities());
  return <PageContainer>{JSON.stringify(data)}</PageContainer>;
};

Priorities.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Priorities.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Priorities;
