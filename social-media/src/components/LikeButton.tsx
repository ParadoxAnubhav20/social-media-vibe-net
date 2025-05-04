import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Props {
  postId: number;
}

interface Vote {
  id: number;
  post_id: number;
  user_id: string;
  vote: number;
}

const vote = async (voteValue: number, postId: number, userId: string) => {
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    // Liked -> 0, Like -> -1
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);

      if (error) throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ post_id: postId, user_id: userId, vote: voteValue });
    if (error) throw new Error(error.message);
  }
};

const fetchVotes = async (postId: number): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId);

  if (error) throw new Error(error.message);
  return data as Vote[];
};

export const LikeButton = ({ postId }: Props) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: votes,
    isLoading,
    error,
  } = useQuery<Vote[], Error>({
    queryKey: ["votes", postId],
    queryFn: () => fetchVotes(postId),
    refetchInterval: 5000,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (voteValue: number) => {
      if (!user) throw new Error("You must be logged in to vote!");
      return vote(voteValue, postId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", postId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="inline-flex items-center px-4 py-2 rounded-md bg-gray-100">
          <div className="animate-pulse text-gray-400">Loading votes...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
        Error: {error.message}
      </div>
    );
  }

  const likes = votes?.filter((v) => v.vote === 1).length || 0;
  const dislikes = votes?.filter((v) => v.vote === -1).length || 0;
  const userVote = votes?.find((v) => v.user_id === user?.id)?.vote;

  const handleVote = (voteValue: number) => {
    if (!user) {
      // Show a notification or modal to ask user to login
      alert("Please log in to vote");
      return;
    }
    mutate(voteValue);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 my-6">
      <div className="text-sm text-gray-500 font-medium">
        What did you think of this post?
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => handleVote(1)}
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
            userVote === 1
              ? "bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          aria-label="Like"
        >
          <ThumbsUp
            size={18}
            className={
              userVote === 1 ? "text-green-600 fill-green-600" : "text-gray-500"
            }
          />
          <span className="font-semibold">{likes}</span>
        </button>

        <button
          onClick={() => handleVote(-1)}
          disabled={isPending}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
            userVote === -1
              ? "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          } ${isPending ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          aria-label="Dislike"
        >
          <ThumbsDown
            size={18}
            className={
              userVote === -1 ? "text-red-600 fill-red-600" : "text-gray-500"
            }
          />
          <span className="font-semibold">{dislikes}</span>
        </button>
      </div>

      {!user && (
        <div className="text-xs text-gray-500 italic mt-1">
          Log in to vote on this post
        </div>
      )}
    </div>
  );
};
