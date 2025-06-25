import React from "react";

const BlockchainFeatures = () => {
  const features = [
    {
      title: "Smart Contracts",
      description:
        "Automate supplier verification, payments, and order tracking with Solidity.",
      icon: "📜",
    },
    {
      title: "Wallet Integration",
      description:
        "Securely connect with MetaMask for identity and crypto payments.",
      icon: "🔐",
    },
    {
      title: "Proof of Delivery",
      description:
        "GPS-tracked shipments with on-chain delivery confirmation.",
      icon: "📍",
    },
    {
      title: "Immutable Records",
      description:
        "Tamper-proof order history stored on the blockchain.",
      icon: "🔗",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Blockchain Features
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Decentralized transparency and security for your supply chain.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Example Contract Interaction */}
        <div className="mt-12 bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            🔗 Live Blockchain Stats
          </h3>
          <p className="text-gray-600">
            <span className="font-bold">12,543 orders</span> processed on-chain.{" "}
            <span className="text-indigo-600">View Etherscan</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockchainFeatures;