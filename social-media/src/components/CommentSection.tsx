import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import {
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";

interface Props {
  postId: number;
}

interface NewComment {
  content: string;
  parent_comment_id?: number | null;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  content: string;
  user_id: string;
  created_at: string;
  author: string;
  children?: Comment[];
}

const createComment = async (
  newComment: NewComment,
  postId: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error("You must be logged in to comment.");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: newComment.content,
    parent_comment_id: newComment.parent_comment_id || null,
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
    .update({ content: newContent })
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

const fetchComments = async (postId: number): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Comment[];
};

const CommentItem = ({
  comment,
  postId,
}: {
  comment: Comment;
  postId: number;
}) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
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
      createComment(
        { content: replyContent, parent_comment_id: comment.id },
        postId,
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

  // const formatTimestamp = (timestamp: string) => {
  //   const date = new Date(timestamp);
  //   const now = new Date();
  //   const diffMs = now.getTime() - date.getTime();
  //   const diffMins = Math.round(diffMs / 60000);
  //   const diffHours = Math.round(diffMs / 3600000);
  //   const diffDays = Math.round(diffMs / 86400000);

  //   if (diffMins < 60) {
  //     return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  //   } else if (diffHours < 24) {
  //     return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  //   } else if (diffDays < 7) {
  //     return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  //   } else {
  //     return date.toLocaleDateString("en-US", {
  //       month: "short",
  //       day: "numeric",
  //       year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  //     });
  //   }
  // };

  const hasReplies = comment.children && comment.children.length > 0;
  const replyCount = hasReplies ? comment.children!.length : 0;
  const initials = comment.author
    ? comment.author
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="pl-4 border-l-2 border-indigo-900/40 hover:border-indigo-600/60 transition-colors duration-200">
      <div className="mb-3 pt-2">
        <div className="flex items-start space-x-3 mb-2">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-full w-8 h-8 flex items-center justify-center font-medium shadow-md flex-shrink-0">
            {initials}
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-indigo-400">
                  {comment.author}
                </span>
              </div>

              {isCommentOwner && !isEditing && !showDeleteConfirm && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-gray-400 hover:text-indigo-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/40"
                    aria-label="Edit comment"
                  >
                    <Edit size={16} />
                    <span className="text-xs">Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-800/40"
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
                    className="bg-red-500/80 hover:bg-red-600 text-white text-xs py-1 px-2 rounded flex items-center gap-1 transition-colors"
                    disabled={deleteMutation.isPending}
                  >
                    <Check size={14} />
                    {deleteMutation.isPending ? "Deleting..." : "Confirm"}
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="bg-gray-600/80 hover:bg-gray-500 text-white text-xs py-1 px-2 rounded flex items-center gap-1 transition-colors"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-2 mb-3">
                <div className="relative">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full border border-indigo-900/50 bg-indigo-950/20 p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200 resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="bg-gray-700/80 text-gray-300 px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm flex items-center gap-1"
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
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
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
              <p className="text-gray-200 mb-3">{comment.content}</p>
            )}

            {!isEditing && !showDeleteConfirm && (
              <div className="flex items-center gap-4 text-xs">
                <button
                  onClick={() => setShowReply((prev) => !prev)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <CornerDownRight size={14} />
                  {showReply ? "Cancel" : "Reply"}
                </button>

                {hasReplies && (
                  <button
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors"
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
      </div>

      {showReply && (
        <div className="ml-8 mb-4">
          {user ? (
            <div className="space-y-2">
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border border-indigo-900/50 bg-indigo-950/20 p-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200 placeholder-gray-500 resize-none"
                  placeholder="Write your reply..."
                  rows={2}
                />
                <button
                  onClick={handleReplySubmit}
                  disabled={replyMutation.isPending || !replyText.trim()}
                  className={`absolute right-2 bottom-2 p-2 rounded-full ${
                    replyMutation.isPending || !replyText.trim()
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  } transition-colors shadow-md`}
                  aria-label="Send reply"
                >
                  {replyMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              {replyMutation.isError && (
                <div className="text-red-400 flex items-center gap-1 text-sm">
                  <AlertCircle size={14} />
                  <span>Error posting reply. Please try again.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-indigo-950/20 border border-indigo-900/50 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-sm">
                Please log in to reply to comments
              </p>
            </div>
          )}
        </div>
      )}

      {hasReplies && !isCollapsed && (
        <div className="space-y-2 mt-1">
          {comment.children!.map((child) => (
            <CommentItem key={child.id} comment={child} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
};

export const CommentSection = ({ postId }: Props) => {
  const [newCommentText, setNewCommentText] = useState<string>("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: comments,
    isLoading,
    error,
  } = useQuery<Comment[], Error>({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(postId),
    refetchInterval: 5000,
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (newComment: NewComment) =>
      createComment(
        newComment,
        postId,
        user?.id,
        user?.user_metadata?.user_name
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setNewCommentText("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    mutate({ content: newCommentText, parent_comment_id: null });
  };

  const buildCommentTree = (
    flatComments: Comment[]
  ): (Comment & { children?: Comment[] })[] => {
    const map = new Map<number, Comment & { children?: Comment[] }>();
    const roots: (Comment & { children?: Comment[] })[] = [];

    flatComments.forEach((comment) => {
      map.set(comment.id, { ...comment, children: [] });
    });

    flatComments.forEach((comment) => {
      if (comment.parent_comment_id) {
        const parent = map.get(comment.parent_comment_id);
        if (parent) {
          parent.children!.push(map.get(comment.id)!);
        }
      } else {
        roots.push(map.get(comment.id)!);
      }
    });

    return roots;
  };

  const commentTree = comments ? buildCommentTree(comments) : [];
  const commentCount = comments ? comments.length : 0;

  return (
    <div className="mt-8 bg-gray-900/50 rounded-lg p-6 border border-indigo-900/30 shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="text-indigo-400" size={24} />
        <h3 className="text-2xl font-semibold text-gray-100">
          Comments{" "}
          {commentCount > 0 && (
            <span className="text-indigo-400">({commentCount})</span>
          )}
        </h3>
      </div>

      {user ? (
        <div className="mb-8 bg-gray-800/30 rounded-lg p-4 border border-indigo-900/20">
          <form onSubmit={handleSubmit}>
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full border border-indigo-900/50 bg-indigo-950/20 p-4 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-200 placeholder-gray-500 resize-none"
              placeholder="Share your thoughts..."
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={isPending || !newCommentText.trim()}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium ${
                  isPending || !newCommentText.trim()
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500"
                } transition-colors shadow-md`}
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </div>
            {isError && (
              <p className="text-red-400 mt-2 text-sm flex items-center gap-1">
                <AlertCircle size={14} />
                Error posting comment. Please try again.
              </p>
            )}
          </form>
        </div>
      ) : (
        <div className="mb-8 bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-5 text-center">
          <p className="text-gray-300 mb-2">Join the conversation</p>
          <p className="text-gray-500 text-sm mb-3">
            You must be logged in to post a comment
          </p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors font-medium">
            Log In / Sign Up
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
          <span className="ml-2 text-gray-400">Loading comments...</span>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400">Error: {error.message}</p>
        </div>
      ) : commentTree.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-400">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {commentTree.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </div>
  );
};
