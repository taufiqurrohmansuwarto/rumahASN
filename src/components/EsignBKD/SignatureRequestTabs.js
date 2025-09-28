import { Tabs } from "antd";
import { useRouter } from "next/router";
import {
  IconFileText,
  IconHistory,
  IconChecklist,
  IconSignature
} from "@tabler/icons-react";

function SignatureRequestTabs({ children }) {
  const router = useRouter();
  const { id } = router.query;

  const tabItems = [
    {
      key: "detail",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconFileText size={16} />
          Detail
        </span>
      ),
    },
    {
      key: "history",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconHistory size={16} />
          Riwayat
        </span>
      ),
    },
    {
      key: "review",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconChecklist size={16} />
          Review
        </span>
      ),
    },
    {
      key: "sign",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconSignature size={16} />
          Tanda Tangan
        </span>
      ),
    },
  ];

  // Determine active tab based on current route
  const getActiveKey = () => {
    const pathname = router.pathname;
    if (pathname.includes("/history")) return "history";
    if (pathname.includes("/review")) return "review";
    if (pathname.includes("/sign")) return "sign";
    return "detail";
  };

  const handleTabChange = (key) => {
    const basePath = `/esign-bkd/signature-requests/${id}`;

    switch (key) {
      case "detail":
        router.push(basePath);
        break;
      case "history":
        router.push(`${basePath}/history`);
        break;
      case "review":
        router.push(`${basePath}/review`);
        break;
      case "sign":
        router.push(`${basePath}/sign`);
        break;
      default:
        router.push(basePath);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "1px solid #e8e8ea",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            padding: "24px 24px 0 24px",
          }}
        >
          <Tabs
            items={tabItems}
            activeKey={getActiveKey()}
            onChange={handleTabChange}
            size="large"
            style={{
              marginBottom: 0,
            }}
            tabBarStyle={{
              marginBottom: 24,
              paddingBottom: 0,
            }}
          />

          <div style={{ padding: "0 0 24px 0" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignatureRequestTabs;