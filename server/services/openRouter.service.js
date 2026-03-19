import axios from "axios";

export const askAI = async (messages) => {
  if (!messages || messages.length === 0) {
    throw new Error("Messages are required");
  }
//50 req/day limit on free tier — if you hit it during testing, wait 24hrs or add OpenRouter credits.
  // retry up to 3 times — openrouter/free picks a different model each time
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "openrouter/free",  // ✅ never 404s — auto picks available free model
          messages,
          max_tokens: 3000,          // ✅ enough for full resume JSON
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;

      if (!content || content.trim() === "") {
        console.warn(`Attempt ${attempt}: empty response, retrying...`);
        continue;
      }

      // log which model was actually used (useful for debugging)
      const usedModel = response.data.model;
      console.log(`✅ Response from: ${usedModel}`);

      return content;

    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.response?.data || error.message);
      if (attempt === 3) throw new Error("Failed to get AI response after 3 attempts");
    }
  }

  throw new Error("All attempts returned empty responses");
};