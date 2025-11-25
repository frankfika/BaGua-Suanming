import { GoogleGenAI, Type, Schema, ChatSession } from "@google/genai";
import { UserInput, BaziResult } from "../types";

// Define the response schema for structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dayMaster: { type: Type.STRING },
    dayMasterElement: { type: Type.STRING },
    strength: { type: Type.STRING },
    solarTimeAdjusted: { type: Type.STRING },
    chart: {
      type: Type.OBJECT,
      properties: {
        year: {
          type: Type.OBJECT,
          properties: {
            stem: { type: Type.STRING },
            branch: { type: Type.STRING },
            element: { type: Type.STRING },
            gods: { type: Type.ARRAY, items: { type: Type.STRING } },
            hiddenStems: { type: Type.ARRAY, items: { type: Type.STRING } },
            shenSha: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        month: {
          type: Type.OBJECT,
          properties: {
            stem: { type: Type.STRING },
            branch: { type: Type.STRING },
            element: { type: Type.STRING },
            gods: { type: Type.ARRAY, items: { type: Type.STRING } },
            hiddenStems: { type: Type.ARRAY, items: { type: Type.STRING } },
            shenSha: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        day: {
          type: Type.OBJECT,
          properties: {
            stem: { type: Type.STRING },
            branch: { type: Type.STRING },
            element: { type: Type.STRING },
            gods: { type: Type.ARRAY, items: { type: Type.STRING } },
            hiddenStems: { type: Type.ARRAY, items: { type: Type.STRING } },
            shenSha: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        hour: {
          type: Type.OBJECT,
          properties: {
            stem: { type: Type.STRING },
            branch: { type: Type.STRING },
            element: { type: Type.STRING },
            gods: { type: Type.ARRAY, items: { type: Type.STRING } },
            hiddenStems: { type: Type.ARRAY, items: { type: Type.STRING } },
            shenSha: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    },
    fiveElements: {
      type: Type.OBJECT,
      properties: {
        wood: { type: Type.NUMBER },
        fire: { type: Type.NUMBER },
        earth: { type: Type.NUMBER },
        metal: { type: Type.NUMBER },
        water: { type: Type.NUMBER }
      }
    },
    luckyElements: { type: Type.ARRAY, items: { type: Type.STRING } },
    unluckyElements: { type: Type.ARRAY, items: { type: Type.STRING } },
    luckyColors: { type: Type.ARRAY, items: { type: Type.STRING } },
    luckyNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
    luckyDirections: { type: Type.ARRAY, items: { type: Type.STRING } },
    analysis: {
      type: Type.OBJECT,
      properties: {
        personality: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            details: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          }
        },
        career: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            details: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          }
        },
        wealth: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            details: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          }
        },
        relationships: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            details: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          }
        },
        health: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            details: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          }
        },
        globalFortune: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            details: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          }
        }
      }
    }
  }
};

let chatSession: ChatSession | null = null;

export const generateBaziAnalysis = async (input: UserInput): Promise<BaziResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const locationString = input.latitude && input.longitude 
    ? `${input.birthLocation} (Lat: ${input.latitude}, Long: ${input.longitude})`
    : input.birthLocation;
  
  // Construct a prompt that requires deep knowledge of Chinese metaphysics
  const prompt = `
    You are a Grandmaster of Traditional Chinese Metaphysics (Bazi and Zi Wei Dou Shu).
    
    Target Profile:
    - Name: ${input.name}
    - Gender: ${input.gender}
    - Birth Date (Gregorian): ${input.birthDate}
    - Birth Time (Clock Time): ${input.birthTime}
    - Location: ${locationString}

    **CORE INSTRUCTIONS:**
    1. **True Solar Time**: You MUST convert the birth time to True Solar Time based on the location longitude before calculating pillars.
    2. **Shen Sha (Symbolic Stars)**: You MUST calculate major stars for each pillar (e.g., Nobleman/天乙贵人, Peach Blossom/桃花, Traveling Horse/驿马, General Star/将星, etc.).
    3. **Deep Analysis**: Do not give generic descriptions. Analyze the *structure* (Ge Ju), the *flow* of Qi, and interactions (Clash/Harm/Combine).
    4. **Predictions**: In Career/Wealth/Relationship sections, provide specific predictions for the next 3-5 years based on Da Yun (10-Year Luck Cycle) and Liu Nian (Annual Pillar).

    **OUTPUT SECTIONS:**
    
    *   **Personality**: Analyze internal character vs. external persona. Mention key strengths/weaknesses based on Ten Gods.
    *   **Career**: Suggest specific industries (Fire-related, Water-related, etc.) and roles (Leadership vs. Technical). Predict career trajectory for next 3 years.
    *   **Wealth**: Direct wealth vs. Indirect wealth analysis. When will the wealth luck peak?
    *   **Relationships**: Spouse star analysis. Predicted timing for marriage or relationship changes. Quality of marriage.
    *   **Health**: Vulnerable organs based on element weakness/excess.
    *   **Global Fortune**: A summary of the current Da Yun (10-year cycle) and specific predictions for upcoming years (e.g., "2025 Snake Year: ...").

    **Actionable Advice**: For every section, provide concrete advice (e.g., "Wear Red," "Head North," "Partner with people born in Rat year").

    **Language**: Professional Simplified Chinese (简体中文). Tone: Wise, specific, empathetic but direct.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.75, // Slightly higher for more creative/interpretive depth
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response generated from AI.");
    }

    const data = JSON.parse(resultText) as BaziResult;

    // Initialize chat session with deep context
    chatSession = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: `You are a Bazi Grandmaster. You have analyzed this chart: ${JSON.stringify(data)}.
            User: ${input.name}. 
            
            Your goal is to answer follow-up questions with *predictive depth*.
            - If asked about "this year", look at the current year pillar vs day master.
            - If asked about "love", check the spouse star status.
            - Always be encouraging but realistic about 'Clashes' or 'Void' stars.
            `
        }
    });

    return data;
  } catch (error) {
    console.error("Bazi Analysis Error:", error);
    throw error;
  }
};

export const chatWithMaster = async (message: string): Promise<string> => {
    if (!chatSession) {
        throw new Error("Analysis session not initialized.");
    }
    const response = await chatSession.sendMessage({ message });
    return response.text || "The stars are silent momentarily.";
}