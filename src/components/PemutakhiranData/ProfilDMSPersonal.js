import { useQuery } from "@tanstack/react-query";
import { getDMSScoringPersonal } from "@/services/siasn-services";
import { Skeleton, Tooltip, Tag } from "antd";
import { IconArchive, IconRefresh } from "@tabler/icons-react";

const ProfilDMSPersonal = () => {
  const { data, isLoading, isFetching, refetch } = useQuery(
    ["dms-scoring-personal"],
    () => getDMSScoringPersonal(),
    {
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return <Skeleton.Button active size="small" style={{ width: 80 }} />;
  }

  if (!data || data.skor_arsip_digital == null) {
    return null;
  }

  const score = data.skor_arsip_digital;

  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "gold";
    if (score >= 40) return "orange";
    return "red";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Sangat Baik";
    if (score >= 60) return "Baik";
    if (score >= 40) return "Cukup";
    return "Kurang";
  };

  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  return (
    <Tooltip title={`Skor Arsip Digital: ${score} (${scoreLabel}). Klik untuk refresh.`}>
      <Tag
        color={scoreColor}
        style={{
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          borderRadius: 4,
          fontSize: 12,
        }}
        onClick={() => refetch()}
        icon={
          isFetching ? (
            <IconRefresh size={12} style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <IconArchive size={12} />
          )
        }
      >
        DMS: {score}
      </Tag>
    </Tooltip>
  );
};

export default ProfilDMSPersonal;
