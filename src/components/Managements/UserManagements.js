import { getRoles } from "@/services/managements.services";
import { useQueries, useQuery } from "@tanstack/react-query";
import React from "react";

function UserManagements() {
  const { data, isLoading } = useQuery(["roles"], () => getRoles(), {});

  return <div>{JSON.stringify(data)}</div>;
}

export default UserManagements;
