import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import WishlistButton from '@/components/wishlist-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  ShoppingCart, 
  Search, 
  Filter,
  SortAsc,
  Grid,
  List,
  Share2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    category: string;
    imageUrl: string;
    stock: number;
    farmer: {
      farmName: string;
      location: string;
    };
  };
}

export default function Wishlist() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { isAuthenticated, user, isLoading } = useAuth();
  const { toast } = useToast();

  // Get wishlist items
  const { data: wishlistItems = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ['/api/wishlist'],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center p-8 max-w-md mx-auto">
            <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-4">
              Please sign in to view your wishlist and save your favorite products
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-green-600 hover:bg-green-700"
            >
              Sign In
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const wishlistArray = Array.isArray(wishlistItems) ? wishlistItems as WishlistItem[] : [];

  // Filter and sort wishlist items
  const filteredItems = wishlistArray.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.product.farmer.farmName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'oldest':
        return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      case 'name':
        return a.product.name.localeCompare(b.product.name);
      case 'price-low':
        return a.product.price - b.product.price;
      case 'price-high':
        return b.product.price - a.product.price;
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(wishlistArray.map(item => item.product.category)));

  const formatCurrency = (amount: number) => `KSh ${amount.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const addToCart = (productId: string, productName: string) => {
    // Implement add to cart functionality
    toast({
      title: "Added to Cart",
      description: `${productName} has been added to your cart`,
    });
  };

  const shareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My FramCart Wishlist',
        text: 'Check out my wishlist on FramCart - fresh produce from local farmers!',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Wishlist link copied to clipboard",
      });
    }
  };

  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-current" />
              My Wishlist
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {wishlistArray.length} item{wishlistArray.length !== 1 ? 's' : ''} saved for later
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={shareWishlist}
              className="flex items-center gap-2"
              data-testid="share-wishlist"
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            
            <div className="flex border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
                data-testid="grid-view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
                data-testid="list-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search your wishlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-wishlist"
              />
            </div>
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category} className="capitalize">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Wishlist Items */}
        {wishlistLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : sortedItems.length === 0 ? (
          <Card className="text-center p-12">
            {searchQuery || filterCategory !== 'all' ? (
              <>
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No items match your search
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterCategory('all');
                  }}
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-600 mb-4">
                  Start adding products you love to save them for later
                </p>
                <Button
                  onClick={() => window.location.href = '/products'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Browse Products
                </Button>
              </>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }>
            {sortedItems.map((item) => (
              <Card key={item.id} className={viewMode === 'list' ? 'p-4' : ''}>
                <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-0'}>
                  <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'gap-4'}`}>
                    
                    {/* Product Image */}
                    <div className={`relative ${viewMode === 'grid' ? 'w-full h-48 mb-4' : 'w-24 h-24 flex-shrink-0'}`}>
                      <img
                        src={item.product.imageUrl || '/api/placeholder/300/200'}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      
                      {/* Stock status */}
                      {item.product.stock === 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute top-2 right-2"
                        >
                          Out of Stock
                        </Badge>
                      )}
                      
                      {/* Wishlist button */}
                      <div className="absolute top-2 left-2">
                        <WishlistButton
                          productId={item.product.id}
                          productName={item.product.name}
                          size="sm"
                          variant="ghost"
                          className="bg-white/80 hover:bg-white"
                        />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {item.product.name}
                        </h3>
                        {viewMode === 'list' && (
                          <div className="text-right ml-4">
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency(item.product.price)}
                            </p>
                            <p className="text-sm text-gray-500">
                              per {item.product.unit}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        By {item.product.farmer.farmName}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {item.product.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Added {formatDate(item.addedAt)}
                        </span>
                      </div>
                      
                      {viewMode === 'grid' && (
                        <div className="mb-3">
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(item.product.price)}
                          </p>
                          <p className="text-sm text-gray-500">
                            per {item.product.unit}
                          </p>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className={`flex gap-2 ${viewMode === 'grid' ? 'flex-col' : ''}`}>
                        <Button
                          onClick={() => addToCart(item.product.id, item.product.name)}
                          disabled={item.product.stock === 0}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                          size={viewMode === 'grid' ? 'sm' : 'default'}
                          data-testid={`add-to-cart-${item.product.id}`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {item.product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={() => window.location.href = `/products/${item.product.id}`}
                          size={viewMode === 'grid' ? 'sm' : 'default'}
                          data-testid={`view-product-${item.product.id}`}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}