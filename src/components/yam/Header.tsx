import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { YamLogo } from "./Logo";
import { Search, Sparkles, ChefHat, BookOpen, Menu, X, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { searchProducts as searchDbProducts, convertDbProductToProduct, DbProduct, testProductsExist, getAllProducts } from "@/integrations/supabase/queries";
import { Product } from "@/data/products";
import { useToast } from "@/components/ui/use-toast";
import { SearchResults } from "./SearchResults";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initial, setInitial] = useState<string>("U");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
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

  // Handle mobile menu navigation
  const handleMobileMenuNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate("/auth");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
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

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center gap-2">
          <Button 
            variant="outline" 
            aria-label="My Pantry"
            onClick={() => navigate("/pantry")}
          >
            <BookOpen className="h-4 w-4" />
            My Pantry
          </Button>

          <Button 
            variant="outline" 
            aria-label="My Meals"
            onClick={() => navigate("/meals")}
          >
            <ChefHat className="h-4 w-4" />
            My Meals
          </Button>

          <Button 
            variant="hero" 
            aria-label="Generate AI Meals"
            onClick={() => navigate("/generate")}
          >
            <Sparkles className="h-4 w-4" />
            Generate AI Meals
          </Button>
        </div>

        {/* Desktop Profile Avatar and Sign Out */}
        <div className="hidden sm:flex items-center gap-2">
          <Avatar 
            className="cursor-pointer" 
            onClick={() => navigate("/profile")}
          >
            <AvatarFallback>{initial}</AvatarFallback>
          </Avatar>
          
          <Button 
            variant="outline" 
            size="sm"
            aria-label="Sign Out"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Menu Button (replaces profile icon) */}
        <Button
          variant="ghost"
          size="sm"
          className="sm:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Box */}
          <div className="absolute top-full right-4 left-4 mt-2 z-50">
            <div className="bg-background border border-border rounded-xl shadow-2xl backdrop-blur-md bg-background/95">
              {/* Menu Header */}
              <div className="px-4 py-3 border-b border-border/50">
                <h3 className="text-sm font-semibold text-muted-foreground">Navigation</h3>
              </div>
              
              {/* Menu Items */}
              <div className="p-2 space-y-1">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 px-4 hover:bg-accent/50"
                  onClick={() => handleMobileMenuNavigation("/pantry")}
                >
                  <BookOpen className="h-4 w-4 mr-3" />
                  <span className="font-medium">My Pantry</span>
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 px-4 hover:bg-accent/50"
                  onClick={() => handleMobileMenuNavigation("/meals")}
                >
                  <ChefHat className="h-4 w-4 mr-3" />
                  <span className="font-medium">My Meals</span>
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 px-4 hover:bg-primary/10 hover:text-primary"
                  onClick={() => handleMobileMenuNavigation("/generate")}
                >
                  <Sparkles className="h-4 w-4 mr-3" />
                  <span className="font-medium">Generate AI Meals</span>
                </Button>

                {/* Profile Section */}
                <div className="border-t border-border/50 my-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-12 px-4 hover:bg-accent/50"
                    onClick={() => handleMobileMenuNavigation("/profile")}
                  >
                    <Avatar className="h-6 w-6 mr-3">
                      <AvatarFallback className="text-xs font-medium">{initial}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">Profile</span>
                  </Button>

                  <Button 
                    variant="ghost" 
                    className="w-full justify-start h-12 px-4 hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span className="font-medium">Sign Out</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
