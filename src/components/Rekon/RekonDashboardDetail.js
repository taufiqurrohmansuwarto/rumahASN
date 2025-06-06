import { Stack } from "@mantine/core";
import RekonIPASN from "./RekonIPASN";
import RekonLayananPangkat from "./RekonLayananPangkat";
import RekonLayananPensiun from "./RekonLayananPensiun";
import { FloatButton } from "antd";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import RekonPG from "./RekonPG";
import RekonMFA from "./RekonMFA";

function RekonDashboardDetail() {
  useScrollRestoration();

  return (
    <Stack>
      <FloatButton.BackTop />
      <RekonMFA />
      <RekonLayananPangkat />
      <RekonLayananPensiun />
      <RekonIPASN />
      <RekonPG />
    </Stack>
  );
}

export default RekonDashboardDetail;
