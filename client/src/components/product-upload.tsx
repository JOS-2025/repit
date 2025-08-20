import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, MapPin } from 'lucide-react';

interface ProductUploadProps {
  farmerId?: string;
}

export default function ProductUpload({ farmerId }: ProductUploadProps) {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [harvestLocation, setHarvestLocation] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Product Uploaded Successfully!",
        description: "Your farm produce has been listed on the marketplace.",
        variant: "default",
      });
      // Reset form
      setProductName('');
      setDescription('');
      setCategory('');
      setPrice('');
      setUnit('');
      setQuantity('');
      setHarvestLocation('');
      setSelectedImages([]);
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload product. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validImages = Array.from(files).filter(file => 
        file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
      );
      
      if (validImages.length !== files.length) {
        toast({
          title: "Some files rejected",
          description: "Only image files under 5MB are allowed.",
          variant: "destructive",
        });
      }
      
      setSelectedImages(prev => [...prev, ...validImages].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('price', price);
      formData.append('unit', unit);
      formData.append('availableQuantity', quantity);
      formData.append('harvestLocation', harvestLocation);
      
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });
      
      await uploadMutation.mutateAsync(formData);
    } finally {
      setIsUploading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setHarvestLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast({
            title: "Location Captured",
            description: "Current location has been added to your product.",
            variant: "default",
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enter manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto" data-testid="product-upload-form">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <Upload className="w-5 h-5" />
          Upload Farm Produce
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g., Fresh Tomatoes"
                required
                data-testid="input-product-name"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                required
                data-testid="select-category"
              >
                <option value="">Select category...</option>
                <option value="fruits">Fruits</option>
                <option value="vegetables">Vegetables</option>
                <option value="grains">Grains</option>
                <option value="dairy">Dairy</option>
                <option value="herbs">Herbs</option>
                <option value="others">Others</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your produce quality, farming method, etc."
              rows={3}
              data-testid="textarea-description"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price per Unit (KSh) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="100.00"
                required
                data-testid="input-price"
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800"
                required
                data-testid="select-unit"
              >
                <option value="">Select unit...</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="piece">Piece</option>
                <option value="bunch">Bunch</option>
                <option value="bag">Bag</option>
                <option value="liter">Liter</option>
              </select>
            </div>

            <div>
              <Label htmlFor="quantity">Available Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="50"
                required
                data-testid="input-quantity"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="harvestLocation">Harvest/Farm Location</Label>
            <div className="flex gap-2">
              <Input
                id="harvestLocation"
                type="text"
                value={harvestLocation}
                onChange={(e) => setHarvestLocation(e.target.value)}
                placeholder="Enter location or use GPS"
                data-testid="input-location"
              />
              <Button 
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                data-testid="button-get-location"
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This helps customers know where the produce is coming from
            </p>
          </div>

          <div>
            <Label>Product Images (Max 5 images, 5MB each)</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="images" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                  data-testid="image-upload-area"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> product images
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, JPEG (MAX. 5MB per image)
                    </p>
                  </div>
                  <input 
                    id="images" 
                    type="file" 
                    className="hidden" 
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    data-testid="input-images"
                  />
                </label>
              </div>
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`button-remove-image-${index}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isUploading || uploadMutation.isPending}
            data-testid="button-upload-product"
          >
            {isUploading || uploadMutation.isPending ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Product
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}