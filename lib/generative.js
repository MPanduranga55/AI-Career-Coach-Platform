// import { GoogleGenerativeAI } from "@google/generative-ai";

// const apiKey = process.env.GEMINI_API_KEY;

// async function tryModel(genAI, modelName, prompt, options = {}) {
//   const model = genAI.getGenerativeModel({ model: modelName });
//   return await model.generateContent(prompt, options);
// }

// export async function generateRaw(prompt, options = {}) {
//   const genAI = new GoogleGenerativeAI(apiKey);
//   const preferred = process.env.GENERATIVE_MODEL || "models/text-bison-001";

//   try {
//     return await tryModel(genAI, preferred, prompt, options);
//   } catch (err) {
//     // Try listing models and pick a candidate if available
//     try {
//       if (typeof genAI.listModels === "function") {
//         const list = await genAI.listModels();
//         const models = list?.models || [];

//         const candidates = models
//           .map((m) => m.name)
//           .filter(Boolean)
//           .filter((n) => /gemini|bison|chat/i.test(n));

//         for (const name of candidates) {
//           try {
//             return await tryModel(genAI, name, prompt, options);
//           } catch (e) {
//             // try next
//           }
//         }
//       }
//     } catch (e) {
//       // ignore
//     }

//     throw err;
//   }
// }

// export async function generateText(prompt, options = {}) {
//   const res = await generateRaw(prompt, options);

//   try {
//     if (typeof res?.response?.text === "function") return res.response.text();
//     if (res?.response?.text) return res.response.text;

//     const cand = res?.response?.candidates?.[0];
//     const text = cand?.content?.parts?.[0]?.text;
//     if (text) return text;

//     if (typeof res === "string") return res;
//     return JSON.stringify(res);
//   } catch (e) {
//     return JSON.stringify(res);
//   }
// }
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

// FIXED MODELS
const DEFAULT_MODEL = process.env.GENERATIVE_MODEL || "gemini-2.5-flash";

async function tryModel(genAI, modelName, prompt, options = {}) {
  const model = genAI.getGenerativeModel({ model: modelName });

  // Gemini v1 format
  return await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    ...options,
  });
}

export async function generateRaw(prompt, options = {}) {
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Primary attempt
    return await tryModel(genAI, DEFAULT_MODEL, prompt, options);
  } catch (err) {
    console.error("Primary model failed:", err);

    // Secondary attempt: auto-select Gemini models
    try {
      const list = await genAI.listModels();
      const models = list?.models || [];

      const candidates = models
        .map((m) => m.name)
        .filter((n) => n && n.includes("gemini"));

      for (const name of candidates) {
        try {
          return await tryModel(genAI, name, prompt, options);
        } catch (e) {}
      }
    } catch (e) {}

    throw err;
  }
}

export async function generateText(prompt, options = {}) {
  const res = await generateRaw(prompt, options);

  try {
    // Gemini v1 structure
    if (typeof res?.response?.text === "function") return res.response.text();

    const cand = res?.response?.candidates?.[0];
    const text = cand?.content?.parts?.[0]?.text;

    if (text) return text;

    return JSON.stringify(res);
  } catch (e) {
    return JSON.stringify(res);
  }
}
