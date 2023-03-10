import AgentLayout from "@/components/AgentLayout";
import React from "react";

function Profile() {
  return <div>profile</div>;
}

Profile.getLayout = (page) => {
  return <AgentLayout>{page}</AgentLayout>;
};

export default Profile;
