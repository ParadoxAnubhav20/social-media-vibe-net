import { Link } from "react-router";
import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 border-t border-gray-800 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-3">
            <Link
              to="/"
              className="flex items-center font-mono text-xl font-bold text-white"
            >
              VibeNet<span className="text-purple-500">.zone</span>
            </Link>
            <p className="text-sm text-gray-400">
              Connect, share, and engage with communities that matter to you.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://github.com/ParadoxAnubhav20"
                target="_blank"
                className="hover:text-purple-500 transition-colors"
              >
                <Github size={18} />
              </a>

              <a
                href="https://www.linkedin.com/in/anubhav-mondal-222575236/"
                className="hover:text-purple-500 transition-colors"
                target="_blank"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Navigation</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-purple-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/communities"
                  className="hover:text-purple-500 transition-colors"
                >
                  Communities
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className="hover:text-purple-500 transition-colors"
                >
                  Create Post
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-white">Legal</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-purple-500 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-purple-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/guidelines"
                  className="hover:text-purple-500 transition-colors"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} VibeNet.zone. All rights reserved.
            Made by Anubhav.
          </p>
        </div>
      </div>
    </footer>
  );
};
