const HF_API_KEY = process.env.HF_API_KEY;
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions"; // Updated URL

export async function generateQuizWithHuggingFace(prompt) {
  // Dynamically import node-fetch to resolve ERR_REQUIRE_ESM
  const fetch = (await import('node-fetch')).default;

  if (!HF_API_KEY) {
    throw new Error("Hugging Face API key not configured.");
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [ // Changed to messages array
          {
            "role": "user",
            "content": prompt,
          },
        ],
        model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai", // Added model to body
        stream: false, // Added stream parameter
        max_tokens: 2000, // Keep max_tokens to prevent very long responses or timeouts
        temperature: 0.7, // Add temperature as used in together.xyz call
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Hugging Face API error (${response.status} ${response.statusText}): ${errorText}`
      );
    }

    const data = await response.json();
    // For chat completions, the generated text is in data.choices[0].message.content
    if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
      return data.choices[0].message.content;
    } else {
      throw new Error("Invalid response format from Hugging Face API.");
    }
  } catch (error) {
    console.error("Error in generateQuizWithHuggingFace:", error);
    throw error;
  }
}
