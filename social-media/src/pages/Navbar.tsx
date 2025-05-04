import { useState, useEffect, ReactNode } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  Menu,
  X,
  Home,
  PenSquare,
  Users,
  FolderPlus,
  LogOut,
  Github,
} from "lucide-react";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { signInWithGitHub, signOut, user } = useAuth();

  const displayName = user?.user_metadata.user_name || user?.email;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? "bg-black/90 backdrop-blur-lg shadow-lg"
          : "bg-black/50 backdrop-blur-sm"
      } border-b border-purple-500/20`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center font-mono text-xl font-bold text-white"
          >
            VibeNet<span className="text-purple-500">.zone</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={<Home size={16} />} label="Home" />
            <NavLink
              to="/create"
              icon={<PenSquare size={16} />}
              label="Create Post"
            />
            <NavLink
              to="/communities"
              icon={<Users size={16} />}
              label="Communities"
            />
            <NavLink
              to="/community/create"
              icon={<FolderPlus size={16} />}
              label="Create Community"
            />
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-2 bg-gray-800/60 rounded-full pr-2 pl-1 py-1 border border-white/10">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                    {displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-gray-300 text-sm">{displayName}</span>
                <button
                  onClick={signOut}
                  className="ml-2 bg-gray-700/80 hover:bg-red-500/80 text-white p-1.5 rounded-full transition-colors group"
                  title="Sign Out"
                >
                  <LogOut
                    size={16}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGitHub}
                className="flex items-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 px-4 py-2 rounded-full text-sm font-medium text-white transition-all shadow-md hover:shadow-lg"
              >
                <Github size={16} className="mr-2" />
                Sign in with GitHub
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-gray-300 hover:text-white focus:outline-none p-1 rounded-md"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-lg border-t border-purple-500/20 animate-slideDown">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <MobileNavLink
              to="/"
              icon={<Home size={18} />}
              label="Home"
              onClick={() => setMenuOpen(false)}
            />
            <MobileNavLink
              to="/create"
              icon={<PenSquare size={18} />}
              label="Create Post"
              onClick={() => setMenuOpen(false)}
            />
            <MobileNavLink
              to="/communities"
              icon={<Users size={18} />}
              label="Communities"
              onClick={() => setMenuOpen(false)}
            />
            <MobileNavLink
              to="/community/create"
              icon={<FolderPlus size={18} />}
              label="Create Community"
              onClick={() => setMenuOpen(false)}
            />

            {/* Mobile Auth */}
            <div className="pt-4 border-t border-white/10">
              {user ? (
                <div className="px-3 py-2">
                  <div className="flex items-center space-x-3 mb-3">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="User Avatar"
                        className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                        {displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-gray-200 font-medium">
                      {displayName}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-4 py-2 rounded-lg text-white font-medium shadow-md"
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2">
                  <button
                    onClick={() => {
                      signInWithGitHub();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 px-4 py-3 rounded-lg text-white font-medium shadow-md"
                  >
                    <Github size={18} className="mr-2" />
                    Sign in with GitHub
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

// Define interfaces for the NavLink components
interface NavLinkProps {
  to: string;
  icon: ReactNode;
  label: string;
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

// Desktop Navigation Link component
const NavLink = ({ to, icon, label }: NavLinkProps) => (
  <Link
    to={to}
    className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/20 transition-colors"
  >
    <span className="mr-1.5">{icon}</span>
    {label}
  </Link>
);

// Mobile Navigation Link component
const MobileNavLink = ({ to, icon, label, onClick }: MobileNavLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center px-3 py-3 rounded-lg text-gray-300 hover:text-white bg-gray-800/40 hover:bg-purple-500/20 transition-colors"
  >
    <span className="mr-3">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);
