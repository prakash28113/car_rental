import React from 'react';
import { User, Shield, Database, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Settings() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Account Information
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Admin
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Sign In</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Row Level Security</p>
                  <p className="text-sm text-gray-500">Database access is restricted by admin role</p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Form Validation</p>
                  <p className="text-sm text-gray-500">Client-side validation with Zod</p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Secure File Upload</p>
                  <p className="text-sm text-gray-500">Image uploads via Supabase Storage</p>
                </div>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Protected
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              System Information
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Backend</dt>
                <dd className="mt-1 text-sm text-gray-900">Supabase (PostgreSQL)</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Authentication</dt>
                <dd className="mt-1 text-sm text-gray-900">Supabase Auth</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Storage</dt>
                <dd className="mt-1 text-sm text-gray-900">Supabase Storage</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Frontend</dt>
                <dd className="mt-1 text-sm text-gray-900">React + TypeScript + Tailwind CSS</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Application Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Application Info
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Car Rental Management System</p>
                <p className="text-sm text-gray-500">
                  Comprehensive solution for managing car rental business operations including
                  fleet management, transaction tracking, and revenue analytics.
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Features</p>
                <ul className="mt-1 text-sm text-gray-500 list-disc list-inside space-y-1">
                  <li>Car fleet management with image uploads</li>
                  <li>Transaction tracking (rentals & maintenance)</li>
                  <li>Revenue dashboard with interactive charts</li>
                  <li>Car status management and expiry alerts</li>
                  <li>Role-based admin authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}