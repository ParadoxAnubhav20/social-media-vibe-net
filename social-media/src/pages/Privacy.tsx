import React from "react";

export const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-6">Last Updated: May 4, 2025</p>

      <div className="prose prose-lg">
        <p>
          This Privacy Policy explains how we collect, use, and protect your
          personal information.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          1. Information Collection
        </h2>
        <p>
          We collect information you provide directly to us, such as when you
          create an account or contact us.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          2. Use of Information
        </h2>
        <p>
          We use your information to provide and improve our services,
          communicate with you, and ensure security.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          3. Information Sharing
        </h2>
        <p>
          We do not sell your personal information to third parties. We may
          share information with service providers who help us operate our
          website.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
        <p>
          We implement measures to protect your information, but no method of
          transmission over the Internet is 100% secure.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">5. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal
          information.
        </p>
      </div>
    </div>
  );
};
