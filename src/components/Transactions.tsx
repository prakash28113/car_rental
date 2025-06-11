import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Calendar, DollarSign, Filter, X } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ErrorMessage } from './ui/ErrorMessage';
import { TransactionForm } from './forms/TransactionForm';

export function Transactions() {
  const { transactions, loading, error, deleteTransaction } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    carModel: '',
    amountRange: { min: '', max: '' },
    dateRange: { start: '', end: '' },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    setDeleteLoading(id);
    const { error } = await deleteTransaction(id);
    if (error) {
      alert('Failed to delete transaction: ' + error);
    }
    setDeleteLoading(null);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      carModel: '',
      amountRange: { min: '', max: '' },
      dateRange: { start: '', end: '' },
    });
  };

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Type filter
      if (filters.type && transaction.transaction_type !== filters.type) {
        return false;
      }

      // Car model filter (case insensitive)
      if (filters.carModel && transaction.cars?.model && 
          !transaction.cars.model.toLowerCase().includes(filters.carModel.toLowerCase())) {
        return false;
      }

      // Amount range filter
      if (filters.amountRange.min && transaction.amount < parseFloat(filters.amountRange.min)) {
        return false;
      }
      if (filters.amountRange.max && transaction.amount > parseFloat(filters.amountRange.max)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start) {
        const transactionDate = new Date(transaction.created_at);
        const startDate = new Date(filters.dateRange.start);
        if (transactionDate < startDate) {
          return false;
        }
      }
      if (filters.dateRange.end) {
        const transactionDate = new Date(transaction.created_at);
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        if (transactionDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filters]);

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

  const totalRevenue = filteredTransactions
    .filter(t => t.transaction_type === 'Rental')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMaintenance = filteredTransactions
    .filter(t => t.transaction_type === 'Maintenance')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Track rental income and maintenance costs</p>
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
            Add Transaction
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
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="Rental">Rental</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Car Model
              </label>
              <input
                type="text"
                value={filters.carModel}
                onChange={(e) => setFilters(prev => ({ ...prev, carModel: e.target.value }))}
                placeholder="Search by car model..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Range ($)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.amountRange.min}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    amountRange: { ...prev.amountRange, min: e.target.value }
                  }))}
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  value={filters.amountRange.max}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    amountRange: { ...prev.amountRange, max: e.target.value }
                  }))}
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length} transactions
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
        <TransactionForm onClose={() => setShowForm(false)} />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {showFilters && (filters.type || filters.carModel || filters.amountRange.min || filters.amountRange.max || filters.dateRange.start || filters.dateRange.end) 
                  ? 'Filtered Revenue' 
                  : 'Total Revenue'
                }
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {showFilters && (filters.type || filters.carModel || filters.amountRange.min || filters.amountRange.max || filters.dateRange.start || filters.dateRange.end) 
                  ? 'Filtered Maintenance' 
                  : 'Total Maintenance'
                }
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalMaintenance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                {showFilters && (filters.type || filters.carModel || filters.amountRange.min || filters.amountRange.max || filters.dateRange.start || filters.dateRange.end) 
                  ? 'Filtered Net Profit' 
                  : 'Net Profit'
                }
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                ${(totalRevenue - totalMaintenance).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            All Transactions
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Complete list of rental and maintenance transactions
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.cars?.model || 'Unknown Car'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      transaction.transaction_type === 'Rental'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {transaction.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      disabled={deleteLoading === transaction.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deleteLoading === transaction.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && transactions.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No transactions match the current filters.</p>
          <button
            onClick={clearFilters}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No transactions found. Add your first transaction to get started.</p>
        </div>
      )}
    </div>
  );
}