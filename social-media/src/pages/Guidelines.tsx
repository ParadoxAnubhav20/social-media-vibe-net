// Guidelines.jsx
import React from "react";

export const Guidelines = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Community Guidelines</h1>
      <p className="text-gray-500 mb-6">Last Updated: May 4, 2025</p>

      <div className="prose prose-lg">
        <p>
          Our community guidelines ensure that our platform remains respectful
          and safe for all users.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">1. Be Respectful</h2>
        <p>
          Treat others with kindness and respect. Harassment, hate speech, and
          discrimination are not tolerated.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          2. Post Appropriate Content
        </h2>
        <p>
          Do not post content that is illegal, harmful, threatening, abusive, or
          invasive of another's privacy.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          3. Protect Intellectual Property
        </h2>
        <p>Respect copyright and other intellectual property rights.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">4. Keep it Safe</h2>
        <p>Do not share personal information of yourself or others publicly.</p>

        <h2 className="text-xl font-semibold mt-6 mb-3">
          5. Report Violations
        </h2>
        <p>
          If you see content that violates these guidelines, please report it to
          us.
        </p>
      </div>
    </div>
  );
};
