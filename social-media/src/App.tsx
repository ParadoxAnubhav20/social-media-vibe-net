import { Route, Routes } from "react-router";
import { Home } from "./pages/Home";
import { Navbar } from "./pages/Navbar";
import { CreatePostPage } from "./pages/CreatePostPage";
import { PostPage } from "./pages/PostPage";
import { CreateCommunityPage } from "./pages/CreateCommunityPage";
import { CommunitiesPage } from "./pages/CommunitiesPage";
import { CommunityPage } from "./pages/CommunityPage";
import { Terms } from "./pages/Terms";
import { Guidelines } from "./pages/Guidelines";
import { Privacy } from "./pages/Privacy";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-black text-gray-100 transition-opacity duration-700 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-6 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/post/:id" element={<PostPage />} />
          <Route path="/community/create" element={<CreateCommunityPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/community/:id" element={<CommunityPage />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/guidelines" element={<Guidelines />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
