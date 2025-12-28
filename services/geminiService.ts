import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRepairAdvice = async (query: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    const services = [
      "水管安装维修", "电路安装维修", "室内维修保养",
      "屋顶翻修保养", "车道翻修保养", "花园草坪维护",
      "会计报税服务", "网站开发服务", "美容美发服务",
      "房屋贷款服务", "房产交易服务", "二手汽车交易",
      "顺心旅游服务", "机票购买服务", "机场接车服务",
      "家庭清洁服务", "冬季扫雪服务", "更换轮胎服务"
    ];

    const systemInstruction = `You are a smart service assistant for "YouFuJia" (优服佳), a comprehensive home and life service platform in Toronto.

    Your primary task is to help users find the right service from our catalog based on their natural language description.

    Our Service Catalog:
    ${services.join('、')}

    Instructions:
    1. ANALYZE the user's input to understand their need (e.g., "my roof is leaking" -> "屋顶翻修保养", "I need a ride to YYZ" -> "机场接车服务", "Want to file taxes" -> "会计报税服务").
    2. RECOMMEND the most appropriate service from the list. 
       - Start your response by explicitly stating: "根据您的需求，为您推荐【Service Name】服务。"
    3. If the user asks for PRICE or TROUBLESHOOTING for home repairs, provide a helpful estimate (in CAD) or advice, but still mention the relevant service.
    4. If the request is completely unrelated to our services, politely inform them.
    5. Keep answers concise (under 100 words).
    6. Respond in Chinese (Simplified).
    
    Current User Query: ${query}`;

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
      }
    });

    return response.text || "抱歉，我没有理解您的需求，请尝试换个说法。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，服务暂时繁忙，请稍后再试。";
  }
};