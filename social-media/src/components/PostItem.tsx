import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Post } from "./PostList";
import { Heart, MessageCircle, Eye, TrendingUp } from "lucide-react";

interface Props {
  post: Post;
  index?: number;
}

export const PostItem = ({ post, index = 0 }: Props) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [isVisible, setIsVisible] = useState(false);
  const [viewCount] = useState(Math.floor(Math.random() * 500) + 50);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Staggered animation for cards
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index]);

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // Calculate how long ago the post was created
  const getTimeAgo = () => {
    if (!post.created_at) return "";
    const now = new Date();
    const postDate = new Date(post.created_at);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    );

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Generate a random trending percentage for visual interest
  const trendingPercentage = Math.floor(Math.random() * 30) + 5;
  const isTrending = trendingPercentage > 15;

  return (
    <div
      className={`transform transition-all duration-500 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group transition-all duration-300 hover:scale-105">
        <div
          className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 blur-md opacity-0 group-hover:opacity-70 transition duration-500 ${
            isLiked ? "opacity-30" : "opacity-0"
          } pointer-events-none`}
        ></div>

        <Link to={`/post/${post.id}`} className="block relative z-10">
          <div className="w-80 h-auto bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-3xl text-white flex flex-col p-6 overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/20 relative">
            {/* Trending badge (conditionally rendered) */}
            {isTrending && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                <TrendingUp size={12} />
                <span>+{trendingPercentage}%</span>
              </div>
            )}

            {/* Header: Avatar, Username and Time */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {post.avatar_url ? (
                  <div className="relative">
                    <img
                      src={post.avatar_url}
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-500 ring-2 ring-purple-300 ring-opacity-30"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-800"></span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-800 flex items-center justify-center shadow-lg">
                    {post.username
                      ? post.username.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200">
                    {post.username || "Anonymous"}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    {getTimeAgo()}
                  </span>
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-400 gap-1">
                <Eye size={14} className="text-blue-400" />
                <span>{viewCount}</span>
              </div>
            </div>

            {/* Title with animated gradient on hover */}
            <h3 className="font-bold text-lg mb-3 tracking-tight line-clamp-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 group-hover:from-purple-300 group-hover:to-pink-200 transition-all duration-300">
              {post.title}
            </h3>

            {/* Image Banner with hover effect */}
            <div className="overflow-hidden rounded-2xl mb-4 h-40 bg-gray-800 group/image">
              {post.image_url ? (
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-0 group-hover/image:opacity-60 transition-opacity z-10"></div>
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-indigo-800 flex items-center justify-center overflow-hidden">
                  <div className="relative z-10 text-4xl opacity-30 group-hover:scale-125 transition-transform duration-500">
                    ✨
                  </div>
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-3xl"></div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Preview */}
            {post.content && (
              <p className="text-sm text-gray-300 mb-4 line-clamp-2 italic">
                {post.content}
              </p>
            )}

            {/* Tags with hover effect */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-purple-900/40 rounded-full text-purple-300 border border-purple-800/30 hover:bg-purple-800/60 transition-colors duration-300 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-800/50 rounded-full text-gray-400 border border-gray-700/50 hover:bg-gray-700/70 transition-colors duration-300 cursor-pointer">
                    +{post.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Footer: Likes and Comments */}
            <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-700/50 text-sm font-medium">
              <button
                onClick={handleLikeClick}
                className={`flex items-center space-x-2 transition duration-300 ${
                  isLiked ? "text-red-400" : "text-gray-300 hover:text-red-400"
                }`}
              >
                <Heart
                  size={18}
                  className={`transition-all duration-300 ${
                    isLiked ? "fill-red-400" : ""
                  } ${isHovered ? "animate-pulse" : ""}`}
                />
                <span>{likeCount}</span>
              </button>

              <div className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition duration-300">
                <MessageCircle size={18} />
                <span>{post.comment_count || 0}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PostItem;
