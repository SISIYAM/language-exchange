const nodemailer = require("nodemailer");
const User = require("../models/User");
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const API_NINJA_KEY = process.env.API_NINJA_KEY;

// Exercise activities for API Ninjas
const EXERCISE_ACTIVITIES = [
  "walking",
  "jogging",
  "running",
  "swimming",
  "cycling",
  "skiing",
  "hiking",
  "yoga",
  "dancing",
  "basketball",
  "tennis",
  "aerobics",
  "weight training",
  "pilates",
  "rock climbing",
  "martial arts",
];

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Function to fetch health data
async function fetchHealthData() {
  try {
    // Randomly select activity
    const randomActivity =
      EXERCISE_ACTIVITIES[
        Math.floor(Math.random() * EXERCISE_ACTIVITIES.length)
      ];

    // Fetch exercise data from API Ninjas
    const exerciseResponse = await axios.get(
      `https://api.api-ninjas.com/v1/caloriesburned?activity=${randomActivity}`,
      {
        headers: {
          "X-Api-Key": API_NINJA_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const exerciseData = exerciseResponse.data[0] || {};

    return {
      exercise: {
        name: exerciseData.name || randomActivity,
        duration: 30, // Default duration in minutes
        caloriesBurned: Math.round(exerciseData.calories_per_hour / 2), // Calories for 30 minutes
        intensity: exerciseData.intensity || "moderate",
        totalCaloriesPerHour: Math.round(exerciseData.calories_per_hour),
      },
    };
  } catch (error) {
    console.error("Error fetching health data:", error);
    return null;
  }
}

// Function to fetch news and health data from the APIs
async function fetchContent() {
  try {
    const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`;
    const guardianApiUrl = `https://content.guardianapis.com/search?api-key=${process.env.NEXT_PUBLIC_GUARDIAN_API_KEY}&show-fields=all`;

    const [newsResponse, guardianResponse, healthData] = await Promise.all([
      axios.get(newsApiUrl),
      axios.get(guardianApiUrl),
      fetchHealthData(),
    ]);

    // Combine and shuffle articles
    const allArticles = [
      ...newsResponse.data.articles,
      ...guardianResponse.data.response.results,
    ];

    // Get random article
    const randomArticle =
      allArticles[Math.floor(Math.random() * allArticles.length)];

    return {
      article: {
        title: randomArticle.title || randomArticle.webTitle,
        description:
          randomArticle.description ||
          randomArticle.fields?.bodyText?.substring(0, 200) ||
          "",
        url: randomArticle.url || randomArticle.webUrl,
        image: randomArticle.urlToImage || randomArticle.fields?.thumbnail,
      },
      healthData,
    };
  } catch (error) {
    console.error("Error fetching content:", error);
    return null;
  }
}

// Function to send email to a single user
async function sendEmailToUser(user, content) {
  try {
    // Generate the exercise HTML
    const exerciseHtml = content.healthData?.exercise
      ? `
      <div style="background-color: #f0f8ff; border-radius: 10px; padding: 15px; margin: 10px 0;">
        <h3 style="color: #2c3e50; margin: 0 0 10px 0; text-transform: capitalize;">${content.healthData.exercise.name}</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="background-color: #fff; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="color: #074C77; margin: 0; font-size: 14px;">Burns ${content.healthData.exercise.caloriesBurned} calories in 30 mins</p>
          </div>
          <div style="background-color: #fff; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="color: #074C77; margin: 0; font-size: 14px;">${content.healthData.exercise.totalCaloriesPerHour} calories per hour</p>
          </div>
          <div style="background-color: #fff; padding: 10px; border-radius: 8px; text-align: center;">
            <p style="color: #074C77; margin: 0; font-size: 14px;">Intensity: ${content.healthData.exercise.intensity}</p>
          </div>
        </div>
        <p style="color: #666; margin: 10px 0 0 0; font-size: 14px; text-align: center;">Recommended duration: ${content.healthData.exercise.duration} minutes</p>
      </div>
    `
      : '<p style="color: #666;">No exercise data available</p>';

    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Daily Update from Enlighten</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #074C77, #2D9CDB); padding: 20px; border-radius: 15px 15px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">Daily Update from Enlighten</h1>
              <p style="color: #E0E0E0; margin: 5px 0 0 0;">${new Date().toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}</p>
            </div>

            <!-- News Section -->
            <div style="background: white; padding: 20px; border-radius: 0 0 15px 15px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #074C77; margin-top: 0; border-bottom: 2px solid #E0E0E0; padding-bottom: 10px;">Today's Featured News</h2>
              ${
                content.article.image
                  ? `<img src="${content.article.image}" alt="News Image" style="width: 100%; height: auto; border-radius: 10px; margin-bottom: 15px;">`
                  : ""
              }
              <h3 style="color: #2C3E50; margin: 0 0 10px 0;">${
                content.article.title
              }</h3>
              <p style="color: #666; margin: 0 0 15px 0;">${
                content.article.description
              }</p>
              <a href="${
                content.article.url
              }" style="display: inline-block; background-color: #074C77; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Read Full Article</a>
            </div>

            <!-- Exercise Section -->
            <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #074C77; margin-top: 0; border-bottom: 2px solid #E0E0E0; padding-bottom: 10px;">Exercise Guide</h2>
              <p style="color: #666; font-style: italic; margin-bottom: 15px;">Today's Exercise: ${
                content.healthData.exercise.name
              }</p>
              ${exerciseHtml}
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>This email was sent by Enlighten Language Exchange</p>
              <p>© ${new Date().getFullYear()} Enlighten. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Enlighten" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `Your Daily Exercise & News Update: ${content.healthData.exercise.name}`,
      html: emailContent,
    });

    console.log(`Email sent successfully to ${user.email}`);
  } catch (error) {
    console.error(`Error sending email to ${user.email}:`, error);
  }
}

// Main function to send emails to all users
async function sendEmailsToAllUsers() {
  try {
    // Fetch all users
    const users = await User.find({}, "email");

    if (users.length === 0) {
      console.log("No users found in the database");
      return;
    }

    // Fetch content
    const content = await fetchContent();
    if (!content) {
      console.log("Failed to fetch content");
      return;
    }

    // Send emails to users
    for (let i = 0; i < users.length; i++) {
      await sendEmailToUser(users[i], content);
    }
  } catch (error) {
    console.error("Error in sendEmailsToAllUsers:", error);
  }
}

// Schedule daily emails
function scheduleEmails() {
  // Initial run
  sendEmailsToAllUsers();

  // Schedule to run every 24 hours
  setInterval(sendEmailsToAllUsers, 24 * 60 * 60 * 1000);
}

module.exports = {
  scheduleEmails,
};
