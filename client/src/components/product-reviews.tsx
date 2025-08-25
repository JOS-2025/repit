import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
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

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: string;
  user: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get reviews for the product
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/reviews', productId],
    retry: false,
  });

  // Get review statistics
  const { data: reviewStats } = useQuery({
    queryKey: ['/api/reviews/stats', productId],
    retry: false,
  });

  // Check if user can review (has purchased the product)
  const { data: canReview = false } = useQuery({
    queryKey: ['/api/reviews/can-review', productId],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  // Check if user has already reviewed
  const { data: userReview } = useQuery({
    queryKey: ['/api/reviews/user-review', productId],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  const reviewsArray = Array.isArray(reviews) ? reviews as Review[] : [];
  const stats = reviewStats as ReviewStats;

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: newRating,
          comment: newComment.trim(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setShowReviewForm(false);
      setNewRating(0);
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['/api/reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/stats', productId] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/user-review', productId] });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    },
  });

  // Mark review as helpful/unhelpful
  const markHelpfulMutation = useMutation({
    mutationFn: async ({ reviewId, helpful }: { reviewId: string; helpful: boolean }) => {
      const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ helpful }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark review');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews', productId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark review",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = () => {
    if (newRating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    if (newComment.trim().length < 10) {
      toast({
        title: "Comment Too Short",
        description: "Please write at least 10 characters in your review",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate();
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md', interactive: boolean = false) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
    };
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= (interactive ? hoveredRating || newRating : rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setNewRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      
      {/* Review Statistics */}
      {stats ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              Customer Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stats.averageRating.toFixed(1)}
                </div>
                {renderStars(stats.averageRating, 'lg')}
                <p className="text-sm text-gray-600 mt-2">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {stats.ratingDistribution.map((dist) => (
                  <div key={dist.rating} className="flex items-center gap-2">
                    <span className="text-sm w-6">{dist.rating}</span>
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1">
                      <Progress value={dist.percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {dist.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Write Review Section */}
      {isAuthenticated && canReview && !userReview ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Write a Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showReviewForm ? (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="write-review-button"
              >
                Share Your Experience
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Rating
                  </label>
                  {renderStars(newRating, 'lg', true)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Review
                  </label>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={`Tell others about your experience with ${productName}...`}
                    className="min-h-[100px]"
                    data-testid="review-comment"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters ({newComment.length}/10)
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitReviewMutation.isPending || newRating === 0}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="submit-review"
                  >
                    {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewRating(0);
                      setNewComment('');
                    }}
                    data-testid="cancel-review"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* User's existing review */}
      {userReview ? (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              Your Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {renderStars((userReview as Review).rating)}
              <p className="text-gray-700">{(userReview as Review).comment}</p>
              <p className="text-sm text-gray-500">
                Reviewed on {formatDate((userReview as Review).createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Login prompt for non-authenticated users */}
      {!isAuthenticated && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <User className="w-8 h-8 mx-auto text-blue-600 mb-2" />
            <p className="text-blue-800 font-medium mb-2">Sign in to write a review</p>
            <p className="text-blue-600 text-sm mb-3">
              Share your experience with {productName}
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Reviews ({reviewsArray.length})
        </h3>
        
        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : reviewsArray.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h4>
              <p className="text-gray-600">
                Be the first to share your experience with {productName}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviewsArray.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={review.user.profileImageUrl} />
                      <AvatarFallback>
                        {getInitials(review.user.firstName, review.user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {review.user.firstName} {review.user.lastName}
                        </h4>
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{review.comment}</p>
                      
                      {/* Helpful buttons */}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">Was this helpful?</span>
                        <button
                          onClick={() => markHelpfulMutation.mutate({ 
                            reviewId: review.id, 
                            helpful: true 
                          })}
                          disabled={markHelpfulMutation.isPending}
                          className="flex items-center gap-1 text-gray-600 hover:text-green-600"
                          data-testid={`helpful-${review.id}`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Yes ({review.helpfulCount})
                        </button>
                        <button
                          onClick={() => markHelpfulMutation.mutate({ 
                            reviewId: review.id, 
                            helpful: false 
                          })}
                          disabled={markHelpfulMutation.isPending}
                          className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                          data-testid={`unhelpful-${review.id}`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          No ({review.unhelpfulCount})
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}