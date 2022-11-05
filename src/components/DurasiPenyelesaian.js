import { Text } from "@mantine/core";
import React from "react";
import { timeDifference } from "../../utils";

function DurasiPenyelesaian({ data }) {
  if (data?.status_code !== "SELESAI") return null;
  return <Text>{timeDifference(data?.completed_at, data?.created_at)}</Text>;
}

export default DurasiPenyelesaian;
