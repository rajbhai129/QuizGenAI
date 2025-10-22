import fetch from "node-fetch";

const HF_API_KEY = process.env.HF_API_KEY;
const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

export async function generateQuizWithHuggingFace(prompt) {
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
        inputs: prompt,
        parameters: {
          max_new_tokens: 512,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Hugging Face API error (${response.status} ${response.statusText}): ${errorText}`
      );
    }

    const data = await response.json();
    // Assuming the output format is data[0].generated_text as per your example
    if (data && data.length > 0 && data[0].generated_text) {
      return data[0].generated_text;
    } else {
      throw new Error("Invalid response format from Hugging Face API.");
    }
  } catch (error) {
    console.error("Error in generateQuizWithHuggingFace:", error);
    throw error;
  }
}
