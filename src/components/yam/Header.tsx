import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { YamLogo } from "./Logo";
import { Search, Sparkles, ChefHat, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { searchProducts as searchDbProducts, convertDbProductToProduct, DbProduct, testProductsExist, getAllProducts } from "@/integrations/supabase/queries";
import { Product } from "@/data/products";
import { SearchResults } from "./SearchResults";

export function DashboardHeader() {
  const navigate = useNavigate();
  const [initial, setInitial] = useState<string>("U");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      const meta: any = (user?.user_metadata as any) || {};
      const firstName: string | undefined = meta.first_name || (meta.full_name ? String(meta.full_name).split(" ")[0] : undefined);
      const name: string | undefined = firstName || meta.name || meta.full_name;
      const email: string | undefined = user?.email || undefined;
      const source = name && String(name).trim().length > 0 ? String(name) : email;
      if (source && source.length > 0) {
        const ch = source.trim().charAt(0).toUpperCase();
        setInitial(ch);
      }
      
      // Test if products exist in database
      const productsExist = await testProductsExist();
      console.log("Products exist in database:", productsExist);
      
      // Get all products for debugging
      const allProducts = await getAllProducts();
      console.log("All products in database:", allProducts);
    };
    load();
  }, []);

  // Handle search input changes
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    console.log("Search query changed:", query);
    
    if (query.trim().length > 0) {
      try {
        console.log("Searching database for:", query);
        const dbResults = await searchDbProducts(query);
        console.log("Database results:", dbResults);
        const convertedResults = dbResults.map(convertDbProductToProduct);
        console.log("Converted results:", convertedResults);
        setSearchResults(convertedResults);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
        setShowResults(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Handle product selection
  const handleSelectProduct = (product: Product) => {
    console.log("Selected product:", product);
    // Navigate to product detail page
    navigate(`/product/${product.id}`);
    setSearchQuery("");
    setShowResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <header className="has-spotlight sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
        <YamLogo onClick={() => navigate("/")}/>

        <div className="relative flex-1" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search meals, ingredients, or goals…"
            className="pl-9 bg-secondary/60"
            aria-label="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim().length > 0 && setShowResults(true)}
          />
          
          {showResults && (
            <SearchResults
              results={searchResults}
              query={searchQuery}
              onClose={() => setShowResults(false)}
              onSelectProduct={handleSelectProduct}
            />
          )}
        </div>

        <Button 
          variant="outline" 
          className="hidden sm:inline-flex" 
          aria-label="My Pantry"
          onClick={() => navigate("/pantry")}
        >
          <BookOpen className="h-4 w-4" />
          My Pantry
        </Button>

        <Button 
          variant="outline" 
          className="hidden sm:inline-flex" 
          aria-label="My Meals"
          onClick={() => navigate("/meals")}
        >
          <ChefHat className="h-4 w-4" />
          My Meals
        </Button>

        <Button 
          variant="hero" 
          className="hidden sm:inline-flex" 
          aria-label="Generate Meal Plan"
          onClick={() => navigate("/plan")}
        >
          <Sparkles className="h-4 w-4" />
          Generate Meal Plan
        </Button>

        <Avatar 
          className="cursor-pointer" 
          onClick={() => navigate("/profile")}
        >
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
