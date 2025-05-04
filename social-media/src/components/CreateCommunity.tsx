import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { supabase } from "../supabase-client";
import { AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface CommunityInput {
  name: string;
  description: string;
}

const createCommunity = async (community: CommunityInput) => {
  const { error, data } = await supabase.from("communities").insert(community);

  if (error) throw new Error(error.message);
  return data;
};

export const CreateCommunity = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      // Short delay before redirecting to see success message
      setTimeout(() => {
        navigate("/communities");
      }, 1500);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Form validation
    if (!name.trim()) {
      return;
    }

    // Check if user is logged in before submitting
    if (!user) {
      setErrorMessage("You must be logged in to create a community");
      return;
    }

    mutate({ name, description });
  };

  // If user is not logged in, show a login prompt instead of the form
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-800/30 rounded-lg shadow-lg">
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
          <LogIn className="h-16 w-16 text-purple-500 mb-2" />
          <h2 className="text-2xl font-bold text-white">
            Authentication Required
          </h2>
          <p className="text-gray-300 max-w-md">
            You need to be signed in to create a community. Please log in or
            create an account to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800/30 rounded-lg shadow-lg">
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-300">
          Community created successfully! Redirecting...
        </div>
      )}

      {isError && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-400">Error creating community</p>
            {errorMessage && (
              <p className="text-sm text-red-300">{errorMessage}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block mb-2 font-medium text-gray-300"
          >
            Community Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full border ${
              isSubmitted && !name.trim() ? "border-red-500" : "border-white/10"
            } bg-gray-800/50 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
            placeholder="Enter a community name"
          />
          {isSubmitted && !name.trim() && (
            <p className="mt-1 text-sm text-red-500">
              Community name is required
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block mb-2 font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-white/10 bg-gray-800/50 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={6}
            placeholder="Describe what your community is about..."
          />
        </div>

        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={isPending}
            className={`${
              isPending ? "bg-purple-700" : "bg-purple-600 hover:bg-purple-700"
            } text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center min-w-[160px]`}
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Community"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
