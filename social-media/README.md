## 🚀 Introduction

A fully featured Social Media Website Vibe.Net using modern web technologies. This project features real-time interactions, GitHub authentication, and stunning glassy UI elements with glowing gradient effects. Perfect for developers who want to dive into building dynamic, interactive, and beautifully designed web applications.

## ⚙️ Tech Stack

- **React** for building the user interface
- **Vite** for fast development and build processes
- **TypeScript** for type safety and modern JavaScript features
- **Supabase** for backend services including authentication, real-time data, and storage
- **Tailwind CSS** for rapid and responsive styling

## ⚡️ Features

- **User Authentication via GitHub:** Securely sign in with GitHub and display user avatars and usernames across the site.
- **Community Creation:** Users can create new communities based on shared interests.
- **Post Creation with Image Uploads:** Create posts with rich content and optional image uploads, complete with the creator's profile picture.
- **Dynamic Voting System:** Thumbs up and thumbs down buttons with subtle white glow effects to indicate your vote.
- **Robust Commenting System:** Engage in threaded discussions with:
  - Create, read, update, and delete comments
  - Reply to comments in nested threads
  - Each comment shows the commenter's username and timestamp
- **Community & Category Support:** Build a Reddit-like experience where posts are organized by communities, with posts displayed in a responsive grid.
- **Modern Glassmorphism & Glow Effects:** Enjoy a visually striking interface featuring glassy, transparent cards with glowing gradient borders on hover.
- **Real-Time Data Updates:** All interactions (posting, voting, commenting) update in real time using Supabase and React Query.

## 👌 Quick Start

### Prerequisites

- Git
- Node.js
- npm

### Cloning the Repository

Run the following commands in your terminal:

```bash
git clone https://github.com/machadop1407/social-media-vite-supabase.git
cd social-media-tutorial
```

### Installation

Install the dependencies:

```bash
npm install
```

### Environment Variables

Create a file named `.env` in the project root and add your Supabase credentials and other configuration values:

```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Running the Project

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.
