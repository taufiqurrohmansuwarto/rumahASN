import { useQuery } from "@tanstack/react-query";
import React from "react";
function ChangeFeedback() {
  const { data, isloading } = useQuery(["changeFeedback"], () => {});
  return <div>ChangeFeedback</div>;
}

export default ChangeFeedback;
