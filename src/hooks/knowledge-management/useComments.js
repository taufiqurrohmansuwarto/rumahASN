import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  getKnowledgeContentComments,
  getKnowledgeContentCommentsHierarchical,
  createKnowledgeContentComment,
  createKnowledgeContentReply,
  updateKnowledgeContentComment,
  deleteKnowledgeContentComment,
  likeKnowledgeContentComment,
  pinKnowledgeContentComment,
} from "@/services/knowledge-management.services";
import { useTriggerXP } from "./useGamification";

// Get comments (flat structure)
export const useComments = (contentId, options = {}) => {
  return useQuery({
    queryKey: ["comments", contentId],
    queryFn: () => getKnowledgeContentComments(contentId),
    enabled: !!contentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Get hierarchical comments (nested structure)
export const useCommentsHierarchical = (contentId, options = {}) => {
  return useQuery({
    queryKey: ["comments-hierarchical", contentId],
    queryFn: () => getKnowledgeContentCommentsHierarchical(contentId),
    enabled: !!contentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Create new comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { triggerXP } = useTriggerXP();

  return useMutation({
    mutationFn: createKnowledgeContentComment,
    onSuccess: (_, variables) => {
      message.success("Berhasil menambahkan komentar");
      
      // Invalidate comments queries
      queryClient.invalidateQueries({ queryKey: ["comments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["comments-hierarchical", variables.id] });
      
      // Trigger XP notification
      triggerXP("comment_content", 3);
    },
    onError: (error) => {
      console.error("Failed to create comment:", error);
      message.error(error?.response?.data?.message || "Gagal menambahkan komentar");
    },
  });
};

// Create reply to comment
export const useCreateReply = () => {
  const queryClient = useQueryClient();
  const { triggerXP } = useTriggerXP();

  return useMutation({
    mutationFn: createKnowledgeContentReply,
    onSuccess: (_, variables) => {
      message.success("Berhasil menambahkan balasan");
      
      // Invalidate comments queries
      queryClient.invalidateQueries({ queryKey: ["comments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["comments-hierarchical", variables.id] });
      
      // Trigger XP notification
      triggerXP("reply_comment", 2);
    },
    onError: (error) => {
      console.error("Failed to create reply:", error);
      message.error(error?.response?.data?.message || "Gagal menambahkan balasan");
    },
  });
};

// Update comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateKnowledgeContentComment,
    onSuccess: (_, variables) => {
      message.success("Berhasil mengedit komentar");
      
      // Invalidate comments queries
      queryClient.invalidateQueries({ queryKey: ["comments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["comments-hierarchical", variables.id] });
    },
    onError: (error) => {
      console.error("Failed to update comment:", error);
      message.error(error?.response?.data?.message || "Gagal mengedit komentar");
    },
  });
};

// Delete comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteKnowledgeContentComment,
    onSuccess: (_, variables) => {
      message.success("Berhasil menghapus komentar");
      
      // Invalidate comments queries
      queryClient.invalidateQueries({ queryKey: ["comments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["comments-hierarchical", variables.id] });
    },
    onError: (error) => {
      console.error("Failed to delete comment:", error);
      message.error(error?.response?.data?.message || "Gagal menghapus komentar");
    },
  });
};

// Like/Unlike comment
export const useLikeComment = () => {
  const queryClient = useQueryClient();
  const { triggerXP } = useTriggerXP();

  return useMutation({
    mutationFn: likeKnowledgeContentComment,
    onSuccess: (data, variables) => {
      // Show message based on like status
      if (data.liked) {
        message.success("Berhasil menyukai komentar");
        triggerXP("like_comment", 1);
      } else {
        message.success("Berhasil membatalkan like komentar");
      }
      
      // Invalidate comments queries to update like counts
      queryClient.invalidateQueries({ queryKey: ["comments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["comments-hierarchical", variables.id] });
    },
    onError: (error) => {
      console.error("Failed to like comment:", error);
      message.error(error?.response?.data?.message || "Gagal menyukai komentar");
    },
  });
};

// Pin/Unpin comment
export const usePinComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: pinKnowledgeContentComment,
    onSuccess: (data, variables) => {
      // Show message based on pin status
      if (data.is_pinned) {
        message.success("Berhasil pin komentar");
      } else {
        message.success("Berhasil unpin komentar");
      }
      
      // Invalidate comments queries to update pin status and order
      queryClient.invalidateQueries({ queryKey: ["comments", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["comments-hierarchical", variables.id] });
    },
    onError: (error) => {
      console.error("Failed to pin comment:", error);
      message.error(error?.response?.data?.message || "Gagal pin komentar");
    },
  });
};

// Combined hook for comment interactions
export const useCommentInteractions = (contentId) => {
  const createComment = useCreateComment();
  const createReply = useCreateReply();
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();
  const likeComment = useLikeComment();
  const pinComment = usePinComment();

  return {
    createComment: (data) => createComment.mutate({ id: contentId, data }),
    createReply: (commentId, data) => createReply.mutate({ id: contentId, commentId, data }),
    updateComment: (commentId, data) => updateComment.mutate({ id: contentId, commentId, data }),
    deleteComment: (commentId) => deleteComment.mutate({ id: contentId, commentId }),
    likeComment: (commentId) => likeComment.mutate({ id: contentId, commentId }),
    pinComment: (commentId) => pinComment.mutate({ id: contentId, commentId }),
    
    // Loading states
    isCreatingComment: createComment.isPending,
    isCreatingReply: createReply.isPending,
    isUpdatingComment: updateComment.isPending,
    isDeletingComment: deleteComment.isPending,
    isLikingComment: likeComment.isPending,
    isPinningComment: pinComment.isPending,
  };
};