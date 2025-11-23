import PageContainer from "@/components/PageContainer";
import { Box, Flex, Grid as MantineGrid, Paper, Stack, Text } from "@mantine/core";
import {
  IconBookmark,
  IconHistory,
  IconMessage,
  IconUser,
} from "@tabler/icons-react";
import { Breadcrumb, Grid, Tabs } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

function ProfileLayout({
  children,
  tabActiveKey = "profil",
  title = "Pengaturan Profil",
}) {
  const router = useRouter();
  const screens = Grid.useBreakpoint();

  const items = [
    {
      label: "Profil",
      key: "profil",
      icon: <IconUser size={14} />,
      color: "#6366F1",
    },
    {
      label: "Aktivitas",
      key: "activities",
      icon: <IconHistory size={14} />,
      color: "#22C55E",
    },
    {
      label: "Pertanyaan Tersimpan",
      key: "saved",
      icon: <IconBookmark size={14} />,
      color: "#F59E0B",
    },
    {
      label: "Template Balasan",
      key: "saved-replies",
      icon: <IconMessage size={14} />,
      color: "#EF4444",
    },
  ];

  const handleTabChange = (key) => {
    if (key === "profil") {
      router.push(`/settings/profile`);
    } else {
      router.push(`/settings/profile/${key}`);
    }
  };

  const getCurrentTab = () => {
    return items.find((item) => item.key === tabActiveKey) || items[0];
  };

  const currentTab = getCurrentTab();

  return (
    <PageContainer
      title="Pengaturan Profil"
      subTitle="Kelola dan pantau data Anda"
      childrenContentStyle={{
        paddingLeft: screens.xs ? 12 : null,
        paddingRight: screens.xs ? 12 : null,
      }}
      breadcrumbRender={() => (
        <Breadcrumb style={{ marginBottom: 16, fontSize: "13px" }}>
          <Breadcrumb.Item>
            <Link href="/feeds">Beranda</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Pengaturan Profil</Breadcrumb.Item>
        </Breadcrumb>
      )}
    >
      {/* Horizontal Tabs Layout - Ultra Compact */}
      <Paper radius="md" withBorder>
          <Tabs
            activeKey={tabActiveKey}
          onChange={handleTabChange}
          size="small"
            tabBarStyle={{
              margin: 0,
            padding: "8px 12px 0 12px",
              borderBottom: "1px solid #E5E7EB",
            backgroundColor: "#FAFAFA",
            }}
            items={items.map((item) => ({
              key: item.key,
              label: (
              <Flex align="center" gap={6} style={{ padding: "2px 6px" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    backgroundColor: tabActiveKey === item.key ? item.color : "#E5E7EB",
                    color: tabActiveKey === item.key ? "white" : "#6B7280",
                    transition: "all 0.2s ease",
                  }}
                >
                  {item.icon}
                </Box>
                <Text
                  size="12px"
                  weight={tabActiveKey === item.key ? 600 : 500}
                  color={tabActiveKey === item.key ? "dark" : "dimmed"}
                  style={{ transition: "all 0.2s ease" }}
                  >
                    {item.label}
                </Text>
              </Flex>
              ),
              children: (
              <Box p={screens.xs ? "xs" : "sm"} style={{ minHeight: 500 }}>
                  {children}
              </Box>
              ),
            }))}
          />
      </Paper>
    </PageContainer>
  );
}

export default ProfileLayout;
