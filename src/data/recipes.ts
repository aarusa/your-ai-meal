export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: {
    productId: string;
    amount: number;
    unit: string;
  }[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
}

export const recipes: Recipe[] = [
  {
    id: "scrambled-eggs",
    name: "Scrambled Eggs",
    description: "Classic fluffy scrambled eggs with herbs",
    category: "Breakfast",
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      { productId: "chicken-egg-whole", amount: 2, unit: "eggs" },
      { productId: "butter", amount: 1, unit: "tbsp" },
      { productId: "garlic", amount: 1, unit: "clove" },
      { productId: "basil", amount: 2, unit: "leaves" }
    ],
    instructions: [
      "Crack eggs into a bowl and whisk lightly",
      "Heat butter in a non-stick pan over medium heat",
      "Add minced garlic and cook for 30 seconds",
      "Pour in eggs and stir gently with a spatula",
      "Cook until eggs are set but still creamy",
      "Garnish with fresh basil and serve immediately"
    ],
    nutrition: {
      calories: 220,
      protein: 16,
      carbs: 2,
      fat: 17
    },
    tags: ["quick", "protein-rich", "low-carb"]
  },
  {
    id: "chicken-stir-fry",
    name: "Chicken Stir Fry",
    description: "Quick and healthy chicken stir fry with vegetables",
    category: "Dinner",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      { productId: "chicken-breast", amount: 200, unit: "g" },
      { productId: "bell-pepper", amount: 1, unit: "pepper" },
      { productId: "broccoli", amount: 100, unit: "g" },
      { productId: "garlic", amount: 2, unit: "cloves" },
      { productId: "olive-oil", amount: 2, unit: "tbsp" },
      { productId: "brown-rice", amount: 150, unit: "g" }
    ],
    instructions: [
      "Cut chicken into bite-sized pieces",
      "Chop bell pepper and broccoli into small pieces",
      "Heat olive oil in a large pan over high heat",
      "Add chicken and cook until golden brown",
      "Add vegetables and minced garlic",
      "Stir-fry for 5-7 minutes until vegetables are tender",
      "Serve over cooked brown rice"
    ],
    nutrition: {
      calories: 450,
      protein: 35,
      carbs: 45,
      fat: 15
    },
    tags: ["high-protein", "balanced", "quick"]
  },
  {
    id: "salmon-quinoa-bowl",
    name: "Salmon Quinoa Bowl",
    description: "Nutritious salmon bowl with quinoa and vegetables",
    category: "Lunch",
    prepTime: 15,
    cookTime: 20,
    servings: 1,
    difficulty: "Medium",
    ingredients: [
      { productId: "salmon-fillet", amount: 150, unit: "g" },
      { productId: "quinoa", amount: 80, unit: "g" },
      { productId: "avocado", amount: 0.5, unit: "avocado" },
      { productId: "spinach", amount: 50, unit: "g" },
      { productId: "tomato", amount: 1, unit: "tomato" },
      { productId: "olive-oil", amount: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook quinoa according to package instructions",
      "Season salmon with salt and pepper",
      "Heat olive oil in a pan and cook salmon for 4-5 minutes per side",
      "Wash and prepare spinach and tomato",
      "Slice avocado",
      "Arrange quinoa in a bowl, top with salmon and vegetables",
      "Drizzle with olive oil and serve"
    ],
    nutrition: {
      calories: 520,
      protein: 32,
      carbs: 35,
      fat: 28
    },
    tags: ["omega-3", "superfood", "balanced"]
  },
  {
    id: "greek-yogurt-parfait",
    name: "Greek Yogurt Parfait",
    description: "Healthy parfait with Greek yogurt and fresh berries",
    category: "Breakfast",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      { productId: "greek-yogurt", amount: 200, unit: "g" },
      { productId: "strawberry", amount: 50, unit: "g" },
      { productId: "blueberry", amount: 30, unit: "g" },
      { productId: "almonds", amount: 15, unit: "g" },
      { productId: "honey", amount: 1, unit: "tsp" }
    ],
    instructions: [
      "Wash and slice strawberries",
      "Layer Greek yogurt in a glass or bowl",
      "Add fresh strawberries and blueberries",
      "Top with chopped almonds",
      "Drizzle with honey",
      "Serve immediately"
    ],
    nutrition: {
      calories: 280,
      protein: 20,
      carbs: 25,
      fat: 12
    },
    tags: ["probiotic", "antioxidants", "no-cook"]
  },
  {
    id: "vegetable-pasta",
    name: "Vegetable Pasta",
    description: "Colorful pasta with fresh vegetables and herbs",
    category: "Dinner",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      { productId: "pasta", amount: 200, unit: "g" },
      { productId: "tomato", amount: 2, unit: "tomatoes" },
      { productId: "bell-pepper", amount: 1, unit: "pepper" },
      { productId: "mushroom", amount: 100, unit: "g" },
      { productId: "garlic", amount: 3, unit: "cloves" },
      { productId: "basil", amount: 5, unit: "leaves" },
      { productId: "olive-oil", amount: 3, unit: "tbsp" }
    ],
    instructions: [
      "Cook pasta according to package instructions",
      "Dice tomatoes and bell pepper",
      "Slice mushrooms",
      "Heat olive oil in a large pan",
      "Add garlic and cook until fragrant",
      "Add vegetables and cook for 5-7 minutes",
      "Toss with cooked pasta and fresh basil",
      "Season with salt and pepper"
    ],
    nutrition: {
      calories: 380,
      protein: 12,
      carbs: 65,
      fat: 8
    },
    tags: ["vegetarian", "colorful", "comfort-food"]
  },
  {
    id: "chicken-salad",
    name: "Chicken Salad",
    description: "Fresh chicken salad with mixed greens and vegetables",
    category: "Lunch",
    prepTime: 15,
    cookTime: 10,
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      { productId: "chicken-breast", amount: 120, unit: "g" },
      { productId: "spinach", amount: 50, unit: "g" },
      { productId: "tomato", amount: 1, unit: "tomato" },
      { productId: "cucumber", amount: 0.5, unit: "cucumber" },
      { productId: "avocado", amount: 0.25, unit: "avocado" },
      { productId: "olive-oil", amount: 2, unit: "tbsp" }
    ],
    instructions: [
      "Grill or pan-fry chicken breast until cooked through",
      "Let chicken cool and slice into strips",
      "Wash and prepare all vegetables",
      "Slice tomato and cucumber",
      "Cut avocado into chunks",
      "Arrange spinach in a bowl",
      "Top with chicken and vegetables",
      "Drizzle with olive oil and season"
    ],
    nutrition: {
      calories: 320,
      protein: 28,
      carbs: 12,
      fat: 18
    },
    tags: ["fresh", "low-carb", "high-protein"]
  },
  {
    id: "overnight-oats",
    name: "Overnight Oats",
    description: "Creamy overnight oats with fruits and nuts",
    category: "Breakfast",
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      { productId: "oats", amount: 50, unit: "g" },
      { productId: "milk", amount: 150, unit: "ml" },
      { productId: "banana", amount: 0.5, unit: "banana" },
      { productId: "almonds", amount: 10, unit: "g" },
      { productId: "cinnamon", amount: 0.5, unit: "tsp" }
    ],
    instructions: [
      "Mix oats with milk in a jar or bowl",
      "Add cinnamon and stir well",
      "Mash half a banana and mix in",
      "Top with chopped almonds",
      "Cover and refrigerate overnight",
      "Stir before serving and enjoy cold"
    ],
    nutrition: {
      calories: 320,
      protein: 12,
      carbs: 45,
      fat: 8
    },
    tags: ["make-ahead", "fiber-rich", "no-cook"]
  },
  {
    id: "beef-stir-fry",
    name: "Beef Stir Fry",
    description: "Quick beef stir fry with vegetables and rice",
    category: "Dinner",
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    difficulty: "Medium",
    ingredients: [
      { productId: "beef", amount: 200, unit: "g" },
      { productId: "broccoli", amount: 100, unit: "g" },
      { productId: "carrot", amount: 1, unit: "carrot" },
      { productId: "garlic", amount: 2, unit: "cloves" },
      { productId: "ginger", amount: 1, unit: "inch" },
      { productId: "white-rice", amount: 150, unit: "g" },
      { productId: "olive-oil", amount: 2, unit: "tbsp" }
    ],
    instructions: [
      "Slice beef into thin strips",
      "Cut broccoli and carrot into bite-sized pieces",
      "Mince garlic and ginger",
      "Heat oil in a wok or large pan",
      "Cook beef until browned, remove from pan",
      "Add vegetables and aromatics, stir-fry for 3-4 minutes",
      "Return beef to pan and cook for 1-2 minutes",
      "Serve over cooked rice"
    ],
    nutrition: {
      calories: 480,
      protein: 32,
      carbs: 45,
      fat: 18
    },
    tags: ["high-iron", "quick", "satisfying"]
  }
];

export const findMatchingRecipes = (selectedProductIds: string[]): Recipe[] => {
  return recipes.filter(recipe => {
    // Check if recipe contains any of the selected ingredients
    return recipe.ingredients.some(ingredient => 
      selectedProductIds.includes(ingredient.productId)
    );
  });
};

export const getRecipeById = (id: string): Recipe | undefined => {
  return recipes.find(recipe => recipe.id === id);
};
