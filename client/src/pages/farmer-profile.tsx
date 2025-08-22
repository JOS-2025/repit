import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, Phone, Mail, Globe, Verified, ThumbsUp, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

type FarmerDetails = {
  id: string;
  farmName: string;
  location: string;
  farmSize?: string;
  description?: string;
  bio?: string;
  farmingPractices?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  averageRating?: string;
  totalRatings?: number;
  isVerified: boolean;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
};

type FarmerRating = {
  id: string;
  rating: number;
  comment?: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
};

type RatingStats = {
  totalRatings: number;
  averageRating: string;
  ratingDistribution: Record<number, number>;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: string;
  unit: string;
  imageUrl?: string;
};

type RatingEligibility = {
  canRate: boolean;
  hasPurchased: boolean;
  hasRated: boolean;
};

function StarRating({ rating, onRatingChange, readonly = false, size = "w-5 h-5" }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: string;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          } ${readonly ? "cursor-default" : "cursor-pointer hover:text-yellow-400"}`}
          onClick={() => !readonly && onRatingChange && onRatingChange(star)}
          data-testid={`star-${star}`}
        />
      ))}
    </div>
  );
}

function FarmerRating({ farmerId }: { farmerId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showRatingForm, setShowRatingForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ratingEligibility, isLoading: loadingEligibility } = useQuery<RatingEligibility>({
    queryKey: [`/api/farmers/${farmerId}/can-rate`],
    enabled: !!user,
  });

  const createRatingMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      return await apiRequest("POST", `/api/farmers/${farmerId}/ratings`, data);
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
      setShowRatingForm(false);
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: [`/api/farmers/${farmerId}/ratings`] });
      queryClient.invalidateQueries({ queryKey: [`/api/farmers/${farmerId}/rating-stats`] });
      queryClient.invalidateQueries({ queryKey: [`/api/farmers/${farmerId}/can-rate`] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const handleSubmitRating = () => {
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please add a comment with your rating",
        variant: "destructive",
      });
      return;
    }
    createRatingMutation.mutate({ rating, comment });
  };

  if (loadingEligibility) {
    return <div className="text-center py-4">Loading rating options...</div>;
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            <a href="/api/login" className="text-blue-600 hover:underline">
              Sign in
            </a>{" "}
            to rate this farmer
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!ratingEligibility?.hasPurchased) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600">
            You can rate farmers after making a purchase from them
          </p>
        </CardContent>
      </Card>
    );
  }

  if (ratingEligibility?.hasRated) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-green-600">✓ You have already rated this farmer</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate this Farmer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showRatingForm ? (
          <Button 
            onClick={() => setShowRatingForm(true)}
            className="w-full"
            data-testid="button-write-review"
          >
            Write a Review
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Rating</label>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Comment</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this farmer..."
                className="min-h-[100px]"
                data-testid="textarea-comment"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitRating}
                disabled={createRatingMutation.isPending || !comment.trim()}
                data-testid="button-submit-rating"
              >
                {createRatingMutation.isPending ? "Submitting..." : "Submit Rating"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowRatingForm(false)}
                data-testid="button-cancel-rating"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FarmerReviews({ farmerId }: { farmerId: string }) {
  const { data: ratings = [], isLoading } = useQuery<FarmerRating[]>({
    queryKey: [`/api/farmers/${farmerId}/ratings`],
  });

  const { data: stats } = useQuery<RatingStats>({
    queryKey: [`/api/farmers/${farmerId}/rating-stats`],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">
                  {parseFloat(stats.averageRating || "0").toFixed(1)}
                </div>
                <StarRating 
                  rating={Math.round(parseFloat(stats.averageRating || "0"))} 
                  readonly 
                />
                <p className="text-gray-600 text-sm">
                  Based on {stats.totalRatings} reviews
                </p>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-4">{star}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${
                            stats.totalRatings > 0
                              ? (stats.ratingDistribution[star] / stats.totalRatings) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {stats.ratingDistribution[star] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Reviews */}
      {ratings.length > 0 ? (
        <div className="space-y-4">
          {ratings.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.user.profileImageUrl} />
                    <AvatarFallback>
                      {review.user.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">
                        {review.user.firstName} {review.user.lastName || ""}
                      </span>
                      <StarRating rating={review.rating} readonly size="w-4 h-4" />
                      {review.isVerifiedPurchase && (
                        <Badge variant="secondary" className="text-xs">
                          <Verified className="w-3 h-3 mr-1" />
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{review.comment}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {review.helpfulCount > 0 && (
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {review.helpfulCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">No reviews yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FarmerProfile() {
  const { id } = useParams();
  const { data: farmer, isLoading, error } = useQuery<FarmerDetails>({
    queryKey: [`/api/farmers/${id}`],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: [`/api/farmers/${id}/products`],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">
              {error?.message || "Farmer not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6" data-testid="farmer-profile">
      {/* Cover/Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-green-400 to-green-600 rounded-lg overflow-hidden">
        {farmer.coverImageUrl && (
          <img
            src={farmer.coverImageUrl}
            alt="Farm cover"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <div className="flex items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-white">
              <AvatarImage src={farmer.profileImageUrl} />
              <AvatarFallback className="text-2xl">
                {farmer.farmName?.[0] || "F"}
              </AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-farm-name">
                {farmer.farmName}
                {farmer.isVerified && (
                  <Badge className="bg-blue-600">
                    <Verified className="w-4 h-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </h1>
              <p className="text-lg opacity-90" data-testid="text-location">
                <MapPin className="w-4 h-4 inline mr-1" />
                {farmer.location}
              </p>
              {farmer.averageRating && parseFloat(farmer.averageRating) > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating 
                    rating={Math.round(parseFloat(farmer.averageRating))} 
                    readonly 
                    size="w-4 h-4"
                  />
                  <span className="text-sm">
                    {parseFloat(farmer.averageRating).toFixed(1)} ({farmer.totalRatings} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle>About Our Farm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {farmer.bio && (
                <div>
                  <h3 className="font-semibold mb-2">Our Story</h3>
                  <p className="text-gray-700" data-testid="text-bio">{farmer.bio}</p>
                </div>
              )}
              {farmer.description && (
                <div>
                  <h3 className="font-semibold mb-2">Farm Description</h3>
                  <p className="text-gray-700" data-testid="text-description">{farmer.description}</p>
                </div>
              )}
              {farmer.farmingPractices && (
                <div>
                  <h3 className="font-semibold mb-2">Farming Practices</h3>
                  <p className="text-gray-700" data-testid="text-farming-practices">{farmer.farmingPractices}</p>
                </div>
              )}
              {farmer.farmSize && (
                <div>
                  <h3 className="font-semibold mb-2">Farm Size</h3>
                  <p className="text-gray-700">{farmer.farmSize} acres</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Section */}
          <Card>
            <CardHeader>
              <CardTitle>Our Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-semibold" data-testid={`text-product-name-${product.id}`}>{product.name}</h4>
                      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-600" data-testid={`text-price-${product.id}`}>
                          ₹{product.price}/{product.unit}
                        </span>
                        <Button size="sm" variant="outline" data-testid={`button-view-product-${product.id}`}>
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No products available</p>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <FarmerReviews farmerId={id!} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {farmer.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span data-testid="text-phone">{farmer.phoneNumber}</span>
                </div>
              )}
              {farmer.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span data-testid="text-email">{farmer.email}</span>
                </div>
              )}
              {farmer.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a href={farmer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" data-testid="link-website">
                    Visit Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Component */}
          <FarmerRating farmerId={id!} />
        </div>
      </div>
    </div>
  );
}