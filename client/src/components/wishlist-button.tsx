import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
  className?: string;
}

export default function WishlistButton({ 
  productId, 
  productName, 
  size = 'md', 
  variant = 'ghost',
  showText = false,
  className = '' 
}: WishlistButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if product is in wishlist
  const { data: isInWishlist = false } = useQuery({
    queryKey: ['/api/wishlist/check', productId],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async () => {
      const method = isInWishlist ? 'DELETE' : 'POST';
      const response = await fetch('/api/wishlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update wishlist');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist/check', productId] });
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
      
      toast({
        title: isInWishlist ? "Removed from Wishlist" : "Added to Wishlist",
        description: isInWishlist 
          ? `${productName} removed from your wishlist`
          : `${productName} added to your wishlist`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    },
  });

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1500);
      return;
    }

    toggleWishlistMutation.mutate();
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <Button
      variant={variant}
      size={size as any}
      onClick={handleToggleWishlist}
      disabled={toggleWishlistMutation.isPending}
      className={`${isInWishlist ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'} ${className}`}
      data-testid={`wishlist-${productId}`}
    >
      <Heart 
        className={`${sizeClasses[size]} ${isInWishlist ? 'fill-current' : ''}`} 
      />
      {showText && (
        <span className="ml-2">
          {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </Button>
  );
}