import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Calendar, DollarSign, Filter, X } from 'lucide-react';
import { useCars } from '../hooks/useCars';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { StatusBadge } from './ui/StatusBadge';
import { CarForm } from './forms/CarForm';
import { Car } from '../lib/supabase';

export function Cars() {
  const { cars, loading, error, deleteCar } = useCars();
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    model: '',
    priceRange: { min: '', max: '' },
    expiryAlert: false,
  });

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    
    setDeleteLoading(id);
    const { error } = await deleteCar(id);
    if (error) {
      alert('Failed to delete car: ' + error);
    }
    setDeleteLoading(null);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCar(null);
  };

  const isExpiringSoon = (date: string) => {
    const expiryDate = new Date(date);
    const now = new Date();
    const timeDiff = expiryDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 30 && daysDiff > 0;
  };

  const isExpired = (date: string) => {
    const expiryDate = new Date(date);
    const now = new Date();
    return expiryDate < now;
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      model: '',
      priceRange: { min: '', max: '' },
      expiryAlert: false,
    });
  };

  // Filter cars based on current filters
  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      // Status filter
      if (filters.status && car.status !== filters.status) {
        return false;
      }

      // Model filter (case insensitive)
      if (filters.model && !car.model.toLowerCase().includes(filters.model.toLowerCase())) {
        return false;
      }

      // Price range filter
      if (filters.priceRange.min && car.purchase_price < parseFloat(filters.priceRange.min)) {
        return false;
      }
      if (filters.priceRange.max && car.purchase_price > parseFloat(filters.priceRange.max)) {
        return false;
      }

      // Expiry alert filter
      if (filters.expiryAlert) {
        const hasExpiryIssue = isExpired(car.road_tax_expiry) || 
                              isExpired(car.insurance_expiry) ||
                              isExpiringSoon(car.road_tax_expiry) || 
                              isExpiringSoon(car.insurance_expiry);
        if (!hasExpiryIssue) {
          return false;
        }
      }

      return true;
    });
  }, [cars, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cars</h1>
          <p className="text-gray-600">Manage your car fleet</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Filter className="h-5 w-5" />
            Filters
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Car
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Idle">Idle</option>
                <option value="On Rent">On Rent</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <input
                type="text"
                value={filters.model}
                onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Search by model..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range ($)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.priceRange.min}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, min: e.target.value }
                  }))}
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, max: e.target.value }
                  }))}
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.expiryAlert}
                  onChange={(e) => setFilters(prev => ({ ...prev, expiryAlert: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show expiry alerts only</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredCars.length} of {cars.length} cars
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <CarForm
          car={editingCar}
          onClose={handleFormClose}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {car.image_url && (
              <div className="h-48 overflow-hidden">
                <img
                  src={car.image_url}
                  alt={car.model}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{car.model}</h3>
                <StatusBadge status={car.status} />
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Purchase Price: ${car.purchase_price.toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Purchased: {new Date(car.purchase_date).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className={`text-sm flex justify-between ${
                  isExpired(car.road_tax_expiry) 
                    ? 'text-red-600' 
                    : isExpiringSoon(car.road_tax_expiry) 
                      ? 'text-amber-600' 
                      : 'text-gray-600'
                }`}>
                  <span>Road Tax:</span>
                  <span>{new Date(car.road_tax_expiry).toLocaleDateString()}</span>
                </div>
                <div className={`text-sm flex justify-between ${
                  isExpired(car.insurance_expiry) 
                    ? 'text-red-600' 
                    : isExpiringSoon(car.insurance_expiry) 
                      ? 'text-amber-600' 
                      : 'text-gray-600'
                }`}>
                  <span>Insurance:</span>
                  <span>{new Date(car.insurance_expiry).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(car)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(car.id)}
                  disabled={deleteLoading === car.id}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleteLoading === car.id ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && cars.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No cars match the current filters.</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {cars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No cars found. Add your first car to get started.</p>
        </div>
      )}
    </div>
  );
}