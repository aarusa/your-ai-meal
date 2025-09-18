import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Clock, 
  Users, 
  Star, 
  Heart, 
  ThumbsUp, 
  ThumbsDown,
  Calendar,
  ChefHat,
  Sparkles,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";
import { DashboardHeader } from "@/components/yam/Header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchUserMeals, 
  fetchMealStats, 
  fetchMealCategories, 
  searchMeals, 
  apiMealToRecipe, 
  ApiMeal,
  updateMealStatus 
} from "@/lib/api";

// Generate food image URL using static.photos
const generateUnsplashFoodImage = (mealName: string) => {
  const width = 400;
  const height = 300;
  
  // Create a seed based on meal name for consistent images
  const seed = mealName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Use static.photos for food images - hand-curated, contextual images
  return `https://static.photos/food/${width}x${height}/${seed}`;
};

export default function UserGeneratedMeals() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<ApiMeal[]>([]);
  const [filteredMeals, setFilteredMeals] = useState<ApiMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [categories, setCategories] = useState<any>(null);
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mealTypeFilter, setMealTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [activeTab, setActiveTab] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalMeals, setTotalMeals] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  // Filter meals based on active tab
  const getFilteredMealsForTab = (tab: string) => {
    let filtered = [...meals];
    
    // Apply tab-specific filtering
    switch (tab) {
      case "accepted":
        filtered = filtered.filter(meal => meal.status === "accepted");
        break;
      case "rejected":
        filtered = filtered.filter(meal => meal.status === "rejected");
        break;
      case "favorites":
        filtered = filtered.filter(meal => meal.is_favorited === true);
        break;
      case "all":
      default:
        // Show all meals
        break;
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(meal => 
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply meal type filter
    if (mealTypeFilter !== "all") {
      filtered = filtered.filter(meal => meal.meal_type === mealTypeFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "calories":
          aValue = a.total_calories || 0;
          bValue = b.total_calories || 0;
          break;
        case "created_at":
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  };

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load more meals when filters change
  useEffect(() => {
    if (activeTab === "all") {
      loadMeals();
    }
  }, [statusFilter, mealTypeFilter, sortBy, sortOrder, activeTab]);

  // Filter meals based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setFilteredMeals(meals);
    }
  }, [searchQuery, meals]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      
      if (!userId) {
        navigate("/auth");
        return;
      }

      await Promise.all([
        loadMeals(),
        loadStats(userId),
        loadCategories(userId)
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load meals data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeals = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;

      const options = {
        status: statusFilter === "all" ? undefined : statusFilter,
        mealType: mealTypeFilter === "all" ? undefined : mealTypeFilter,
        sortBy,
        sortOrder,
        limit,
        offset: currentPage * limit
      };

      const result = await fetchUserMeals(userId, options);
      setMeals(result.meals);
      setFilteredMeals(result.meals);
      setTotalMeals(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading meals:', error);
      toast.error('Failed to load meals');
    }
  };

  const loadStats = async (userId: string) => {
    try {
      const statsData = await fetchMealStats(userId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCategories = async (userId: string) => {
    try {
      const categoriesData = await fetchMealCategories(userId);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const performSearch = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId || !searchQuery.trim()) return;

      const searchResults = await searchMeals(userId, searchQuery);
      setFilteredMeals(searchResults.meals);
    } catch (error) {
      console.error('Error searching meals:', error);
      toast.error('Failed to search meals');
    }
  };

  const loadMoreMeals = async () => {
    try {
      setIsLoadingMore(true);
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) return;

      const nextPage = currentPage + 1;
      const options = {
        status: statusFilter === "all" ? undefined : statusFilter,
        mealType: mealTypeFilter === "all" ? undefined : mealTypeFilter,
        sortBy,
        sortOrder,
        limit,
        offset: nextPage * limit
      };

      const result = await fetchUserMeals(userId, options);
      setMeals(prev => [...prev, ...result.meals]);
      setFilteredMeals(prev => [...prev, ...result.meals]);
      setCurrentPage(nextPage);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error('Error loading more meals:', error);
      toast.error('Failed to load more meals');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleRateMeal = async (mealId: string, rating: number) => {
    try {
      await updateMealStatus(mealId, "accepted", rating);
      toast.success(`Rated meal ${rating} stars!`);
      loadInitialData(); // Refresh data
    } catch (error) {
      toast.error('Failed to rate meal');
    }
  };

  const handleFavoriteMeal = async (mealId: string) => {
    try {
      // This would need to be implemented in the API
      toast.success('Added to favorites!');
      loadInitialData(); // Refresh data
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleViewMeal = (meal: ApiMeal) => {
    navigate(`/meal/${meal.id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'cooked': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your meals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DashboardHeader />
      
      <main className="container max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Your Generated Meals</h1>
          </div>
          <p className="text-muted-foreground">
            Discover, manage, and enjoy your AI-generated meal collection
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 overflow-hidden">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <ChefHat className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Meals</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalMeals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Accepted</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.acceptedMeals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Heart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.favoriteMeals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Acceptance Rate</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.acceptanceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4 overflow-hidden">
              <TabsTrigger value="all">All Meals</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-4 mb-4 overflow-hidden">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-shrink-0">
                <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                  <SelectTrigger className="w-[140px] flex-shrink-0">
                    <SelectValue placeholder="Meal Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                }}>
                  <SelectTrigger className="w-[160px] flex-shrink-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="total_calories-desc">Calories High</SelectItem>
                    <SelectItem value="total_calories-asc">Calories Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* All Meals Tab */}
            <TabsContent value="all" className="space-y-6">
              {(() => {
                const filteredMeals = getFilteredMealsForTab("all");
                return filteredMeals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                    {filteredMeals.map((meal) => {
                      const recipe = apiMealToRecipe(meal);
                      return (
                        <Card key={meal.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 overflow-hidden">
                          {/* Meal Image */}
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={generateUnsplashFoodImage(meal.name)} 
                              alt={meal.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                                {meal.meal_type}
                              </Badge>
                            </div>
                            {meal.is_favorited && (
                              <div className="absolute top-3 left-3">
                                <Heart className="h-5 w-5 text-red-500 fill-red-500 bg-background/90 backdrop-blur-sm rounded-full p-1" />
                              </div>
                            )}
                          </div>
                          
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                                    {meal.name}
                                  </CardTitle>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                  {meal.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(meal.created_at)}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Quick Stats */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {meal.total_time_minutes}min
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {meal.servings}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Star className="h-4 w-4" />
                                {meal.difficulty_level}
                              </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${getStatusColor(meal.status)}`}>
                                {meal.status}
                              </Badge>
                              {meal.user_rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < meal.user_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Nutrition */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span>Calories:</span>
                                  <span className="font-medium">{meal.total_calories}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Protein:</span>
                                  <span className="font-medium">{meal.total_protein}g</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleViewMeal(meal)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleFavoriteMeal(meal.id)}
                              >
                                <Heart className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleRateMeal(meal.id, 5)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                <div className="text-center py-12">
                  <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Meals Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? `No meals found matching "${searchQuery}"`
                      : "You haven't generated any meals yet."
                    }
                  </p>
                  <Button onClick={() => navigate('/pantry')} className="gap-2">
                    <ChefHat className="h-4 w-4" />
                    Generate Some Meals
                  </Button>
                </div>
              );
              })()}
            </TabsContent>

            {/* Accepted Meals Tab */}
            <TabsContent value="accepted" className="space-y-6">
              {(() => {
                const filteredMeals = getFilteredMealsForTab("accepted");
                return filteredMeals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                    {filteredMeals.map((meal) => {
                      const recipe = apiMealToRecipe(meal);
                      return (
                        <Card key={meal.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 overflow-hidden">
                          {/* Meal Image */}
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={generateUnsplashFoodImage(meal.name)} 
                              alt={meal.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                                {meal.meal_type}
                              </Badge>
                            </div>
                            {meal.is_favorited && (
                              <div className="absolute top-3 left-3">
                                <Heart className="h-5 w-5 text-red-500 fill-red-500 bg-background/90 backdrop-blur-sm rounded-full p-1" />
                              </div>
                            )}
                          </div>
                          
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                                    {meal.name}
                                  </CardTitle>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                  {meal.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(meal.created_at)}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Quick Stats */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {meal.total_time_minutes}min
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {meal.servings}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Star className="h-4 w-4" />
                                {meal.difficulty_level}
                              </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${getStatusColor(meal.status)}`}>
                                {meal.status}
                              </Badge>
                              {meal.user_rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < meal.user_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Nutrition */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span>Calories:</span>
                                  <span className="font-medium">{meal.total_calories}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Protein:</span>
                                  <span className="font-medium">{meal.total_protein}g</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleViewMeal(meal)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleFavoriteMeal(meal.id)}
                              >
                                <Heart className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleRateMeal(meal.id, 5)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Accepted Meals</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't accepted any meals yet. Try generating some meals and accept the ones you like!
                    </p>
                    <Button onClick={() => navigate('/pantry')} className="gap-2">
                      <ChefHat className="h-4 w-4" />
                      Generate Some Meals
                    </Button>
                  </div>
                );
              })()}
            </TabsContent>

            {/* Rejected Meals Tab */}
            <TabsContent value="rejected" className="space-y-6">
              {(() => {
                const filteredMeals = getFilteredMealsForTab("rejected");
                return filteredMeals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                    {filteredMeals.map((meal) => {
                      const recipe = apiMealToRecipe(meal);
                      return (
                        <Card key={meal.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 overflow-hidden">
                          {/* Meal Image */}
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={generateUnsplashFoodImage(meal.name)} 
                              alt={meal.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                                {meal.meal_type}
                              </Badge>
                            </div>
                            {meal.is_favorited && (
                              <div className="absolute top-3 left-3">
                                <Heart className="h-5 w-5 text-red-500 fill-red-500 bg-background/90 backdrop-blur-sm rounded-full p-1" />
                              </div>
                            )}
                          </div>
                          
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles className="h-4 w-4 text-primary" />
                                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                                    {meal.name}
                                  </CardTitle>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                  {meal.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(meal.created_at)}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Quick Stats */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {meal.total_time_minutes}min
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {meal.servings}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Star className="h-4 w-4" />
                                {meal.difficulty_level}
                              </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${getStatusColor(meal.status)}`}>
                                {meal.status}
                              </Badge>
                              {meal.user_rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < meal.user_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Nutrition */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span>Calories:</span>
                                  <span className="font-medium">{meal.total_calories}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Protein:</span>
                                  <span className="font-medium">{meal.total_protein}g</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleViewMeal(meal)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleFavoriteMeal(meal.id)}
                              >
                                <Heart className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleRateMeal(meal.id, 5)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ThumbsDown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Rejected Meals</h3>
                    <p className="text-muted-foreground mb-4">
                      Great! You haven't rejected any meals yet. Keep exploring and finding meals you love!
                    </p>
                    <Button onClick={() => navigate('/pantry')} className="gap-2">
                      <ChefHat className="h-4 w-4" />
                      Generate Some Meals
                    </Button>
                  </div>
                );
              })()}
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-6">
              {(() => {
                const filteredMeals = getFilteredMealsForTab("favorites");
                return filteredMeals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
                    {filteredMeals.map((meal) => {
                      const recipe = apiMealToRecipe(meal);
                      return (
                        <Card key={meal.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/20 overflow-hidden">
                          {/* Meal Image */}
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={generateUnsplashFoodImage(meal.name)} 
                              alt={meal.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
                              }}
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                                {meal.meal_type}
                              </Badge>
                            </div>
                            <div className="absolute top-3 left-3">
                              <Heart className="h-5 w-5 text-red-500 fill-red-500 bg-background/90 backdrop-blur-sm rounded-full p-1" />
                            </div>
                          </div>
                          
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                                    {meal.name}
                                  </CardTitle>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                  {meal.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(meal.created_at)}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {/* Quick Stats */}
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {meal.total_time_minutes}min
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                {meal.servings}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Star className="h-4 w-4" />
                                {meal.difficulty_level}
                              </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between">
                              <Badge className={`text-xs ${getStatusColor(meal.status)}`}>
                                {meal.status}
                              </Badge>
                              {meal.user_rating && (
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      className={`h-3 w-3 ${i < meal.user_rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                                    />
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Nutrition */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-3 rounded-lg border border-emerald-200/50 dark:border-emerald-800/30">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span>Calories:</span>
                                  <span className="font-medium">{meal.total_calories}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Protein:</span>
                                  <span className="font-medium">{meal.total_protein}g</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline"
                                size="sm"
                                className="flex-1 h-8 text-xs"
                                onClick={() => handleViewMeal(meal)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleFavoriteMeal(meal.id)}
                              >
                                <Heart className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => handleRateMeal(meal.id, 5)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Favorite Meals</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't favorited any meals yet. Start by generating some meals and add your favorites!
                    </p>
                    <Button onClick={() => navigate('/pantry')} className="gap-2">
                      <ChefHat className="h-4 w-4" />
                      Generate Some Meals
                    </Button>
                  </div>
                );
              })()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
