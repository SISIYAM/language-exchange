import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      title: "1. Join the community",
      description:
        "Download the app and register – it’s free! We review each application individually to ensure the Enlighten’s community remains a safe and welcoming place for our users.",
      imgSrc: "/phone2.png",
    },
    {
      title: "2. Find your partner",
      description:
        "Immediately after registration, we will help you to find suitable interlocutors, partners. Use filters by language, location, interests and other parameters.",
      imgSrc: "/phone3.png",
    },
    {
      title: "3. Start communicating!",
      description:
        "Use message correction and translation functions right in the application.",
      imgSrc: "/phone4.png",
    },
  ];

  return (
    <div className="flex flex-col items-center py-8 px-4 bg-[url('/bg.webp')] bg-cover bg-center w-full mt-28 pt-28">
      <h2 className="text-3xl font-semibold text-center mb-20">
        Как работает Enlighten?
      </h2>

      {steps.map((step, index) => (
        <div
          key={index}
          className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center justify-between w-full max-w-4xl mb-16`}
        >
          {/* Phone Image */}
          <div className="w-full md:w-1/2 flex justify-center">
            <img src={step.imgSrc} alt={`Step ${index + 1}`} className="max-w-xs" />
          </div>

          {/* Text Content */}
          <div className="mt-4 md:mt-0 md:ml-8 w-full md:w-1/2 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
            <p className="text-lg">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HowItWorks;
