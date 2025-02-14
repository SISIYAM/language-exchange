import HomePage from "@/components/home/Home";
// import getNewsByCategory from "@/utils/getNewsByCategory";

export default async function Home() {
  // Fetch the news data server-side
  // const newsData = await getNewsByCategory("technology");
  // console.log("Fetched News Data:", newsData);

  return (
    <>
      <HomePage />
    </>
  );
}
