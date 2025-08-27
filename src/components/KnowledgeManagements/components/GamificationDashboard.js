import React from "react";
import { Row, Col, Grid, Spin } from "antd";
import UserXPProgress from "./UserXPProgress";
import UserBadgeGallery from "./UserBadgeGallery";
import UserMissionList from "./UserMissionList";
import Leaderboard from "./Leaderboard";
import { 
  useUserPoints, 
  useUserBadges, 
  useUserMissions, 
  useLeaderboard,
  useCompleteMission 
} from "@/hooks/knowledge-management/useGamification";

const { useBreakpoint } = Grid;

const GamificationDashboard = () => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Fetch all gamification data
  const { data: userPoints, isLoading: loadingPoints } = useUserPoints();
  const { data: userBadges, isLoading: loadingBadges } = useUserBadges();
  const { data: userMissions, isLoading: loadingMissions } = useUserMissions();
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard();
  const { mutateAsync: completeMission } = useCompleteMission();

  const handleCompleteMission = async (missionId) => {
    try {
      await completeMission(missionId);
    } catch (error) {
      console.error("Failed to complete mission:", error);
    }
  };

  // Show loading spinner if any critical data is loading
  const isLoading = loadingPoints || loadingBadges;

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? "12px 0" : "16px 0" }}>
      <Row gutter={[16, 16]}>
        {/* Top Row - XP Progress (Full Width) */}
        <Col span={24}>
          <UserXPProgress 
            userPoints={userPoints} 
            loading={loadingPoints}
          />
        </Col>

        {/* Second Row - Badges and Leaderboard */}
        <Col xs={24} lg={16}>
          <UserBadgeGallery 
            userBadges={userBadges} 
            loading={loadingBadges}
          />
        </Col>
        
        <Col xs={24} lg={8}>
          <Leaderboard 
            leaderboardData={leaderboard} 
            loading={loadingLeaderboard}
          />
        </Col>

        {/* Third Row - Missions (Full Width) */}
        <Col span={24}>
          <UserMissionList 
            userMissions={userMissions} 
            loading={loadingMissions}
            onCompleteMission={handleCompleteMission}
          />
        </Col>
      </Row>
    </div>
  );
};

export default GamificationDashboard;