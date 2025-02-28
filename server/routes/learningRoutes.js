const express = require("express");
const router = express.Router();
const multer = require("multer");
const OpenAI = require("openai");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const { tranlate } = require("../controllers/learningController");

// Configure multer for handling audio files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to convert Buffer to File object for OpenAI
async function bufferToFile(buffer) {
  const tempPath = path.join(__dirname, "..", "temp", `${Date.now()}.wav`);
  const tempDir = path.dirname(tempPath);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

// Error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Speech recognition endpoint
router.post(
  "/speech-to-text",
  upload.single("audio"),
  asyncHandler(async (req, res) => {
    let tempFilePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const audioBuffer = req.file.buffer;
      const language = req.body.language || "en";

      tempFilePath = await bufferToFile(audioBuffer);

      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: language,
      });

      if (tempFilePath) {
        fs.unlink(tempFilePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }

      res.json({ text: response.text });
    } catch (error) {
      if (tempFilePath) {
        fs.unlink(tempFilePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
      throw error;
    }
  })
);

// Check pronunciation endpoint
router.post(
  "/check-pronunciation",
  upload.single("audio"),
  asyncHandler(async (req, res) => {
    let tempFilePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const audioBuffer = req.file.buffer;
      const expectedText = req.body.text;

      if (!expectedText) {
        return res.status(400).json({ error: "Expected text is required" });
      }

      tempFilePath = await bufferToFile(audioBuffer);

      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
      });

      if (tempFilePath) {
        fs.unlink(tempFilePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }

      const actualText = response.text.toLowerCase();
      const expectedTextLower = expectedText.toLowerCase();
      const similarity = calculateSimilarity(actualText, expectedTextLower);

      let feedback = "";
      if (similarity > 0.9) {
        feedback = "Excellent pronunciation! Keep it up!";
      } else if (similarity > 0.7) {
        feedback = "Good pronunciation. Some minor improvements needed.";
      } else {
        feedback = "Try again. Focus on pronouncing each word clearly.";
      }

      res.json({
        similarity,
        feedback,
        actualText,
        expectedText: expectedTextLower,
      });
    } catch (error) {
      if (tempFilePath) {
        fs.unlink(tempFilePath, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      }
      throw error;
    }
  })
);

// Chat endpoint for conversation practice
router.post(
  "/chat",
  asyncHandler(async (req, res) => {
    const { message, language, topic } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful language tutor teaching ${language}. Focus on ${topic} vocabulary and expressions. Correct any language mistakes politely.`,
        },
        { role: "user", content: message },
      ],
    });

    res.json({ response: response.choices[0].message.content });
  })
);

// Grammar check endpoint
router.post("/check-grammar", async (req, res) => {
  const { text, language } = req.body;

  if (!text || !language) {
    return res.status(400).json({ error: "Text and language are required" });
  }

  try {
    // 🌍 LanguageTool API Request
    const response = await axios.post(
      "https://api.languagetool.org/v2/check",
      {
        text: text,
        language: language,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error checking grammar:", error.message);
    res.status(500).json({ error: "Grammar check failed" });
  }
});

// Helper function to calculate text similarity
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) {
    return 1.0;
  }

  const costs = new Array();
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (longer.charAt(i - 1) !== shorter.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[shorter.length] = lastValue;
    }
  }

  return (longer.length - costs[shorter.length]) / parseFloat(longer.length);
}

router.post("/translate", tranlate);

module.exports = router;
