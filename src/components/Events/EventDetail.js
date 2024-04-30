import { getEvent } from "@/services/events.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React from "react";

function EventDetail() {
  const router = useRouter();
  const { eventId } = router.query;
  const { data, isLoading } = useQuery(
    ["event-detail", eventId],
    () => getEvent(eventId),
    {
      enabled: !!eventId,
    }
  );
  return <div>{JSON.stringify(data)}</div>;
}

export default EventDetail;
