import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../../services";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const Categories = () => {
  const { data, isLoading } = useQuery(["categories"], () => getCategories());
  return <PageContainer>{JSON.stringify(data)}</PageContainer>;
};

Categories.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Categories.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Categories;
