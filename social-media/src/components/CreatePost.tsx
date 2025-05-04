import { ChangeEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import { Community, fetchCommunities } from "./CommunityList";
import { AlertCircle, Image as ImageIcon, X, LogIn } from "lucide-react";

interface PostInput {
  title: string;
  content: string;
  avatar_url: string | null;
  community_id?: number | null;
}

const createPost = async (post: PostInput, imageFile: File | null) => {
  let imageUrl = null;

  if (imageFile) {
    const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, imageFile);

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicURLData } = supabase.storage
      .from("post-images")
      .getPublicUrl(filePath);

    imageUrl = publicURLData.publicUrl;
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ ...post, image_url: imageUrl });

  if (error) throw new Error(error.message);

  return data;
};

export const CreatePost = () => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { user } = useAuth();

  const { data: communities, isLoading: loadingCommunities } = useQuery<
    Community[],
    Error
  >({
    queryKey: ["communities"],
    queryFn: fetchCommunities,
    // Only fetch communities if user is logged in
    enabled: !!user,
  });

  const { mutate, isPending, isError, isSuccess, error } = useMutation({
    mutationFn: (data: { post: PostInput; imageFile: File | null }) => {
      return createPost(data.post, data.imageFile);
    },
    onSuccess: () => {
      // Reset form after successful submission
      setTitle("");
      setContent("");
      setCommunityId(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsSubmitted(false);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitted(true);

    // Form validation
    if (!title.trim() || !content.trim()) {
      return;
    }

    // Check if user is logged in before submitting
    if (!user) {
      setErrorMessage("You must be logged in to create a post");
      return;
    }

    mutate({
      post: {
        title,
        content,
        avatar_url: user?.user_metadata.avatar_url || null,
        community_id: communityId,
      },
      imageFile: selectedFile,
    });
  };

  const handleCommunityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setCommunityId(value ? Number(value) : null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
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
            You need to be signed in to create a post. Please log in or create
            an account to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800/30 rounded-lg shadow-lg">
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-300">
          Post created successfully!
        </div>
      )}

      {isError && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-400">Error creating post</p>
            {errorMessage && (
              <p className="text-sm text-red-300">{errorMessage}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block mb-2 font-medium text-gray-300"
          >
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full border ${
              isSubmitted && !title.trim()
                ? "border-red-500"
                : "border-white/10"
            } bg-gray-800/50 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
            placeholder="Enter a descriptive title"
          />
          {isSubmitted && !title.trim() && (
            <p className="mt-1 text-sm text-red-500">Title is required</p>
          )}
        </div>

        <div>
          <label
            htmlFor="community"
            className="block mb-2 font-medium text-gray-300"
          >
            Community
          </label>
          <div className="relative">
            <select
              id="community"
              onChange={handleCommunityChange}
              value={communityId || ""}
              className="w-full border border-white/10 bg-gray-800/50 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="">-- Choose a Community --</option>
              {loadingCommunities ? (
                <option disabled>Loading communities...</option>
              ) : (
                communities?.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="content"
            className="block mb-2 font-medium text-gray-300"
          >
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={`w-full border ${
              isSubmitted && !content.trim()
                ? "border-red-500"
                : "border-white/10"
            } bg-gray-800/50 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
            rows={6}
            placeholder="Write your post content here..."
          />
          {isSubmitted && !content.trim() && (
            <p className="mt-1 text-sm text-red-500">Content is required</p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-300">Image</label>

          {previewUrl ? (
            <div className="mt-2 relative">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-60 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-md cursor-pointer bg-gray-800/30 hover:bg-gray-700/30 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-1 text-sm text-gray-400">
                    <span className="font-medium">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF (MAX. 5MB)
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-4">
          <button
            type="submit"
            disabled={isPending}
            className={`${
              isPending ? "bg-purple-700" : "bg-purple-600 hover:bg-purple-700"
            } text-white px-6 py-3 rounded-md font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 flex items-center justify-center min-w-[120px]`}
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
              "Create Post"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
