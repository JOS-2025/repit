import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing required OpenAI API key: OPENAI_API_KEY");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface RecipeRecommendation {
  name: string;
  description: string;
  ingredients: string[];
  cookingTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  servings: number;
  instructions: string[];
}

export interface ProductRecommendation {
  productId: string;
  reason: string;
  confidence: number;
}

export class AIService {
  async generateRecipeRecommendations(
    purchasedItems: Array<{ name: string; category: string; description?: string }>
  ): Promise<RecipeRecommendation[]> {
    try {
      const itemsList = purchasedItems
        .map(item => `${item.name} (${item.category})`)
        .join(", ");

      const prompt = `Based on these farm-fresh ingredients: ${itemsList}

Generate 3 delicious, practical recipes that use these ingredients. Each recipe should be healthy, seasonal, and showcase the fresh farm products.

Respond with JSON in this exact format:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "description": "Brief appetizing description",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "cookingTime": 30,
      "difficulty": "Easy",
      "servings": 4,
      "instructions": ["step 1", "step 2", "step 3"]
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a farm-to-table chef expert who creates healthy, seasonal recipes using fresh farm ingredients. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.recipes || [];
    } catch (error) {
      console.error("Error generating recipe recommendations:", error);
      return [];
    }
  }

  async generateProductRecommendations(
    userHistory: Array<{ name: string; category: string }>,
    availableProducts: Array<{ id: string; name: string; category: string; description: string }>
  ): Promise<ProductRecommendation[]> {
    try {
      const historyText = userHistory
        .map(item => `${item.name} (${item.category})`)
        .join(", ");

      const productsText = availableProducts
        .map(p => `${p.id}: ${p.name} (${p.category}) - ${p.description}`)
        .join("\n");

      const prompt = `User's purchase history: ${historyText}

Available products:
${productsText}

Based on the user's purchase patterns, recommend 3-5 products they might like. Consider:
- Similar categories they've bought
- Complementary products that work well together
- Seasonal items
- Popular trending products

Respond with JSON in this exact format:
{
  "recommendations": [
    {
      "productId": "product-id",
      "reason": "Why this product is recommended",
      "confidence": 0.85
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert agricultural marketplace analyst who understands customer preferences and seasonal farming patterns. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.recommendations || [];
    } catch (error) {
      console.error("Error generating product recommendations:", error);
      return [];
    }
  }

  async generateTrendingProducts(
    allProducts: Array<{ id: string; name: string; category: string; description: string }>,
    seasonalContext?: string
  ): Promise<ProductRecommendation[]> {
    try {
      const productsText = allProducts
        .map(p => `${p.id}: ${p.name} (${p.category}) - ${p.description}`)
        .join("\n");

      const season = seasonalContext || "current season";

      const prompt = `Available farm products:
${productsText}

Identify 4-6 products that would be trending or most popular for ${season}. Consider:
- Seasonal availability and freshness
- Health trends and nutritional value
- Versatility in cooking
- Popular farm-to-table ingredients

Respond with JSON in this exact format:
{
  "trending": [
    {
      "productId": "product-id",
      "reason": "Why this product is trending",
      "confidence": 0.90
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a farm-to-table market trend analyst who understands seasonal produce, health trends, and consumer preferences. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.6
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return result.trending || [];
    } catch (error) {
      console.error("Error generating trending products:", error);
      return [];
    }
  }
}

export const aiService = new AIService();