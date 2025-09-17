import { Product } from "@/data/products";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  results: Product[];
  query: string;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
}

export function SearchResults({ results, query, onClose, onSelectProduct }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>No results found for "{query}"</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border max-h-96 overflow-y-auto">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-medium">
            {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {results.map((product) => (
            <div
              key={product.id}
              className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
              onClick={() => onSelectProduct?.(product)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{product.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  
                  {product.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{product.calories} kcal</span>
                    <span>P: {product.protein}g</span>
                    <span>C: {product.carbs}g</span>
                    <span>F: {product.fat}g</span>
                    {product.nutriscore_grade && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {product.nutriscore_grade}
                      </span>
                    )}
                  </div>
                  
                  {/* Show dietary restrictions */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.is_vegan && <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">Vegan</span>}
                    {product.is_vegetarian && <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded">Vegetarian</span>}
                    {product.is_gluten_free && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">GF</span>}
                    {product.is_halal && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">Halal</span>}
                    {product.is_kosher && <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">Kosher</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
