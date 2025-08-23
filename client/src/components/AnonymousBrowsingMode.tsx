import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { privacySettings, isAnonymousBrowsing, anonymousStorage } from '@/utils/privacy';
import { EyeOff, Eye, Shield, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AnonymousBrowsingMode() {
  const { toast } = useToast();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [dataStats, setDataStats] = useState({
    sessionItems: 0,
    cartItems: 0,
    feedbackItems: 0
  });

  useEffect(() => {
    setIsAnonymous(isAnonymousBrowsing());
    updateDataStats();
  }, []);

  const updateDataStats = () => {
    const sessionItemCount = Object.keys(sessionStorage).filter(key => 
      key.startsWith('anon_')
    ).length;
    
    const cart = anonymousStorage.get('cart') || [];
    const feedback = anonymousStorage.get('feedback') || [];
    
    setDataStats({
      sessionItems: sessionItemCount,
      cartItems: cart.length,
      feedbackItems: feedback.length
    });
  };

  const toggleAnonymousMode = (enabled: boolean) => {
    privacySettings.set({ anonymousBrowsing: enabled });
    setIsAnonymous(enabled);
    
    if (enabled) {
      // Clear tracking data when enabling
      privacySettings.enableAnonymousMode();
      toast({
        title: "Anonymous Mode Enabled",
        description: "Your browsing is now private. Data will not be stored permanently.",
      });
    } else {
      toast({
        title: "Anonymous Mode Disabled",
        description: "Normal browsing restored. Some features may collect data to improve experience.",
      });
    }
    
    updateDataStats();
  };

  const clearAllData = () => {
    anonymousStorage.clear();
    
    // Clear all anonymous session storage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('anon_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    updateDataStats();
    
    toast({
      title: "Data Cleared",
      description: "All anonymous browsing data has been removed.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Anonymous Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isAnonymous ? (
                <EyeOff className="h-5 w-5 text-green-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <Label className="font-medium text-gray-900">Anonymous Browsing</Label>
                <p className="text-sm text-gray-600">
                  Browse without permanent data storage or tracking
                </p>
              </div>
            </div>
            <Switch
              checked={isAnonymous}
              onCheckedChange={toggleAnonymousMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Status */}
      {isAnonymous && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-green-800 mb-2">Privacy Protection Active</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Your browsing activity is not tracked</li>
                  <li>• Data is stored temporarily in your browser only</li>
                  <li>• No permanent cookies or user profiles</li>
                  <li>• IP addresses are anonymized in logs</li>
                  <li>• Data automatically expires after session</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Statistics */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Temporary Data Storage</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllData}
              disabled={dataStats.sessionItems === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{dataStats.cartItems}</div>
              <div className="text-sm text-gray-600">Cart Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{dataStats.feedbackItems}</div>
              <div className="text-sm text-gray-600">Feedback</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{dataStats.sessionItems}</div>
              <div className="text-sm text-gray-600">Session Data</div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            All data will be automatically cleared when you close your browser
          </p>
        </CardContent>
      </Card>

      {/* Anonymous Features */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Anonymous Features Available</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">Browse products</span>
              <span className="text-green-600 text-sm font-medium">✓ Available</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">Add to cart</span>
              <span className="text-green-600 text-sm font-medium">✓ Available</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">Anonymous checkout</span>
              <span className="text-green-600 text-sm font-medium">✓ Available</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">Leave feedback</span>
              <span className="text-green-600 text-sm font-medium">✓ Available</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-700">Order tracking</span>
              <span className="text-yellow-600 text-sm font-medium">! Limited</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">Account features</span>
              <span className="text-gray-400 text-sm font-medium">✗ Requires login</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}