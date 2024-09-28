import { getAllScheduleVisits } from "@/services/guests-books.services";
import { useQuery } from "@tanstack/react-query";
import React from "react";

function GuestBookVisitAll() {
  const { data, isLoading } = useQuery(
    ["guest-book-all-visited"],
    () => getAllScheduleVisits(),
    {}
  );

  return <div>{JSON.stringify(data)}</div>;
}

export default GuestBookVisitAll;
