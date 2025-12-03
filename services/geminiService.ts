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
    solarTerm: { type: Type.STRING },
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
  
  const prompt = `
    You are a Grandmaster of Traditional Chinese Metaphysics (Bazi and Zi Wei Dou Shu).
    **LANGUAGE REQUIREMENT**: Output all string content strictly in **Simplified Chinese (简体中文)**.
    
    Target Profile:
    - Name: ${input.name}
    - Gender: ${input.gender}
    - Birth Date (Gregorian): ${input.birthDate}
    - Birth Time (Clock Time): ${input.birthTime} (Time Zone: Assume Beijing Time UTC+8 if not specified by location)
    - Location: ${locationString}

    **STRICT CALCULATION RULES (CRITICAL):**
    1.  **True Solar Time**: 
        - Convert the input Clock Time to True Solar Time (真太阳时).
        - Formula: Clock Time + ((Longitude - 120) * 4 minutes) + Equation of Time (EOT).
        - **IMPORTANT**: If the calculated True Solar Time is 23:00 or later, it counts as the **NEXT DAY** for the Day Pillar calculation (Rat Hour).
    
    2.  **Solar Terms (Jie Qi)**: 
        - Use the 24 Solar Terms to determine the Month Pillar boundaries strictly. 
        - Provide the name of the preceding Solar Term in the 'solarTerm' output field (e.g., "立春后5天").
    
    3.  **Day Pillar**: 
        - Must be accurate to the Gregorian date (adjusted for 23:00+ rule). 
        - Do not hallucinate. Verify against the standard 60 Jia Zi cycle.
    
    4.  **Hour Pillar (Five Rats Chasing Hour / 五鼠遁)**:
        - Apply this table strictly based on the **Day Stem (日干)**:
        - Jia/Ji (甲/己) Day -> Start Zi hour with Jia-Zi (甲子).
        - Yi/Geng (乙/庚) Day -> Start Zi hour with Bing-Zi (丙子).
        - Bing/Xin (丙/辛) Day -> Start Zi hour with Wu-Zi (戊子).
        - Ding/Ren (丁/壬) Day -> Start Zi hour with Geng-Zi (庚子).
        - Wu/Gui (戊/癸) Day -> Start Zi hour with Ren-Zi (壬子).

    **ANALYSIS INSTRUCTIONS:**
    - **Shen Sha**: Calculate major Symbolic Stars (Nobleman, Peach Blossom, Traveling Horse) in Chinese.
    - **Predictions**: Provide specific year-by-year predictions for the next 3-5 years.
    - **Advice**: Provide concrete actions (colors, directions, habits).

    Output strictly in JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2, // Lower temperature for precision in calculation
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("AI 未能生成结果。");
    }

    const data = JSON.parse(resultText) as BaziResult;

    chatSession = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction: `You are a Bazi Grandmaster. You have analyzed this chart: ${JSON.stringify(data)}.
            User: ${input.name}. 
            Language: Simplified Chinese (简体中文).
            Be helpful, specific, and encouraging. Focus on the interplay of the Five Elements.`
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
        throw new Error("会话未初始化。");
    }
    const response = await chatSession.sendMessage({ message });
    return response.text || "天机暂不可泄露。";
}