const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const flashcardController = require("../controllers/flashcardController");

// Flashcards
router.post("/flashcards", authMiddleware, flashcardController.addFlashcard);
router.get("/flashcards", authMiddleware, flashcardController.getFlashcards);
router.delete(
  "/flashcards/:flashcardId",
  authMiddleware,
  flashcardController.deleteFlashcard
);

module.exports = router;
