import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileText, TrendingUp, DollarSign, Users, Download } from 'lucide-react';
import { analyticsAPI } from '../utils/api';
import { toast } from 'sonner';
import { exportAnalyticsToPDF } from '../utils/pdfExport';

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, trendsRes] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getTrends()
      ]);
      setStats(statsRes.data);
      setTrends(trendsRes.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-green text-green-600 text-lg">Loading analytics...</div>
      </div>
    );
  }

  const statusData = [
    { name: 'Approved', value: stats?.approved || 0, color: '#10B981' },
    { name: 'Pending', value: stats?.pending || 0, color: '#F59E0B' },
    { name: 'Rejected', value: stats?.rejected || 0, color: '#EF4444' }
  ];

  const trendData = trends.map(t => ({
    month: `${t._id.month}/${t._id.year}`,
    applications: t.count,
    amount: t.total_amount
  }));

  const approvalRate = stats?.total_applications > 0 
    ? ((stats.approved / stats.total_applications) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 fade-in" data-testid="analytics-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-green-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Platform performance and insights</p>
        </div>
        <Button
          onClick={() => {
            exportAnalyticsToPDF(stats, trends);
            toast.success('Analytics report downloaded');
          }}
          data-testid="download-analytics-btn"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-green-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-green-900">{stats?.total_applications || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-blue-900">{stats?.approved || 0}</p>
                <p className="text-xs text-green-600 mt-1">{approvalRate}% approval rate</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-900">{stats?.pending || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Loan Amount</p>
                <p className="text-2xl font-bold text-indigo-900">
                  BDT {(stats?.total_loan_amount || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle>Application Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Application Trends */}
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle>Monthly Application Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#10B981" name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Loan Amount Trends */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle>Loan Amount Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `BDT ${value?.toLocaleString() || 0}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#1E9A56" 
                strokeWidth={2}
                name="Total Loan Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-green-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Month</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Applications</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Amount</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Amount</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-green-50">
                    <td className="py-3 px-4">{row.month}</td>
                    <td className="text-right py-3 px-4">{row.applications}</td>
                    <td className="text-right py-3 px-4">BDT {row.amount?.toLocaleString() || 0}</td>
                    <td className="text-right py-3 px-4">
                      BDT {row.applications > 0 ? Math.round(row.amount / row.applications).toLocaleString() : 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
