export interface Product {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description?: string;
}

export const products: Product[] = [
  // Eggs
  {
    id: "chicken-egg-whole",
    name: "Chicken Egg (Whole)",
    category: "Eggs",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    description: "Large chicken egg, whole"
  },
  {
    id: "chicken-egg-white",
    name: "Chicken Egg White",
    category: "Eggs",
    calories: 17,
    protein: 3.6,
    carbs: 0.2,
    fat: 0.1,
    description: "Chicken egg white only"
  },
  {
    id: "chicken-egg-yolk",
    name: "Chicken Egg Yolk",
    category: "Eggs",
    calories: 55,
    protein: 2.7,
    carbs: 0.6,
    fat: 4.5,
    description: "Chicken egg yolk only"
  },
  {
    id: "duck-egg",
    name: "Duck Egg",
    category: "Eggs",
    calories: 185,
    protein: 13,
    carbs: 1.5,
    fat: 14,
    description: "Large duck egg, whole"
  },
  {
    id: "quail-egg",
    name: "Quail Egg",
    category: "Eggs",
    calories: 14,
    protein: 1.2,
    carbs: 0.1,
    fat: 1,
    description: "Small quail egg, whole"
  },
  {
    id: "goose-egg",
    name: "Goose Egg",
    category: "Eggs",
    calories: 266,
    protein: 20,
    carbs: 1.9,
    fat: 19,
    description: "Large goose egg, whole"
  },
  {
    id: "turkey-egg",
    name: "Turkey Egg",
    category: "Eggs",
    calories: 171,
    protein: 13.7,
    carbs: 1.2,
    fat: 12.6,
    description: "Turkey egg, whole"
  },
  {
    id: "ostrich-egg",
    name: "Ostrich Egg",
    category: "Eggs",
    calories: 2000,
    protein: 160,
    carbs: 14,
    fat: 140,
    description: "Large ostrich egg, whole"
  },
  
  // Other common foods
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    category: "Meat",
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    description: "Skinless, boneless chicken breast"
  },
  {
    id: "salmon-fillet",
    name: "Salmon Fillet",
    category: "Fish",
    calories: 208,
    protein: 25,
    carbs: 0,
    fat: 12,
    description: "Atlantic salmon fillet"
  },
  {
    id: "brown-rice",
    name: "Brown Rice",
    category: "Grains",
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fat: 0.9,
    description: "Cooked brown rice"
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Fruits",
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    description: "Medium avocado"
  },
  {
    id: "banana",
    name: "Banana",
    category: "Fruits",
    calories: 89,
    protein: 1.1,
    carbs: 23,
    fat: 0.3,
    description: "Medium banana"
  },
  {
    id: "almonds",
    name: "Almonds",
    category: "Nuts",
    calories: 579,
    protein: 21,
    carbs: 22,
    fat: 50,
    description: "Raw almonds"
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt",
    category: "Dairy",
    calories: 59,
    protein: 10,
    carbs: 3.6,
    fat: 0.4,
    description: "Plain, non-fat Greek yogurt"
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    category: "Vegetables",
    calories: 86,
    protein: 1.6,
    carbs: 20,
    fat: 0.1,
    description: "Medium sweet potato"
  },
  {
    id: "broccoli",
    name: "Broccoli",
    category: "Vegetables",
    calories: 34,
    protein: 2.8,
    carbs: 7,
    fat: 0.4,
    description: "Raw broccoli florets"
  },
  {
    id: "olive-oil",
    name: "Olive Oil",
    category: "Oils",
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    description: "Extra virgin olive oil"
  },
  {
    id: "quinoa",
    name: "Quinoa",
    category: "Grains",
    calories: 120,
    protein: 4.4,
    carbs: 22,
    fat: 1.9,
    description: "Cooked quinoa"
  },
  
  // More Grains & Cereals
  {
    id: "oats",
    name: "Rolled Oats",
    category: "Grains",
    calories: 389,
    protein: 17,
    carbs: 66,
    fat: 7,
    description: "Whole grain rolled oats"
  },
  {
    id: "white-rice",
    name: "White Rice",
    category: "Grains",
    calories: 130,
    protein: 2.7,
    carbs: 28,
    fat: 0.3,
    description: "Cooked white rice"
  },
  {
    id: "pasta",
    name: "Whole Wheat Pasta",
    category: "Grains",
    calories: 124,
    protein: 5,
    carbs: 25,
    fat: 1.1,
    description: "Cooked whole wheat pasta"
  },
  {
    id: "bread",
    name: "Whole Wheat Bread",
    category: "Grains",
    calories: 247,
    protein: 13,
    carbs: 41,
    fat: 4.2,
    description: "Whole wheat bread slice"
  },
  
  // More Fruits
  {
    id: "apple",
    name: "Apple",
    category: "Fruits",
    calories: 52,
    protein: 0.3,
    carbs: 14,
    fat: 0.2,
    description: "Medium apple"
  },
  {
    id: "orange",
    name: "Orange",
    category: "Fruits",
    calories: 47,
    protein: 0.9,
    carbs: 12,
    fat: 0.1,
    description: "Medium orange"
  },
  {
    id: "strawberry",
    name: "Strawberries",
    category: "Fruits",
    calories: 32,
    protein: 0.7,
    carbs: 8,
    fat: 0.3,
    description: "Fresh strawberries"
  },
  {
    id: "blueberry",
    name: "Blueberries",
    category: "Fruits",
    calories: 57,
    protein: 0.7,
    carbs: 14,
    fat: 0.3,
    description: "Fresh blueberries"
  },
  {
    id: "mango",
    name: "Mango",
    category: "Fruits",
    calories: 60,
    protein: 0.8,
    carbs: 15,
    fat: 0.4,
    description: "Fresh mango"
  },
  {
    id: "pineapple",
    name: "Pineapple",
    category: "Fruits",
    calories: 50,
    protein: 0.5,
    carbs: 13,
    fat: 0.1,
    description: "Fresh pineapple"
  },
  
  // More Vegetables
  {
    id: "spinach",
    name: "Spinach",
    category: "Vegetables",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    description: "Raw spinach leaves"
  },
  {
    id: "carrot",
    name: "Carrot",
    category: "Vegetables",
    calories: 41,
    protein: 0.9,
    carbs: 10,
    fat: 0.2,
    description: "Medium carrot"
  },
  {
    id: "tomato",
    name: "Tomato",
    category: "Vegetables",
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fat: 0.2,
    description: "Medium tomato"
  },
  {
    id: "cucumber",
    name: "Cucumber",
    category: "Vegetables",
    calories: 16,
    protein: 0.7,
    carbs: 4,
    fat: 0.1,
    description: "Medium cucumber"
  },
  {
    id: "bell-pepper",
    name: "Bell Pepper",
    category: "Vegetables",
    calories: 31,
    protein: 1,
    carbs: 7,
    fat: 0.3,
    description: "Medium bell pepper"
  },
  {
    id: "onion",
    name: "Onion",
    category: "Vegetables",
    calories: 40,
    protein: 1.1,
    carbs: 9,
    fat: 0.1,
    description: "Medium onion"
  },
  {
    id: "garlic",
    name: "Garlic",
    category: "Vegetables",
    calories: 149,
    protein: 6.4,
    carbs: 33,
    fat: 0.5,
    description: "Fresh garlic cloves"
  },
  {
    id: "mushroom",
    name: "Mushrooms",
    category: "Vegetables",
    calories: 22,
    protein: 3.1,
    carbs: 3.3,
    fat: 0.3,
    description: "Fresh mushrooms"
  },
  
  // More Meat & Protein
  {
    id: "beef",
    name: "Ground Beef",
    category: "Meat",
    calories: 254,
    protein: 26,
    carbs: 0,
    fat: 17,
    description: "Lean ground beef"
  },
  {
    id: "pork",
    name: "Pork Chop",
    category: "Meat",
    calories: 231,
    protein: 25,
    carbs: 0,
    fat: 14,
    description: "Boneless pork chop"
  },
  {
    id: "lamb",
    name: "Lamb",
    category: "Meat",
    calories: 294,
    protein: 25,
    carbs: 0,
    fat: 21,
    description: "Lamb leg"
  },
  {
    id: "turkey",
    name: "Turkey Breast",
    category: "Meat",
    calories: 135,
    protein: 30,
    carbs: 0,
    fat: 1,
    description: "Skinless turkey breast"
  },
  {
    id: "bacon",
    name: "Bacon",
    category: "Meat",
    calories: 541,
    protein: 37,
    carbs: 1.4,
    fat: 42,
    description: "Cooked bacon strips"
  },
  
  // More Fish & Seafood
  {
    id: "tuna",
    name: "Tuna",
    category: "Fish",
    calories: 132,
    protein: 28,
    carbs: 0,
    fat: 1.3,
    description: "Canned tuna in water"
  },
  {
    id: "cod",
    name: "Cod",
    category: "Fish",
    calories: 82,
    protein: 18,
    carbs: 0,
    fat: 0.7,
    description: "Atlantic cod fillet"
  },
  {
    id: "shrimp",
    name: "Shrimp",
    category: "Fish",
    calories: 99,
    protein: 21,
    carbs: 0.2,
    fat: 0.3,
    description: "Cooked shrimp"
  },
  {
    id: "crab",
    name: "Crab",
    category: "Fish",
    calories: 97,
    protein: 20,
    carbs: 0,
    fat: 1.5,
    description: "Cooked crab meat"
  },
  {
    id: "lobster",
    name: "Lobster",
    category: "Fish",
    calories: 89,
    protein: 19,
    carbs: 0,
    fat: 0.5,
    description: "Cooked lobster meat"
  },
  
  // More Dairy
  {
    id: "milk",
    name: "Whole Milk",
    category: "Dairy",
    calories: 61,
    protein: 3.2,
    carbs: 4.6,
    fat: 3.3,
    description: "Whole milk"
  },
  {
    id: "cheese",
    name: "Cheddar Cheese",
    category: "Dairy",
    calories: 403,
    protein: 25,
    carbs: 1.3,
    fat: 33,
    description: "Sharp cheddar cheese"
  },
  {
    id: "butter",
    name: "Butter",
    category: "Dairy",
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fat: 81,
    description: "Unsalted butter"
  },
  {
    id: "cottage-cheese",
    name: "Cottage Cheese",
    category: "Dairy",
    calories: 98,
    protein: 11,
    carbs: 3.4,
    fat: 4.3,
    description: "Low-fat cottage cheese"
  },
  {
    id: "mozzarella",
    name: "Mozzarella",
    category: "Dairy",
    calories: 280,
    protein: 22,
    carbs: 2.2,
    fat: 22,
    description: "Fresh mozzarella cheese"
  },
  
  // More Nuts & Seeds
  {
    id: "walnuts",
    name: "Walnuts",
    category: "Nuts",
    calories: 654,
    protein: 15,
    carbs: 14,
    fat: 65,
    description: "Raw walnuts"
  },
  {
    id: "cashews",
    name: "Cashews",
    category: "Nuts",
    calories: 553,
    protein: 18,
    carbs: 30,
    fat: 44,
    description: "Raw cashews"
  },
  {
    id: "peanuts",
    name: "Peanuts",
    category: "Nuts",
    calories: 567,
    protein: 26,
    carbs: 16,
    fat: 49,
    description: "Raw peanuts"
  },
  {
    id: "pistachios",
    name: "Pistachios",
    category: "Nuts",
    calories: 560,
    protein: 20,
    carbs: 28,
    fat: 45,
    description: "Raw pistachios"
  },
  {
    id: "chia-seeds",
    name: "Chia Seeds",
    category: "Nuts",
    calories: 486,
    protein: 17,
    carbs: 42,
    fat: 31,
    description: "Dried chia seeds"
  },
  {
    id: "flax-seeds",
    name: "Flax Seeds",
    category: "Nuts",
    calories: 534,
    protein: 18,
    carbs: 29,
    fat: 42,
    description: "Ground flax seeds"
  },
  
  // More Oils & Fats
  {
    id: "coconut-oil",
    name: "Coconut Oil",
    category: "Oils",
    calories: 862,
    protein: 0,
    carbs: 0,
    fat: 100,
    description: "Virgin coconut oil"
  },
  {
    id: "avocado-oil",
    name: "Avocado Oil",
    category: "Oils",
    calories: 884,
    protein: 0,
    carbs: 0,
    fat: 100,
    description: "Cold-pressed avocado oil"
  },
  {
    id: "ghee",
    name: "Ghee",
    category: "Oils",
    calories: 900,
    protein: 0,
    carbs: 0,
    fat: 100,
    description: "Clarified butter (ghee)"
  },
  
  // Legumes & Beans
  {
    id: "black-beans",
    name: "Black Beans",
    category: "Legumes",
    calories: 132,
    protein: 8.9,
    carbs: 24,
    fat: 0.5,
    description: "Cooked black beans"
  },
  {
    id: "chickpeas",
    name: "Chickpeas",
    category: "Legumes",
    calories: 164,
    protein: 8.9,
    carbs: 27,
    fat: 2.6,
    description: "Cooked chickpeas"
  },
  {
    id: "lentils",
    name: "Lentils",
    category: "Legumes",
    calories: 116,
    protein: 9,
    carbs: 20,
    fat: 0.4,
    description: "Cooked lentils"
  },
  {
    id: "tofu",
    name: "Tofu",
    category: "Legumes",
    calories: 76,
    protein: 8,
    carbs: 1.9,
    fat: 4.8,
    description: "Firm tofu"
  },
  {
    id: "tempeh",
    name: "Tempeh",
    category: "Legumes",
    calories: 192,
    protein: 20,
    carbs: 9,
    fat: 11,
    description: "Fermented tempeh"
  },
  
  // Herbs & Spices
  {
    id: "basil",
    name: "Basil",
    category: "Herbs",
    calories: 22,
    protein: 3.2,
    carbs: 2.6,
    fat: 0.6,
    description: "Fresh basil leaves"
  },
  {
    id: "oregano",
    name: "Oregano",
    category: "Herbs",
    calories: 265,
    protein: 9,
    carbs: 69,
    fat: 4.3,
    description: "Dried oregano"
  },
  {
    id: "ginger",
    name: "Ginger",
    category: "Herbs",
    calories: 80,
    protein: 1.8,
    carbs: 18,
    fat: 0.8,
    description: "Fresh ginger root"
  },
  {
    id: "turmeric",
    name: "Turmeric",
    category: "Herbs",
    calories: 354,
    protein: 8,
    carbs: 65,
    fat: 10,
    description: "Ground turmeric"
  },
  {
    id: "cinnamon",
    name: "Cinnamon",
    category: "Herbs",
    calories: 247,
    protein: 4,
    carbs: 81,
    fat: 1.2,
    description: "Ground cinnamon"
  }
];

export const searchProducts = (query: string): Product[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    product.description?.toLowerCase().includes(searchTerm)
  );
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};
