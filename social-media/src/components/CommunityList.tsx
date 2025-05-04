import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { Link } from "react-router";
import { Search, Users, Clock, ArrowUpRight, Loader2 } from "lucide-react";

export interface Community {
  id: number;
  name: string;
  description: string;
  created_at: string;
  member_count?: number;
}

export const fetchCommunities = async (): Promise<Community[]> => {
  // Simulate member count
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data as Community[]).map((community) => ({
    ...community,
    member_count: Math.floor(Math.random() * 300) + 5,
  }));
};

interface CommunityCardProps {
  community: Community;
}

const CommunityCard = ({ community }: CommunityCardProps) => {
  const formattedDate = new Date(community.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
      <div className="flex justify-between items-start">
        <Link
          to={`/community/${community.id}`}
          className="text-xl font-bold text-purple-400 hover:text-purple-300 flex items-center group"
        >
          {community.name}
          <ArrowUpRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <div className="flex items-center text-gray-400">
          <Users className="h-4 w-4 mr-1" />
          <span className="text-sm">{community.member_count}</span>
        </div>
      </div>
      <p className="text-gray-300 mt-3 line-clamp-2">{community.description}</p>
      <div className="flex items-center mt-4 text-gray-500 text-xs">
        <Clock className="h-3 w-3 mr-1" />
        <span>Created {formattedDate}</span>
      </div>
    </div>
  );
};

export const CommunityList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
  });

  const filteredCommunities = data?.filter(
    (community) =>
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Communities</h1>
        <p className="text-gray-400">
          Join or explore communities that interest you
        </p>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search communities..."
          className="bg-gray-800 w-full pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none text-gray-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          <span className="ml-3 text-gray-400">Loading communities...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg flex items-center justify-center">
          <span className="font-medium">
            Error loading communities: {error.message}
          </span>
        </div>
      )}

      {!isLoading && !error && filteredCommunities?.length === 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-400">
            No communities found matching "{searchQuery}"
          </p>
        </div>
      )}

      {!isLoading && !error && filteredCommunities && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommunities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityList;
