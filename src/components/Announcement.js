import { getAnnouncements } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";

function Announcement() {
  const { data, isLoading } = useQuery(
    ["announcements"],
    () => getAnnouncements(),
    {}
  );

  return (
    <>
      {data && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title={data?.title}
          color="yellow"
          variant="filled"
        >
          <div
            dangerouslySetInnerHTML={{
              __html: data?.html,
            }}
          />
        </Alert>
      )}
    </>
  );
}

export default Announcement;
