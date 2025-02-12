import { Me, MeUser } from "ordercloud-javascript-sdk";
import { queryClient, useAuthMutation, useAuthQuery } from "@ordercloud/react-sdk";

export function useCurrentUser() {
  return useAuthQuery({
    queryKey: ["currentUser"],
    queryFn: async () => await Me.Get(),
    retry: false,
    refetchOnMount:false,
  });
}

export function useMutateCurrentUser() {
    return useAuthMutation({
        mutationKey: ["currentUser"],
        mutationFn: async (userData:Partial<MeUser>) => await Me.Patch(userData),
        onSuccess: (data) => {
            queryClient.setQueryData(["currentUser"], data)
        },
    })
}