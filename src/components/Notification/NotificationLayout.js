import { Tabs, Grid } from "antd";
import { useRouter } from "next/router";

const { useBreakpoint } = Grid;

function NotificationLayout({ children, active }) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const routes = [
    {
      path: "/notifications/forum-kepegawaian",
      key: "forum-kepegawaian",
      title: "Forum Kepegawaian",
    },
    {
      path: "/notifications/asn-connect",
      key: "asn-connect",
      title: "ASN Connect",
    },
  ];

  const handleTabChange = (key) => {
    const route = routes.find((route) => route.key === key);
    if (route) {
      router.push(route.path);
    }
  };

  return (
    <Tabs
      activeKey={active}
      onChange={handleTabChange}
      type="card"
      size={isMobile ? "small" : "default"}
      tabBarStyle={{
        marginBottom: isMobile ? "16px" : "20px",
      }}
      items={routes.map((route) => ({
        key: route.key,
        label: isMobile ? route.title.split(" ")[0] : route.title,
        children: children,
      }))}
    />
  );
}

export default NotificationLayout;
