import 'dotenv/config';
import fetch from 'node-fetch';

async function run() {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY missing in .env");
    return;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("\n=== AVAILABLE MODELS ===\n");
    data.models?.forEach((model) => {
      console.log("- " + model.name);
    });

    console.log("\n========================\n");
  } catch (err) {
    console.error("Failed to list models:", err);
  }
}

run();
