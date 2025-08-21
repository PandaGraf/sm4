import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Description required" });
  }

  try {
    const prompt = `
Masz opis: ${description}
Stwórz kreatywne posty dla: Facebook, Instagram, LinkedIn, TikTok
- Dostosuj język i styl do każdej platformy
- Dodaj popularne hashtagi
- Dodaj call to action
Zwróć wynik w formacie JSON:
{
  "facebook": "...",
  "instagram": "...",
  "linkedin": "...",
  "tiktok": "..."
}
`;

    const completion = await openai.createChatCompletion({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500
    });

    const content = completion.data.choices[0].message.content;

    let posts;
    try {
      posts = JSON.parse(content);
    } catch {
      posts = { error: content };
    }

    res.status(200).json({ posts });
  } catch (err) {
    if (err.response && err.response.status === 429) {
      return res.status(429).json({ error: "Limit 429", resetTime: err.response.headers["x-ratelimit-reset"] || 60 });
    }
    res.status(500).json({ error: err.message });
  }
}
