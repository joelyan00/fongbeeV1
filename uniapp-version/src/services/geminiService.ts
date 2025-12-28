// import { GoogleGenAI } from "@google/genai";

// const apiKey = ''; // process.env.API_KEY removed for stability
// const ai = null; // new GoogleGenAI({ apiKey });

export const generateRepairAdvice = async (query: string): Promise<string> => {
  // Mock response for preview stability
  console.log("Mocking AI response for:", query);
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (query.includes("水")) return "根据您的需求，为您推荐【水管安装维修】服务。预估价格：$80起。";
  if (query.includes("电")) return "根据您的需求，为您推荐【电路安装维修】服务。注意安全，建议由专业人士处理。";
  if (query.includes("车")) return "根据您的需求，为您推荐【机场接车服务】或【更换轮胎服务】。";

  return "您好！我是优服佳智能助手。根据您的描述，为您推荐【家庭清洁服务】。我们提供专业的上门清洁，让您的家焕然一新。";

  /* 
  try {
    const model = 'gemini-2.5-flash';
    // ... (rest of logic commented out)
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，服务暂时繁忙，请稍后再试。";
  }
  */
};