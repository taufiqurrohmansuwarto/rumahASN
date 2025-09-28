import { Tabs } from "antd";

function TabLayout({ items, defaultActiveKey = null, title, description }) {
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {(title || description) && (
          <div style={{ marginBottom: 24 }}>
            {title && (
              <h2 style={{ margin: 0, color: "#1d1d1f", fontSize: 28, fontWeight: 600 }}>
                {title}
              </h2>
            )}
            {description && (
              <p style={{ margin: "8px 0 0 0", color: "#8e8e93", fontSize: 16 }}>
                {description}
              </p>
            )}
          </div>
        )}

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
            items={items}
            defaultActiveKey={defaultActiveKey || items?.[0]?.key}
            size="large"
            style={{
              marginBottom: 0,
            }}
            tabBarStyle={{
              marginBottom: 24,
              paddingBottom: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default TabLayout;