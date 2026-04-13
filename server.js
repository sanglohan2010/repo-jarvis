const express = require("express");
const axios = require("axios");
const fs = require("fs");

const app = express();
app.use(express.json());

const MEMORY_FILE = "memory.json";
const OPENAI_API_KEY = "TA_CLE_API";

// --------------------
// 🧠 MÉMOIRE
// --------------------
function loadMemory() {
    try {
        return JSON.parse(fs.readFileSync(MEMORY_FILE));
    } catch (e) {
        return { facts: [], profile: {} };
    }
}

function saveMemory(memory) {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2));
}

// --------------------
// 🧠 ANALYSE INTENT SIMPLE
// --------------------
function extractMemory(userMessage, memory) {
    const lower = userMessage.toLowerCase();

    // Exemple : mémorisation du prénom
    if (lower.includes("je m'appelle")) {
        const name = userMessage.split("je m'appelle")[1].trim();
        memory.profile.name = name;
    }

    // Exemple : intérêt
    if (lower.includes("j'aime")) {
        memory.profile.likes = memory.profile.likes || [];
        memory.profile.likes.push(userMessage);
    }

    return memory;
}

// --------------------
// 🚀 ENDPOINT JARVIS
// --------------------
app.post("/jarvis", async (req, res) => {

    const userMessage = req.body.query;

    let memory = loadMemory();

    // 🧠 mise à jour mémoire avant réponse
    memory = extractMemory(userMessage, memory);
    saveMemory(memory);

    const systemPrompt = `
Tu es Jarvis, un assistant IA ultra avancé.
Tu es Jarvis, assistant IA inspiré d’un système futuriste.
Tu parles de manière calme, précise et légèrement cinématique.

Tu dois :
- répondre clairement et simplement
- être précis (physique, histoire, géographie, nature, culture générale)
- expliquer comme un professeur intelligent
- adapter tes réponses à l'utilisateur

Mémoire utilisateur :
${JSON.stringify(memory.profile)}

Si une information est utile, tu peux la réutiliser naturellement.
`;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const answer = response.data.choices[0].message.content;

        res.json({
            response: answer
        });

    } catch (error) {
        res.json({
            response: "Erreur Jarvis : système indisponible."
        });
    }
});

const reply = response.data.choices[0].message.content;

const ironManStyle = `
${reply}
`;

res.json({
    response: ironManStyle
});

// --------------------
// 🚀 LANCEMENT
// --------------------
app.listen(process.env.PORT || 3000, () => {
    console.log("🤖 Jarvis actif sur le port 3000");
});