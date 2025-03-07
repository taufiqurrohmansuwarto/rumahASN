import React from "react";
import RekonIPASN from "./RekonIPASN";
import { Stack } from "@mantine/core";
import RekonLayananPangkat from "./RekonLayananPangkat";
import RekonLayananPensiun from "./RekonLayananPensiun";
function RekonDashboardDetail() {
  return (
    <Stack>
      <RekonLayananPangkat />
      <RekonLayananPensiun />
      <RekonIPASN />
    </Stack>
  );
}

export default RekonDashboardDetail;
