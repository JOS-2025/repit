import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ForumDiscussion } from '@/components/forum-discussion';
import { 
  BookOpen, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Clock,
  ChefHat,
  Leaf,
  Tractor,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  Calendar,
  User
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  imageUrl: string;
  likes: number;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    type: 'farmer' | 'customer';
  };
  createdAt: string;
}

interface StorageTip {
  id: string;
  title: string;
  content: string;
  category: string;
  product: string;
  duration: string;
  temperature?: string;
  humidity?: string;
  tips: string[];
  imageUrl: string;
  likes: number;
  isLiked: boolean;
  author: {
    id: string;
    name: string;
    profileImage?: string;
    expertise: string;
  };
  createdAt: string;
}

interface FarmStory {
  id: string;
  title: string;
  content: string;
  category: 'farming' | 'harvest' | 'sustainability' | 'community';
  imageUrl: string;
  likes: number;
  isLiked: boolean;
  comments: number;
  author: {
    id: string;
    farmName: string;
    profileImage?: string;
    location: string;
  };
  createdAt: string;
}

export default function Community() {
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get community content
  const { data: recipes = [], isLoading: recipesLoading } = useQuery({
    queryKey: ['/api/community/recipes', searchQuery, filterCategory],
    retry: false,
  });

  const { data: storageTips = [], isLoading: tipsLoading } = useQuery({
    queryKey: ['/api/community/storage-tips', searchQuery, filterCategory],
    retry: false,
  });

  const { data: farmStories = [], isLoading: storiesLoading } = useQuery({
    queryKey: ['/api/community/farm-stories', searchQuery, filterCategory],
    retry: false,
  });

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async ({ type, id }: { type: 'recipe' | 'tip' | 'story'; id: string }) => {
      const response = await fetch(`/api/community/${type}s/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error('Failed to like item');
      }
      
      return response.json();
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: [`/api/community/${type}s`] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to like item",
        variant: "destructive",
      });
    },
  });

  const recipesArray = Array.isArray(recipes) ? recipes as Recipe[] : [];
  const tipsArray = Array.isArray(storageTips) ? storageTips as StorageTip[] : [];
  const storiesArray = Array.isArray(farmStories) ? farmStories as FarmStory[] : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = (type: 'recipe' | 'tip' | 'story', id: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }
    
    likeMutation.mutate({ type, id });
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Users className="w-10 h-10 text-green-600" />
            FramCart Community
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Share recipes, storage tips, and farm stories with our community
          </p>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{recipesArray.length}</div>
              <div className="text-sm text-gray-600">Recipes Shared</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tipsArray.length}</div>
              <div className="text-sm text-gray-600">Storage Tips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{storiesArray.length}</div>
              <div className="text-sm text-gray-600">Farm Stories</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search recipes, tips, and stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11"
                data-testid="search-community"
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="vegetables">Vegetables</SelectItem>
              <SelectItem value="fruits">Fruits</SelectItem>
              <SelectItem value="grains">Grains</SelectItem>
              <SelectItem value="herbs">Herbs</SelectItem>
            </SelectContent>
          </Select>
          
          {isAuthenticated && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700"
              data-testid="create-content"
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Content
            </Button>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="discussions" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Discussions
            </TabsTrigger>
            <TabsTrigger value="recipes" className="flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              Recipes
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Storage Tips
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2">
              <Tractor className="w-4 h-4" />
              Farm Stories
            </TabsTrigger>
          </TabsList>

          {/* Forum Discussions Tab */}
          <TabsContent value="discussions" className="space-y-6">
            <ForumDiscussion />
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-6">
            {recipesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : recipesArray.length === 0 ? (
              <Card className="text-center p-12">
                <ChefHat className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to share a delicious recipe using fresh farm produce!
                </p>
                {isAuthenticated && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Share a Recipe
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipesArray.map((recipe) => (
                  <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={recipe.imageUrl || '/api/placeholder/400/200'}
                        alt={recipe.title}
                        className="w-full h-48 object-cover"
                      />
                      <Badge
                        className={`absolute top-2 right-2 ${
                          recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {recipe.difficulty}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.cookingTime} min
                        </div>
                        <div>{recipe.servings} servings</div>
                        <Badge variant="secondary" className="text-xs">
                          {recipe.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={recipe.author.profileImage} />
                            <AvatarFallback className="text-xs">
                              {recipe.author.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">{recipe.author.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike('recipe', recipe.id)}
                            className={`p-1 ${recipe.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                            data-testid={`like-recipe-${recipe.id}`}
                          >
                            <Heart className={`w-4 h-4 ${recipe.isLiked ? 'fill-current' : ''}`} />
                            <span className="text-xs ml-1">{recipe.likes}</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Storage Tips Tab */}
          <TabsContent value="storage" className="space-y-6">
            {tipsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : tipsArray.length === 0 ? (
              <Card className="text-center p-12">
                <Leaf className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No storage tips found</h3>
                <p className="text-gray-600 mb-4">
                  Share your knowledge on how to keep produce fresh longer!
                </p>
                {isAuthenticated && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Share a Tip
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {tipsArray.map((tip) => (
                  <Card key={tip.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <img
                          src={tip.imageUrl || '/api/placeholder/120/120'}
                          alt={tip.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{tip.title}</h3>
                            <Badge variant="outline">{tip.category}</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">{tip.content}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="font-medium">Product:</span> {tip.product}
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span> {tip.duration}
                            </div>
                            {tip.temperature && (
                              <div>
                                <span className="font-medium">Temperature:</span> {tip.temperature}
                              </div>
                            )}
                            {tip.humidity && (
                              <div>
                                <span className="font-medium">Humidity:</span> {tip.humidity}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={tip.author.profileImage} />
                                <AvatarFallback className="text-xs">
                                  {tip.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="text-sm text-gray-600">{tip.author.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{tip.author.expertise}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLike('tip', tip.id)}
                                className={`p-1 ${tip.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                                data-testid={`like-tip-${tip.id}`}
                              >
                                <ThumbsUp className={`w-4 h-4 ${tip.isLiked ? 'fill-current' : ''}`} />
                                <span className="text-xs ml-1">{tip.likes}</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Farm Stories Tab */}
          <TabsContent value="stories" className="space-y-6">
            {storiesLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : storiesArray.length === 0 ? (
              <Card className="text-center p-12">
                <Tractor className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No farm stories found</h3>
                <p className="text-gray-600 mb-4">
                  Share your farming journey and inspire others in the community!
                </p>
                {isAuthenticated && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Share Your Story
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-6">
                {storiesArray.map((story) => (
                  <Card key={story.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={story.author.profileImage} />
                          <AvatarFallback>
                            {story.author.farmName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{story.author.farmName}</h4>
                              <p className="text-sm text-gray-600">{story.author.location}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-1">
                                {story.category}
                              </Badge>
                              <p className="text-xs text-gray-500">{formatDate(story.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3">{story.title}</h3>
                      
                      {story.imageUrl && (
                        <img
                          src={story.imageUrl}
                          alt={story.title}
                          className="w-full h-64 object-cover rounded-lg mb-4"
                        />
                      )}
                      
                      <p className="text-gray-700 mb-4 whitespace-pre-line">{story.content}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike('story', story.id)}
                            className={`p-1 ${story.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                            data-testid={`like-story-${story.id}`}
                          >
                            <Heart className={`w-4 h-4 ${story.isLiked ? 'fill-current' : ''}`} />
                            <span className="text-sm ml-1">{story.likes}</span>
                          </Button>
                          
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm ml-1">{story.comments}</span>
                          </Button>
                          
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                            <span className="text-sm ml-1">Share</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Content Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Share with the Community</DialogTitle>
              <DialogDescription>
                Share your recipes, storage tips, or farm stories to help others in the community.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Content Creation Coming Soon
                </h3>
                <p className="text-gray-600">
                  We're working on making it easy for you to share your knowledge with the community.
                  Stay tuned for updates!
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <Footer />
    </div>
  );
}