import { useQueryClient } from "@tanstack/react-query";

const useRefetch = () => {
  const quryClient = useQueryClient();

  return async () => {
    await quryClient.refetchQueries({
      type: "active",
    });
  };
};

export default useRefetch;
