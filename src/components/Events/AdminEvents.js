import { getEvents } from "@/services/events.services";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function AdminEvents() {
  const { data, isLoading } = useQuery(["events"], () => getEvents(), {});
  return <div>AdminEvents</div>;
}

export default AdminEvents;
