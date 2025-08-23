import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface UserPreferences {
  userId?: string;
  purchaseHistory: Array<{
    productId: string;
    productName: string;
    category: string;
    price: number;
    quantity: number;
    purchasedAt: Date;
  }>;
  location?: string;
  dietaryPreferences?: string[];
  budget?: {
    min: number;
    max: number;
  };
}

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  unit: string;
  farmer: {
    farmName: string;
    location: string;
    averageRating: string;
  };
  nutrition?: {
    calories: number;
    vitamins: string[];
    benefits: string[];
  };
}

interface RecommendationContext {
  season?: string;
  weather?: string;
  timeOfDay?: string;
  currentCart?: Product[];
  searchQuery?: string;
}

interface SmartSuggestion {
  text: string;
  emoji: string;
  category: string;
  confidence: number;
}

export class AIService {
  // Generate smart search suggestions with contextual emojis
  async getSmartSearchSuggestions(
    query: string,
    availableProducts: Product[],
    limit: number = 8
  ): Promise<SmartSuggestion[]> {
    try {
      if (query.length < 2) return [];

      // Get product names and categories for context
      const productContext = availableProducts.map(p => ({
        name: p.name,
        category: p.category,
        description: p.description
      })).slice(0, 20); // Limit for API efficiency

      const prompt = `You are a smart search assistant for a farm-to-table marketplace. 
      
User is typing: "${query}"
      
Available products context:
${JSON.stringify(productContext, null, 2)}
      
Generate ${limit} intelligent search suggestions with contextual emojis. Consider:
1. Product names and partial matches
2. Categories (fruits, vegetables, dairy, grains, herbs)
3. Cooking methods (fresh, organic, seasonal)
4. Nutritional benefits (vitamins, protein, fiber)
5. Meal types (breakfast, salad, soup ingredients)
6. Seasonal preferences
7. Local/regional specialties

Each suggestion should have:
- Relevant emoji that represents the search term
- Clear, helpful search text
- Appropriate category
- Confidence score based on relevance

Respond with JSON:
{
  "suggestions": [
    {
      "text": "Fresh tomatoes",
      "emoji": "🍅",
      "category": "vegetables", 
      "confidence": 0.95
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert search assistant for agricultural products. Provide contextually relevant search suggestions with appropriate emojis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 800,
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return aiResponse.suggestions || [];
      
    } catch (error) {
      console.error('AI search suggestions error:', error);
      // Fallback to basic suggestions
      return this.getFallbackSuggestions(query, availableProducts, limit);
    }
  }

  // Fallback suggestions when AI is unavailable
  private getFallbackSuggestions(query: string, products: Product[], limit: number): SmartSuggestion[] {
    const lowerQuery = query.toLowerCase();
    const suggestions: SmartSuggestion[] = [];

    // Category-based emoji mapping
    const categoryEmojis: { [key: string]: string } = {
      'fruits': '🍎',
      'vegetables': '🥬', 
      'dairy': '🥛',
      'grains': '🌾',
      'herbs': '🌿',
      'others': '🛒'
    };

    // Direct product matches
    products
      .filter(p => p.name.toLowerCase().includes(lowerQuery))
      .slice(0, 3)
      .forEach(p => {
        suggestions.push({
          text: p.name,
          emoji: categoryEmojis[p.category] || '🛒',
          category: p.category,
          confidence: 0.9
        });
      });

    // Category suggestions  
    const categorySet = new Set(products.map(p => p.category));
    const categories = Array.from(categorySet);
    categories
      .filter(cat => cat.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .forEach(cat => {
        suggestions.push({
          text: cat,
          emoji: categoryEmojis[cat] || '📦',
          category: cat,
          confidence: 0.7
        });
      });

    // Common search terms with emojis
    const commonTerms = [
      { text: 'organic produce', emoji: '🌱', category: 'organic' },
      { text: 'fresh vegetables', emoji: '🥕', category: 'vegetables' },
      { text: 'seasonal fruits', emoji: '🍓', category: 'fruits' },
      { text: 'local dairy', emoji: '🧀', category: 'dairy' }
    ];

    commonTerms
      .filter(term => term.text.toLowerCase().includes(lowerQuery))
      .slice(0, 2)
      .forEach(term => {
        suggestions.push({
          ...term,
          confidence: 0.6
        });
      });

    return suggestions.slice(0, limit);
  }

  // Generate personalized product recommendations
  async getPersonalizedRecommendations(
    userPreferences: UserPreferences,
    availableProducts: Product[],
    context: RecommendationContext = {},
    limit: number = 6
  ): Promise<Product[]> {
    try {
      // Prepare context for AI
      const userContext = this.buildUserContext(userPreferences, context);
      const productContext = this.buildProductContext(availableProducts);

      const prompt = `You are an AI nutritionist and local food expert for a farm-to-table marketplace. 
      
User Context:
${userContext}

Available Products:
${productContext}

Current Context:
- Season: ${context.season || 'Not specified'}
- Weather: ${context.weather || 'Not specified'}
- Time: ${context.timeOfDay || 'Not specified'}
- Current cart: ${context.currentCart?.map(p => p.name).join(', ') || 'Empty'}
- Search query: ${context.searchQuery || 'None'}

Please recommend ${limit} products that would be perfect for this user. Consider:
1. Their purchase history and preferences
2. Nutritional needs and dietary restrictions
3. Seasonal availability and freshness
4. Local farmers and proximity
5. Current cart items for meal completion
6. Budget constraints
7. Weather-appropriate foods

Respond with a JSON object containing an array of recommended product IDs and brief explanations:
{
  "recommendations": [
    {
      "productId": "string",
      "reason": "Why this product is recommended (max 50 words)",
      "confidence": 0.95,
      "nutritionalBenefits": ["benefit1", "benefit2"],
      "mealSuggestion": "How to use this product"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert AI nutritionist and local food advisor. Provide helpful, personalized recommendations based on user preferences and available local produce."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 1500,
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{"recommendations": []}');
      
      // Filter and return actual products based on AI recommendations
      const recommendedProducts = aiResponse.recommendations
        .map((rec: any) => {
          const product = availableProducts.find(p => p.id === rec.productId);
          return product ? { ...product, aiReason: rec.reason, confidence: rec.confidence } : null;
        })
        .filter(Boolean)
        .slice(0, limit);

      return recommendedProducts;

    } catch (error) {
      console.error('AI recommendation error:', error);
      // Fallback to simple recommendation logic
      return this.getFallbackRecommendations(userPreferences, availableProducts, limit);
    }
  }

  // Generate smart search suggestions
  async getSearchSuggestions(query: string, userPreferences: UserPreferences): Promise<string[]> {
    try {
      const prompt = `Given the search query "${query}" from a user shopping for fresh produce, suggest 5 related searches that would help them find what they're looking for.

User preferences: ${JSON.stringify(userPreferences)}

Consider:
- Seasonal alternatives
- Nutritional similar products
- Cooking method variations
- Local availability

Respond with a JSON array of search suggestions:
{"suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"]}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.6,
        max_tokens: 200,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      return result.suggestions || [];

    } catch (error) {
      console.error('AI search suggestion error:', error);
      return []; // Return empty array on error
    }
  }

  // Generate meal planning suggestions
  async getMealPlanSuggestions(
    products: Product[],
    preferences: UserPreferences,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'dinner'
  ): Promise<{
    mealName: string;
    description: string;
    ingredients: string[];
    cookingTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
    nutrition: string;
  }[]> {
    try {
      const prompt = `Create 3 healthy ${mealType} meal suggestions using these available local products:

${products.map(p => `- ${p.name} (${p.category}) - ${p.description}`).join('\n')}

User preferences: ${JSON.stringify(preferences)}

For each meal, provide:
- Creative meal name
- Brief description (30 words max)
- Main ingredients from the available products
- Estimated cooking time
- Difficulty level
- Key nutritional benefits

Respond in JSON format:
{
  "meals": [
    {
      "mealName": "string",
      "description": "string", 
      "ingredients": ["product1", "product2"],
      "cookingTime": "string",
      "difficulty": "easy|medium|hard",
      "nutrition": "string"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"meals": []}');
      return result.meals || [];

    } catch (error) {
      console.error('AI meal planning error:', error);
      return [];
    }
  }

  // Helper methods
  private buildUserContext(preferences: UserPreferences, context: RecommendationContext): string {
    const recentPurchases = preferences.purchaseHistory
      .slice(-10)
      .map(p => `${p.productName} (${p.category})`)
      .join(', ');

    return `
- Location: ${preferences.location || 'Not specified'}
- Recent purchases: ${recentPurchases || 'None'}
- Dietary preferences: ${preferences.dietaryPreferences?.join(', ') || 'None specified'}
- Budget range: ${preferences.budget ? `$${preferences.budget.min}-${preferences.budget.max}` : 'Not specified'}
- Purchase frequency: ${preferences.purchaseHistory.length} previous orders
    `.trim();
  }

  private buildProductContext(products: Product[]): string {
    return products
      .slice(0, 20) // Limit for token efficiency
      .map(p => `${p.id}: ${p.name} (${p.category}) - $${p.price}/${p.unit} - ${p.farmer.farmName}, ${p.farmer.location}`)
      .join('\n');
  }

  private getFallbackRecommendations(
    preferences: UserPreferences,
    products: Product[],
    limit: number
  ): Product[] {
    // Simple fallback logic based on purchase history and categories
    const preferredCategories = preferences.purchaseHistory
      .reduce((acc, purchase) => {
        acc[purchase.category] = (acc[purchase.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const sortedProducts = products
      .map(product => ({
        ...product,
        score: preferredCategories[product.category] || 0 + Math.random() * 0.1 // Add small random factor
      }))
      .sort((a, b) => b.score - a.score);

    return sortedProducts.slice(0, limit);
  }
}

export const aiService = new AIService();