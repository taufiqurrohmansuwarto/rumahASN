import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Stack } from "@mantine/core";
import { FloatButton } from "antd";
import RekonIPASN from "./RekonIPASN";
import RekonLayananPensiun from "./RekonLayananPensiun";
import RekonMFA from "./RekonMFA";
import RekonPG from "./RekonPG";

const RekonDashboardDetail = () => {
  useScrollRestoration();

  return (
    <Stack>
      <FloatButton.BackTop />
      <RekonMFA />
      {/* <RekonLayananPangkat /> */}
      <RekonLayananPensiun />
      <RekonIPASN />
      <RekonPG />
    </Stack>
  );
};

export default RekonDashboardDetail;
