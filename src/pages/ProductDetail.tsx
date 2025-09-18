import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Flame, Zap, Droplets, Target, Plus, Minus } from "lucide-react";
import { getProductById as getDbProductById, convertDbProductToProduct, DbProduct } from "@/integrations/supabase/queries";
import { Product } from "@/data/products";
import { DashboardHeader } from "@/components/yam/Header";
import { usePantry } from "@/contexts/PantryContext";
import { toast } from "sonner";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToPantry } = usePantry();
  const [product, setProduct] = useState<Product | null>(null);
  // Quantity/servings removed per requirement

  useEffect(() => {
    const loadProduct = async () => {
      if (productId) {
        try {
          const dbProduct = await getDbProductById(productId);
          if (dbProduct) {
            const convertedProduct = convertDbProductToProduct(dbProduct);
            setProduct(convertedProduct);
          } else {
            // Product not found, redirect to home
            navigate("/");
          }
        } catch (error) {
          console.error("Error loading product:", error);
          navigate("/");
        }
      }
    };
    
    loadProduct();
  }, [productId, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-muted-foreground">Product not found</h1>
            
          </div>
        </div>
      </div>
    );
  }

  // Simple totals without servings multiplier
  const totalCalories = Math.round(product.calories);
  const totalProtein = Math.round(product.protein * 10) / 10;
  const totalCarbs = Math.round(product.carbs * 10) / 10;
  const totalFat = Math.round(product.fat * 10) / 10;

  // Calculate macro percentages
  const totalMacroKcal = (totalCarbs * 4) + (totalProtein * 4) + (totalFat * 9);
  const carbsPercent = totalMacroKcal > 0 ? Math.round((totalCarbs * 4 / totalMacroKcal) * 100) : 0;
  const proteinPercent = totalMacroKcal > 0 ? Math.round((totalProtein * 4 / totalMacroKcal) * 100) : 0;
  const fatPercent = totalMacroKcal > 0 ? Math.round((totalFat * 9 / totalMacroKcal) * 100) : 0;

  const handleAddToPantry = () => {
    if (product) {
      addToPantry(product, 1);
      toast.success(`Added ${product.name} to your pantry!`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container max-w-6xl mx-auto px-4 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="soft-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="secondary">{product.category}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {product.calories} kcal
                      </span>
                      {product?.is_halal === true && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Halal</Badge>
                      )}
                      {product?.is_kosher === true && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Kosher</Badge>
                      )}
                      {product?.is_vegan === true && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">Vegan</Badge>
                      )}
                      {product?.is_vegetarian === true && (
                        <Badge className="bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300">Vegetarian</Badge>
                      )}
                      {Array.isArray((product as any)?.certifications) && (product as any).certifications.map((cert: string, idx: number) => (
                        <Badge key={`cert-${idx}`} variant="outline" className="capitalize">{cert}</Badge>
                      ))}
                    </div>
                    {product.description && (
                      <p className="text-muted-foreground">{product.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{product.calories}</div>
                      <div className="text-sm text-muted-foreground">Calories</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-blue-600">{product.protein}g</div>
                      <div className="text-sm text-muted-foreground">Protein</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-green-600">{product.carbs}g</div>
                      <div className="text-sm text-muted-foreground">Carbs</div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-orange-600">{product.fat}g</div>
                    <div className="text-sm text-muted-foreground">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Macro Breakdown */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Macro Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      Carbohydrates
                    </span>
                    <span>{carbsPercent}%</span>
                  </div>
                  <Progress value={carbsPercent} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-blue-600" />
                      Protein
                    </span>
                    <span>{proteinPercent}%</span>
                  </div>
                  <Progress value={proteinPercent} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-orange-600" />
                      Fat
                    </span>
                    <span>{fatPercent}%</span>
                  </div>
                  <Progress value={fatPercent} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-6">
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle>Quantity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold">{quantity}</div>
                    <div className="text-sm text-muted-foreground">serving{quantity !== 1 ? 's' : ''}</div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Calories:</span>
                    <span className="font-medium">{totalCalories} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein:</span>
                    <span className="font-medium">{totalProtein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs:</span>
                    <span className="font-medium">{totalCarbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat:</span>
                    <span className="font-medium">{totalFat}g</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleAddToPantry}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to My Pantry
                </Button>
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Calories per 100g:</span>
                  <span className="font-medium">{product.calories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Protein density:</span>
                  <span className="font-medium">
                    {product.calories > 0 ? Math.round((product.protein * 4 / product.calories) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fat density:</span>
                  <span className="font-medium">
                    {product.calories > 0 ? Math.round((product.fat * 9 / product.calories) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
