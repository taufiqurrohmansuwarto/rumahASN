import AgentLayout from "@/components/AgentLayout";
import React from "react";

function SavedReplies() {
  return <div>profile</div>;
}

SavedReplies.getLayout = (page) => {
  return <AgentLayout>{page}</AgentLayout>;
};

export default SavedReplies;
