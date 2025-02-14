import React from 'react';
import { FaStar } from 'react-icons/fa';

const reviews = [
  {
    name: "Francesca",
    review:
      "I love this app. Speaking to people who also want to learn a language is the best thing ever! I've made great friends already and it hasn't even been 24 hours. I love this app!",
  },
  {
    name: "Luca",
    review:
      "There is always a friendly language partner ready to strike up a conversation, and the staff are professional and helpful! I would recommend Tandem to anyone trying to practice a new language!",
  },
  {
    name: "Sakiko",
    review:
      "If you're truly serious about learning a different language this is the app for you!!! You will not regret it! This app makes it safe and fun for everyone to communicate and learn! I love this app!",
  },
  {
    name: "Alfonso",
    review:
      "Lots of nice people and it's fun and easy to use. It will translate what you say and you can use the speak function to learn how to say it. It does almost everything you need and more! 6 stars!",
  },
  {
    name: "Niamh",
    review:
      "This app is seriously the best! It's so crazy to meet people from the other side of the world! It's great for improving languages because you are talking to real people. 11/10 would recommend.",
  },
  {
    name: "Mikhail",
    review:
      "I feel privileged to have met sensational people through the app. You not only learn and develop another language, you also learn about cultures, popular sayings, and get tips.",
  },
];

const Testimonials = () => {
  return (
    <div className="bg-gray-50 py-10">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold">People love Enlighten!</h2>
        <p className="text-gray-600 font-bold mt-3">Over 100,000 5-star reviews!</p>
      </div>
      <div className=" max-w-7xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 mx-auto">
        {reviews.map((review, index) => (
          <div key={index} className="p-6 rounded-lg">
            <div className="flex justify-center mb-4 space-x-2">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <FaStar key={i} className="text-[#ff9400] text-4xl" />
                ))}
            </div>
            <p className="text-gray-700 italic mb-4 opacity-80">"{review.review}"</p>
            <p className="text-center font-semibold opacity-80">{review.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
