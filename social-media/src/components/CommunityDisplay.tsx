import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { PostItem } from "./PostItem";
import { Loader2 } from "lucide-react";

interface Props {
  communityId: number;
}

interface PostWithCommunity extends Post {
  communities: {
    name: string;
  };
}

// Extend the PostItem component props to include the onUpdate handler
declare module "./PostItem" {
  interface Props {
    post: Post;
    index?: number;
    onUpdate?: (updates: Partial<Post>) => void;
  }
}

export const fetchCommunityPost = async (
  communityId: number
): Promise<PostWithCommunity[]> => {
  // Option 1: Use the same RPC function as PostList but filter by community_id
  const { data, error } = await supabase
    .rpc("get_posts_with_counts")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Get community name with a separate query since RPC might not include it
  const { data: communityData, error: communityError } = await supabase
    .from("communities")
    .select("name")
    .eq("id", communityId)
    .single();

  if (communityError) throw new Error(communityError.message);

  // Add community info to each post
  return (data as Post[]).map((post) => ({
    ...post,
    communities: {
      name: communityData.name,
    },
  }));
};

export const CommunityDisplay = ({ communityId }: Props) => {
  const queryClient = useQueryClient();

  const { data, error, isLoading } = useQuery<PostWithCommunity[], Error>({
    queryKey: ["communityPost", communityId],
    queryFn: () => fetchCommunityPost(communityId),
  });

  // Create a function to handle post updates that can be passed to PostItem
  const handlePostUpdate = (postId: number, updates: Partial<Post>) => {
    // Update the cache directly for immediate UI feedback
    queryClient.setQueryData(
      ["communityPost", communityId],
      (oldData: PostWithCommunity[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((post) =>
          post.id === postId ? { ...post, ...updates } : post
        );
      }
    );

    // Optional: You can also update the database here
    // supabase.from("posts").update(updates).eq("id", postId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        <span className="ml-3 text-gray-400">Loading community posts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg flex items-center justify-center">
        <span className="font-medium">Error: {error.message}</span>
      </div>
    );
  }

  const communityName =
    data && data.length > 0 ? data[0].communities.name : "Community";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        {communityName} Posts
      </h2>

      {data && data.length > 0 ? (
        <div className="flex flex-wrap gap-6 justify-center">
          {data.map((post, index) => (
            <PostItem
              key={post.id}
              post={post}
              index={index}
              onUpdate={(updates) => handlePostUpdate(post.id, updates)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center max-w-md mx-auto">
          <p className="text-gray-400 mb-2">No posts in this community yet.</p>
          <p className="text-gray-500 text-sm">
            Be the first to create a post!
          </p>
        </div>
      )}
    </div>
  );
};
