export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(455).json({ error: 'Método no permitido' });
    }

    const { message, image } = req.body;
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Error del servidor: Variable GROQ_API_KEY no configurada en Vercel.' });
    }

    try {
        let requestBody = {};

        if (image) {
            requestBody = {
                model: "llama-3.2-90b-vision-preview",
                messages: [
                    { 
                        role: "system", 
                        content: "Eres Aura IA, un asistente avanzado de inteligencia artificial con capacidades completas de visión. Analiza detalladamente lo que el usuario adjunte y responde directamente con seguridad en español." 
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: message || "Analiza esta imagen detalladamente." },
                            { type: "image_url", image_url: { url: image } }
                        ]
                    }
                ]
            };
        } else {
            requestBody = {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: "Eres Aura IA, un asistente virtual útil, inteligente, directo y respondes siempre en español." },
                    { role: "user", content: message }
                ]
            };
        }

        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        const data = await groqResponse.json();

        if (data.choices && data.choices[0].message) {
            let botResponse = data.choices[0].message.content;
            
            // Limpia los asteriscos innecesarios de formato que a veces ensucian la vista
            botResponse = botResponse.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
            
            return res.status(200).json({ reply: botResponse });
        } else {
            return res.status(400).json({ error: "Groq no devolvió un formato de respuesta válido." });
        }

    } catch (error) {
        return res.status(500).json({ error: "Hubo un error de conexión interno en el servidor." });
    }
}