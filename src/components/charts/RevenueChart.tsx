import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../../lib/supabase';

interface RevenueChartProps {
  transactions: Transaction[];
}

export function RevenueChart({ transactions }: RevenueChartProps) {
  const monthlyData = React.useMemo(() => {
    const monthly = new Map<string, { revenue: number; maintenance: number }>();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthly.has(monthKey)) {
        monthly.set(monthKey, { revenue: 0, maintenance: 0 });
      }
      
      const entry = monthly.get(monthKey)!;
      if (transaction.transaction_type === 'Rental') {
        entry.revenue += transaction.amount;
      } else {
        entry.maintenance += transaction.amount;
      }
    });
    
    return Array.from(monthly.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        revenue: data.revenue,
        maintenance: data.maintenance,
        profit: data.revenue - data.maintenance,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
        <Bar dataKey="maintenance" fill="#ef4444" name="Maintenance" />
        <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
      </BarChart>
    </ResponsiveContainer>
  );
}