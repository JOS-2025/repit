import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { privacySettings, isAnonymousBrowsing } from '@/utils/privacy';
import { Shield, Eye, EyeOff, Settings } from 'lucide-react';

export function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState(privacySettings.get());

  useEffect(() => {
    // Show banner if user hasn't made privacy choices
    const hasChoices = localStorage.getItem('privacy_choices_made');
    if (!hasChoices) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const newSettings = {
      allowAnalytics: true,
      allowPersonalization: true,
      allowMarketingEmails: false, // Conservative default
      anonymousBrowsing: false,
    };
    
    privacySettings.set(newSettings);
    localStorage.setItem('privacy_choices_made', 'true');
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const newSettings = {
      allowAnalytics: false,
      allowPersonalization: false,
      allowMarketingEmails: false,
      anonymousBrowsing: true,
    };
    
    privacySettings.set(newSettings);
    localStorage.setItem('privacy_choices_made', 'true');
    setIsVisible(false);
  };

  const handleCustomize = () => {
    setIsExpanded(true);
  };

  const handleSaveCustom = () => {
    privacySettings.set(settings);
    localStorage.setItem('privacy_choices_made', 'true');
    setIsVisible(false);
  };

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto border-2 border-green-200 shadow-lg">
        <CardContent className="pt-6">
          {!isExpanded ? (
            // Simple Banner
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Your Privacy Matters
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We use cookies and collect minimal data to improve your experience. 
                    You can browse anonymously or customize your privacy preferences.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleRejectAll}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <EyeOff className="h-4 w-4" />
                  Browse Anonymously
                </Button>
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Customize
                </Button>
                <Button
                  onClick={handleAcceptAll}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Accept Essential
                </Button>
              </div>
            </div>
          ) : (
            // Detailed Settings
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <Shield className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-gray-900">Privacy Preferences</h3>
              </div>

              <div className="space-y-4">
                {/* Anonymous Browsing */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium text-gray-900">Anonymous Browsing</Label>
                    <p className="text-sm text-gray-600">
                      Browse without tracking, minimal data collection, session-only storage
                    </p>
                  </div>
                  <Switch
                    checked={settings.anonymousBrowsing}
                    onCheckedChange={(checked) => updateSetting('anonymousBrowsing', checked)}
                  />
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium text-gray-900">Analytics</Label>
                    <p className="text-sm text-gray-600">
                      Help us improve the site with anonymous usage statistics
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowAnalytics && !settings.anonymousBrowsing}
                    onCheckedChange={(checked) => updateSetting('allowAnalytics', checked)}
                    disabled={settings.anonymousBrowsing}
                  />
                </div>

                {/* Personalization */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium text-gray-900">Personalization</Label>
                    <p className="text-sm text-gray-600">
                      Customize recommendations and remember your preferences
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowPersonalization && !settings.anonymousBrowsing}
                    onCheckedChange={(checked) => updateSetting('allowPersonalization', checked)}
                    disabled={settings.anonymousBrowsing}
                  />
                </div>

                {/* Marketing Emails */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-medium text-gray-900">Marketing Communications</Label>
                    <p className="text-sm text-gray-600">
                      Receive updates about new farmers and seasonal products
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMarketingEmails && !settings.anonymousBrowsing}
                    onCheckedChange={(checked) => updateSetting('allowMarketingEmails', checked)}
                    disabled={settings.anonymousBrowsing}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => setIsExpanded(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveCustom}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Privacy Status Indicator Component
export function PrivacyStatusIndicator() {
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    setIsAnonymous(isAnonymousBrowsing());
  }, []);

  if (!isAnonymous) return null;

  return (
    <div className="fixed top-20 right-4 z-40">
      <Card className="border-green-200 bg-green-50 shadow-sm">
        <CardContent className="py-2 px-3">
          <div className="flex items-center space-x-2 text-sm">
            <EyeOff className="h-4 w-4 text-green-600" />
            <span className="text-green-800 font-medium">Anonymous Mode</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}