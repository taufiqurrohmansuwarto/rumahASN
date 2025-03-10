import { Stack } from "@mantine/core";
import RekonIPASN from "./RekonIPASN";
import RekonLayananPangkat from "./RekonLayananPangkat";
import RekonLayananPensiun from "./RekonLayananPensiun";
import { FloatButton } from "antd";
import useScrollRestoration from "@/hooks/useScrollRestoration";
function RekonDashboardDetail() {
  useScrollRestoration();

  return (
    <Stack>
      <FloatButton.BackTop />
      <RekonLayananPangkat />
      <RekonLayananPensiun />
      <RekonIPASN />
    </Stack>
  );
}

export default RekonDashboardDetail;
