import { useQuery } from "@tanstack/react-query";
import { getUsers, checkTTEUser } from "@/services/esign-bkd.services";
import { useState, useCallback, useMemo } from "react";
import { Avatar, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";

// Get users with optional search
export const useUsers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["esign-users", params],
    queryFn: () => getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// check tte user
export const useCheckTTEUser = () => {
  return useQuery({
    queryKey: ["esign-check-tte-user"],
    queryFn: () => checkTTEUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Get users with client-side search functionality
export const useUserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Query to get all users (no server-side search needed)
  const query = useQuery({
    queryKey: ["esign-users-all"],
    queryFn: () => getUsers({}), // Get all users
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Client-side filtered users based on search term
  const filteredUsers = useMemo(() => {
    if (!query.data) return [];

    if (!searchTerm.trim()) {
      return query.data;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return query.data.filter(
      (user) =>
        user.username?.toLowerCase().includes(lowerSearchTerm) ||
        user.nama_jabatan?.toLowerCase().includes(lowerSearchTerm)
    );
  }, [query.data, searchTerm]);

  // Update search term
  const handleSearch = useCallback((value) => {
    setSearchTerm(value || "");
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // Get user options for Select component (based on filtered results)
  const userOptions = useMemo(() => {
    if (!filteredUsers) return [];

    return filteredUsers.map((user) => ({
      value: user.id, // custom_id
      label: (
        <Flex align="center" gap="small">
          <Avatar
            size={24}
            src={user.image || user.avatar}
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{user.username}</div>
            {user.nama_jabatan && (
              <div
                style={{
                  fontSize: 11,
                  color: "#666",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {user.nama_jabatan}
              </div>
            )}
          </div>
        </Flex>
      ),
      user: user,
    }));
  }, [filteredUsers]);

  return {
    // Query state
    data: query.data,
    users: filteredUsers,
    userOptions,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    isError: query.isError,

    // Search state
    searchTerm,

    // Actions
    handleSearch,
    clearSearch,
    refetch: query.refetch,
  };
};
