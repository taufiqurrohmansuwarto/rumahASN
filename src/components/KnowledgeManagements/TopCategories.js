import { useTopCategories } from "@/hooks/knowledge-management/useKnowledgeInsights";
import {
  Card,
  Grid,
  List,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;
const { useBreakpoint } = Grid;

const CategoryItem = ({ category, isMobile }) => {
  const { category: categoryInfo } = category;

  return (
    <List.Item
      style={{
        padding: isMobile ? "6px 0" : "8px 0",
      }}
    >
      <List.Item.Meta
        avatar={null}
        title={
          <Text
            strong
            style={{
              fontSize: isMobile ? "11px" : "12px",
              lineHeight: "1.3",
              display: "block",
            }}
          >
            {categoryInfo?.name}
          </Text>
        }
      />
    </List.Item>
  );
};

function TopCategories({
  period = "month",
  sortBy = "content_count",
  limit = 10,
}) {
  const { data, isLoading, error } = useTopCategories({
    period,
    sortBy,
    limit,
  });

  const screens = useBreakpoint();
  const isMobile = screens.xs;
  const mainPadding = isMobile ? "12px" : "16px";

  const getSortByLabel = (sortBy) => {
    switch (sortBy) {
      case "engagement":
        return "paling engaging";
      case "activity":
        return "paling aktif";
      case "content_count":
      default:
        return "terbanyak kontennya";
    }
  };


  if (error) {
    return null;
  }

  return (
    <>
      {(data?.categories?.length > 0 || isLoading) && (
        <div>
          <Card
            style={{
              width: "100%",
              marginBottom: "16px",
            }}
            styles={{ body: { padding: 0 } }}
          >
            {/* Content Section */}
            <div style={{ padding: mainPadding }}>
                {/* Header */}
                <div style={{ marginBottom: "16px" }}>
                  <Tooltip
                    title={`Kategori ${getSortByLabel(sortBy)} periode ${
                      period === "month"
                        ? "bulan ini"
                        : period === "week"
                        ? "minggu ini"
                        : period === "quarter"
                        ? "kuartal ini"
                        : period === "year"
                        ? "tahun ini"
                        : "semua waktu"
                    }`}
                  >
                    <Text
                      strong
                      style={{
                        margin: 0,
                        color: "#1C1C1C",
                        fontSize: isMobile ? "12px" : "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "help",
                      }}
                    >
                      📁 Kategori Populer
                    </Text>
                  </Tooltip>
                </div>

                {/* Categories List */}
                <div>
                  {isLoading ? (
                    <div>
                      {[...Array(5)].map((_, index) => (
                        <div key={index} style={{ marginBottom: "16px" }}>
                          <Skeleton.Input
                            style={{ width: "100%", height: "40px" }}
                            active
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <List
                      dataSource={data?.categories || []}
                      split={false}
                      renderItem={(category, index) => (
                        <CategoryItem
                          key={category.category?.id}
                          category={category}
                          isMobile={isMobile}
                        />
                      )}
                    />
                  )}
                </div>
              </div>
          </Card>
        </div>
      )}
    </>
  );
}

export default TopCategories;
