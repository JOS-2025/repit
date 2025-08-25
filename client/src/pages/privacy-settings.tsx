import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnonymousBrowsingMode } from '@/components/AnonymousBrowsingMode';
import Footer from '@/components/footer';
import { Shield, Eye, UserX, Database } from 'lucide-react';

export default function PrivacySettings() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-green-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Control your privacy and data preferences. Choose how FramCart collects and uses your information.
          </p>
        </div>

        {/* Privacy Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Your Privacy Matters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <UserX className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Anonymous Browsing</h3>
                <p className="text-sm text-gray-600">
                  Browse and shop without permanent data storage or tracking
                </p>
              </div>
              <div className="text-center">
                <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Data Minimization</h3>
                <p className="text-sm text-gray-600">
                  We collect only essential information needed for your orders
                </p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Security First</h3>
                <p className="text-sm text-gray-600">
                  Enterprise-grade security protects your data at all times
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anonymous Browsing Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Anonymous Browsing</CardTitle>
          </CardHeader>
          <CardContent>
            <AnonymousBrowsingMode />
          </CardContent>
        </Card>

        {/* Data Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Data Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Right to Access</h3>
                <p className="text-sm text-gray-600">
                  Request a copy of all personal data we have about you
                </p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Right to Deletion</h3>
                <p className="text-sm text-gray-600">
                  Request permanent deletion of your personal data
                </p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Right to Portability</h3>
                <p className="text-sm text-gray-600">
                  Export your data in a machine-readable format
                </p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="font-semibold text-gray-900 mb-1">Right to Correction</h3>
                <p className="text-sm text-gray-600">
                  Update or correct any inaccurate personal information
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact for Data Rights */}
        <Card>
          <CardHeader>
            <CardTitle>Exercise Your Rights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              To exercise any of your data rights, contact our privacy team:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Email:</strong> privacy@framcart.com
              </p>
              <p className="text-sm text-gray-700">
                <strong>Response Time:</strong> Within 30 days
              </p>
              <p className="text-sm text-gray-700">
                <strong>Identity Verification:</strong> Required for security
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}