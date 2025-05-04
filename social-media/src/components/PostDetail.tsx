import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { useState, useEffect } from "react";
import { ChevronUp, Share2, Bookmark, Eye } from "lucide-react";

interface Props {
  postId: number;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string;
  image_url?: string;
  post_avatar_url?: string;
}

const fetchPostById = async (id: number): Promise<Post> => {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Post;
};

export const PostDetail = ({ postId }: Props) => {
  const { data, error, isLoading } = useQuery<Post, Error>({
    queryKey: ["post", postId],
    queryFn: () => fetchPostById(postId),
  });

  const [isVisible, setIsVisible] = useState(false);
  const [viewCount, setViewCount] = useState(
    Math.floor(Math.random() * 1000) + 100
  );
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Simulate increasing view count
    const timer = setTimeout(() => {
      setViewCount((prev) => prev + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-xl text-gray-400 animate-pulse">
          Loading amazing content...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto bg-red-900/30 text-red-300 p-6 rounded-lg shadow-lg mt-6 border border-red-700 backdrop-blur-sm">
        <h2 className="text-lg font-bold flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          Failed to load post
        </h2>
        <p className="text-sm mt-3 opacity-90">{error.message}</p>
        <button className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 transition-colors rounded-md text-white text-sm">
          Try Again
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className={`transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      <article className="max-w-4xl mx-auto p-6 md:p-10 bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-2xl shadow-2xl space-y-8 border border-gray-700 relative">
        {/* Reading progress indicator */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 rounded-t-2xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-0 animate-progress"></div>
        </div>

        <header className="space-y-6">
          <div className="inline-block px-3 py-1 bg-purple-900/50 text-purple-300 text-xs rounded-full mb-4 border border-purple-700/50">
            Featured Post
          </div>

          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-br from-violet-400 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
            {data?.title}
          </h1>

          <div className="flex items-center justify-between text-gray-400">
            <div className="flex items-center space-x-3">
              {data?.post_avatar_url && (
                <div className="relative">
                  <img
                    src={data.post_avatar_url}
                    alt="Post creator avatar"
                    className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover ring-4 ring-purple-500/20"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm md:text-base">
                  {new Date(data!.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-gray-400">
                <Eye size={16} className="text-blue-400" />
                <span className="text-sm">{viewCount}</span>
              </div>
            </div>
          </div>
        </header>

        {data?.image_url && (
          <div className="group relative overflow-hidden rounded-xl border border-gray-700 shadow-xl bg-gray-800 transition-all duration-300 hover:shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity z-10"></div>
            <img
              src={data.image_url}
              alt={data.title}
              className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}

        <section className="text-gray-300 space-y-6">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="whitespace-pre-wrap leading-relaxed text-gray-300 text-lg">
              {data?.content}
            </div>
          </div>
        </section>

        <footer className="border-t border-gray-700 pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <LikeButton postId={postId} />

            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="group flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Share2 size={20} className="group-hover:animate-pulse" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </footer>

        <CommentSection postId={postId} />

        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg hover:shadow-purple-500/50 transition-all hover:-translate-y-1"
        >
          <ChevronUp size={20} />
        </button>
      </article>
    </div>
  );
};
