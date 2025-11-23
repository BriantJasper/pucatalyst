import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ManageCourses() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Manage Courses</h1>
          <p className="text-gray-600 mb-6">This page is under construction.</p>
          <p className="text-sm text-gray-500">Coming soon with full functionality!</p>
        </div>
      </div>
    </div>
  );
}
