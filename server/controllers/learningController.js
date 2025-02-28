const translateText = async (text, sourceLanguage, targetLanguage) => {
  const apiKey = "bbbf45a1c0c7f8d403ff"; // Your API Key
  const encodedText = encodeURIComponent(text);
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${sourceLanguage}|${targetLanguage}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.responseData.translatedText;
  } catch (error) {
    console.error("Error translating text:", error);
    return text;
  }
};

const tranlate = async (req, res) => {
  const { text, sourceLanguage, targetLanguage } = req.body;
  try {
    const translatedText = await translateText(
      text,
      sourceLanguage,
      targetLanguage
    );
    res.json({ translatedText });
  } catch (error) {
    console.error("Error translating text:", error);
    res.status(500).json({ error: "Failed to translate text" });
  }
};

module.exports = {
  tranlate,
};
