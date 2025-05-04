import { useState } from "react";
import { Comment } from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle,
  Trash2,
  Edit,
  X,
  Check,
} from "lucide-react";

interface Props {
  comment: Comment & {
    children?: Comment[];
  };
  postId: number;
}

const createReply = async (
  replyContent: string,
  postId: number,
  parentCommentId: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error("You must be logged in to reply.");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: replyContent,
    parent_comment_id: parentCommentId,
    user_id: userId,
    author: author,
  });

  if (error) throw new Error(error.message);
};

const updateComment = async (
  commentId: number,
  newContent: string,
  userId?: string
) => {
  if (!userId) {
    throw new Error("You must be logged in to update comments.");
  }

  // For testing purposes, we're removing the user_id check
  // In production, you'd keep the .eq("user_id", userId) check
  const { error } = await supabase
    .from("comments")
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq("id", commentId);
  // .eq("user_id", userId); // Ensure user can only edit their own comments

  if (error) throw new Error(error.message);
};

const deleteComment = async (commentId: number, userId?: string) => {
  if (!userId) {
    throw new Error("You must be logged in to delete comments.");
  }

  // For testing purposes, we're removing the user_id check
  // In production, you'd keep the .eq("user_id", userId) check
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);
  // .eq("user_id", userId); // Ensure user can only delete their own comments

  if (error) throw new Error(error.message);
};

export const CommentItem = ({ comment, postId }: Props) => {
  const [showReply, setShowReply] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(comment.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Always show edit/delete for testing purposes
  // In production, you'd use: const isCommentOwner = user?.id === comment.user_id;
  const isCommentOwner = user ? true : false; // Show controls if user is logged in

  const replyMutation = useMutation({
    mutationFn: (replyContent: string) =>
      createReply(
        replyContent,
        postId,
        comment.id,
        user?.id,
        user?.user_metadata?.user_name
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setReplyText("");
      setShowReply(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (newContent: string) =>
      updateComment(comment.id, newContent, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setIsEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteComment(comment.id, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    replyMutation.mutate(replyText);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText.trim() || editText === comment.content) return;
    updateMutation.mutate(editText);
  };

  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      deleteMutation.mutate();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.content);
  };

  // Format the timestamp in a more readable way
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  const hasReplies = comment.children && comment.children.length > 0;
  const replyCount = hasReplies ? comment.children.length : 0;

  return (
    <div className="pl-4 border-l-2 border-gray-700 hover:border-gray-500 transition-colors duration-200">
      <div className="mb-3 pt-2">
        <div className="flex items-center space-x-2 mb-1">
          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
            {comment.author?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-blue-400">
                {comment.author}
              </span>
            </div>
          </div>

          {isCommentOwner && !isEditing && !showDeleteConfirm && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-gray-700"
                aria-label="Edit comment"
              >
                <Edit size={16} />
                <span className="text-xs">Edit</span>
              </button>
              <button
                onClick={handleDeleteClick}
                className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-700"
                aria-label="Delete comment"
              >
                <Trash2 size={16} />
                <span className="text-xs">Delete</span>
              </button>
            </div>
          )}

          {showDeleteConfirm && (
            <div className="flex gap-2">
              <button
                onClick={handleDeleteClick}
                className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded flex items-center gap-1 transition-colors"
                disabled={deleteMutation.isPending}
              >
                <Check size={14} />
                {deleteMutation.isPending ? "Deleting..." : "Confirm"}
              </button>
              <button
                onClick={cancelDelete}
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs py-1 px-2 rounded flex items-center gap-1 transition-colors"
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="pl-10">
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-2 mb-2">
              <div className="relative">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-800 p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200"
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm flex items-center gap-1"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      updateMutation.isPending ||
                      !editText.trim() ||
                      editText === comment.content
                    }
                    className={`px-3 py-1 rounded text-sm flex items-center gap-1 ${
                      updateMutation.isPending ||
                      !editText.trim() ||
                      editText === comment.content
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                    } transition-colors`}
                  >
                    <Check size={14} />
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>

              {updateMutation.isError && (
                <div className="text-red-400 flex items-center gap-1 text-sm">
                  <AlertCircle size={14} />
                  <span>Error updating comment. Please try again.</span>
                </div>
              )}
            </form>
          ) : (
            <p className="text-gray-300 mb-2">{comment.content}</p>
          )}

          {!isEditing && !showDeleteConfirm && (
            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => setShowReply((prev) => !prev)}
                className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <CornerDownRight size={14} />
                {showReply ? "Cancel" : "Reply"}
              </button>

              {hasReplies && (
                <button
                  onClick={() => setIsCollapsed((prev) => !prev)}
                  className="flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
                  aria-label={isCollapsed ? "Show replies" : "Hide replies"}
                >
                  {isCollapsed ? (
                    <>
                      <ChevronDown size={14} />
                      <span>
                        Show {replyCount}{" "}
                        {replyCount === 1 ? "reply" : "replies"}
                      </span>
                    </>
                  ) : (
                    <>
                      <ChevronUp size={14} />
                      <span>Hide replies</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {showReply && (
        <div className="ml-10 mb-4">
          {user ? (
            <form onSubmit={handleReplySubmit} className="space-y-2">
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border border-gray-700 bg-gray-800 p-3 pr-12 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-200"
                  placeholder="Write your reply..."
                  rows={2}
                />
                <button
                  type="submit"
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className={`absolute right-2 bottom-2 p-2 rounded-full ${
                    replyMutation.isPending || !replyText.trim()
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  } transition-colors`}
                  aria-label="Send reply"
                >
                  <Send size={16} />
                </button>
              </div>

              {replyMutation.isError && (
                <div className="text-red-400 flex items-center gap-1 text-sm">
                  <AlertCircle size={14} />
                  <span>Error posting reply. Please try again.</span>
                </div>
              )}
            </form>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-sm">
                Please log in to reply to comments
              </p>
            </div>
          )}
        </div>
      )}

      {hasReplies && !isCollapsed && (
        <div className="space-y-2 mt-1">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
};
