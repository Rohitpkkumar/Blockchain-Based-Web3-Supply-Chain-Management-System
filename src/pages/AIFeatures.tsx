import React from "react";

const AIFeatures = () => {
  const features = [
    {
      title: "Delay Prediction",
      description:
        "Uses OpenWeather and Google Traffic APIs to predict shipment delays due to weather or congestion.",
      icon: "⏱️",
    },
    {
      title: "Carbon Emission Calculator",
      description:
        "Estimates CO₂ emissions based on distance, shipment type, and vehicle efficiency.",
      icon: "🌱",
    },
    {
      title: "Fraud Detection",
      description:
        "Flags duplicate addresses, abnormal transactions, and mismatched geolocations.",
      icon: "🕵️",
    },
    {
      title: "Demand Forecasting",
      description:
        "Predicts product trends to optimize inventory and pricing strategies.",
      icon: "📈",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">AI Features</h1>
        <p className="text-lg text-gray-600 mb-8">
          Leveraging Artificial Intelligence to optimize supply chain efficiency.
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

        {/* Example AI Alert */}
        <div className="mt-12 bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            🚨 AI Alert: Potential Delay Detected
          </h3>
          <p className="text-gray-600">
            Order <span className="font-bold">#47</span> may be delayed due to{" "}
            <span className="text-yellow-600">heavy traffic in Mumbai</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIFeatures;