import { Card, Flex, Skeleton } from "antd";

const ContentCardSkeleton = () => {
  return (
    <div>
      {[1, 2, 3].map((item) => (
        <Card
          key={item}
          style={{
            width: "100%",
            marginBottom: "16px",
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Flex>
            {/* Vote Section Skeleton */}
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                borderRight: "1px solid #EDEFF1",
              }}
            >
              <Skeleton.Avatar size={16} style={{ marginBottom: "4px" }} />
              <Skeleton.Input style={{ width: "20px", height: "12px" }} active size="small" />
            </div>
            
            {/* Content Section Skeleton */}
            <Flex vertical style={{ flex: 1, padding: "12px 16px" }} gap={8}>
              {/* Meta line */}
              <Skeleton.Input style={{ width: "60%" }} active size="small" />
              
              {/* Title */}
              <Skeleton.Input style={{ width: "90%" }} active />
              
              {/* Content preview */}
              <Skeleton
                paragraph={{ rows: 2, width: ["100%", "75%"] }}
                title={false}
                active
              />
              
              {/* Tags */}
              <Flex gap="4px" style={{ marginBottom: "8px" }}>
                <Skeleton.Button size="small" style={{ width: "60px", height: "20px" }} />
                <Skeleton.Button size="small" style={{ width: "50px", height: "20px" }} />
                <Skeleton.Button size="small" style={{ width: "40px", height: "20px" }} />
              </Flex>
              
              {/* Bottom actions */}
              <Flex justify="space-between" align="center">
                <Flex gap="16px">
                  <Skeleton.Button size="small" style={{ width: "30px" }} />
                  <Skeleton.Button size="small" style={{ width: "30px" }} />
                </Flex>
                <Skeleton.Button size="small" style={{ width: "50px" }} />
              </Flex>
            </Flex>
          </Flex>
        </Card>
      ))}
    </div>
  );
};

export default ContentCardSkeleton;