import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const result = await openai.createImage({
      prompt,
      n: 1,
      size: "512x512"
    });

    const imageUrl = result.data.data[0].url;
    res.status(200).json({ image: imageUrl });
  } catch (err) {
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: "Limit 429", resetTime: err.response.headers["x-ratelimit-reset"] || 60 });
    }
    res.status(500).json({ error: err.message });
  }
}
