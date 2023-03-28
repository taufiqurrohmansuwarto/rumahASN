import { createFeedbacks, getFeedbacks } from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

function CreateFeeback() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(["feedbacks-apps"], () =>
    getFeedbacks()
  );

  const { mutate: crate, isLoading: createLoading } = useMutation(
    (data) => createFeedbacks(data),
    {}
  );

  return <div>CreateFeeback</div>;
}

export default CreateFeeback;
