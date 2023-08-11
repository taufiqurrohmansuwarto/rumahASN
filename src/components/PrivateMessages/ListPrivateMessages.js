import { getPrivateMessages } from "@/services/index";
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchItems =
  (type) =>
  async ({ pageParam = 1, queryKey }) => {
    const [_, limit] = queryKey;
    const response = await getPrivateMessages({
      page: pageParam,
      limit: limit,
      type,
    });

    return response;
  };

function ListPrivateMessages({ type }) {
  const { data, isLoading, hasNextPage, fetchNextPage } = useInfiniteQuery(
    [`mails_${type}`, 10],
    fetchItems(type),
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.hasNextPage) return lastPage.page + 1;
        return false;
      },
    }
  );
  return <div>{JSON.stringify(data)}</div>;
}

export default ListPrivateMessages;
