import { Query, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getAllTickets } from "../../../services/admin.services";
import AdminLayout from "../../../src/components/AdminLayout";

const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const BelumDikerjakan = () => {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    status: "DIAJUKAN",
  });

  const { data, isLoading } = useQuery(
    ["admin-tickets", query],
    () => getAllTickets(query),
    {
      enabled: !!query,
    }
  );

  return (
    <PageContainer>
      <div>{JSON.stringify(data)}</div>
    </PageContainer>
  );
};

BelumDikerjakan.Auth = {
  action: "manage",
  subject: "Tickets",
};

BelumDikerjakan.getLayout = function (page) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default BelumDikerjakan;
