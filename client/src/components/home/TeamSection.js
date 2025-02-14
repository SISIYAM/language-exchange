"use client"
import Image from 'next/image';

const people = [
  {
    name: 'Irma',
    nativeLanguage: 'German',
    learningLanguage: 'English',
    imageSrc: 'https://res.cloudinary.com/dh20zdtys/image/upload/v1723734938/jane_xtm2nz.jpg', // Replace with actual image path
},
{
    name: 'Jane',
    nativeLanguage: 'English',
    learningLanguage: 'Spanish',
    imageSrc: 'https://res.cloudinary.com/dh20zdtys/image/upload/v1723734935/irma_ycsya6.jpg', // Replace with actual image path
  },
];

const TeamSection = () => {
  return (
    <div className=" mt-20 flex flex-col items-center ">
      <div className="text-center">
        <h2 className="text-4xl font-medium text-[#074C77] ">What is Enlighten?</h2>
        <p className="mt-6 text-lg text-[#074C77] w-1/2 mx-auto">
          The language learning app where people teach each other languages while kindling a shared commitment to safeguarding our environment.
        </p>
        <p className="mt-2 text-lg font-medium font-[#407023]">
          Join us as we learn from each other and unite in our mission to protect our planet!
        </p>
      </div>

      <div className="mt-10 flex w-full justify-center space-x-10 mx-auto">
        {people.map((person, index) => (
          <div key={index} className="relative">
              <Image
                src={person.imageSrc}
                alt={person.name}
                width={500}
                height={0}
                layout="responsive"
                className="object-cover max-h-[500px] w-full"
              />
            <div className=" flex items-end bg-black max-w-[350px] mx-auto bg-opacity-30 justify-start relative -top-36 p-4 rounded-lg">
              <p className="text-white text-2xl">
                {person.name} – native speaker of {person.nativeLanguage}. Learns {person.learningLanguage}.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
