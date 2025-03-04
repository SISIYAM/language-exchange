"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import axios from "axios";

const SubscriptionPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!currentUser?._id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:8080/api/subscription/status",
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        setSubscriptionDetails(response.data);
      } catch (error) {
        console.error(
          "Error fetching subscription status:",
          error?.response?.data || error.message
        );
        if (error.response?.status !== 401) {
          toast.error("Failed to fetch subscription status");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [currentUser?._id]);

  const plans = [
    {
      name: "Free Plan",
      price: "$0",
      period: "Forever",
      features: [
        "Basic language exchange",
        "Community access",
        "Basic chat features",
        "Limited partner search",
      ],
      buttonText:
        subscriptionDetails?.status === "free" ? "Current Plan" : "Not Active",
      isPopular: false,
      disabled: true,
    },
    {
      name: "Pro Plan",
      price: "$9.99",
      period: "per month",
      features: [
        "Unlimited language exchange",
        "Daily nature news & health tips",
        "Advanced partner matching",
        "Priority chat features",
        "Audio call",
        "Video call",
        "Advanced analytics",
        "Premium community features",
      ],
      buttonText:
        subscriptionDetails?.status === "premium"
          ? `Renews on ${new Date(
              subscriptionDetails.endDate
            ).toLocaleDateString()}`
          : "Upgrade Now",
      isPopular: true,
      disabled: subscriptionDetails?.status === "premium",
    },
  ];

  const handleUpgrade = () => {
    if (!currentUser) {
      toast.error("Please log in to upgrade your subscription");
      return;
    }

    // Append the user's ID to the Stripe checkout URL
    const checkoutUrl = `https://buy.stripe.com/test_9AQ6rP1Itdgv4AU7sv?client_reference_id=${currentUser._id}`;
    window.location.href = checkoutUrl;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4"
      style={{ backgroundImage: `url('/bannerbg.png')` }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Unlock premium features to enhance your language learning journey
          </p>
          {subscriptionDetails?.status === "premium" && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg inline-block">
              <p className="text-green-700">
                You are currently on the Pro Plan. Your subscription will renew
                on{" "}
                <span className="font-semibold">
                  {new Date(subscriptionDetails.endDate).toLocaleDateString()}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className={`rounded-2xl overflow-hidden shadow-lg bg-white p-8 relative ${
                plan.isPopular ? "border-2 border-blue-500" : ""
              } ${
                subscriptionDetails?.status === "premium" &&
                plan.name === "Pro Plan"
                  ? "ring-4 ring-green-400"
                  : ""
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-4 right-4">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex justify-center items-baseline mb-2">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">{plan.period}</span>
                </div>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.disabled ? undefined : handleUpgrade}
                disabled={plan.disabled}
                className={`w-full py-3 px-6 rounded-lg text-center font-semibold transition-colors duration-200 ${
                  plan.disabled
                    ? subscriptionDetails?.status === "premium" &&
                      plan.name === "Pro Plan"
                      ? "bg-green-100 text-green-800 cursor-default"
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.buttonText}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
