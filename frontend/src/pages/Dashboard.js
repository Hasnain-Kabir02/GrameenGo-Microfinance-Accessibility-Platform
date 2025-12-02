import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FileText, TrendingUp, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { applicationAPI, mfiAPI } from '../utils/api';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [mfis, setMfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appsRes, mfisRes] = await Promise.all([
        applicationAPI.getAll(),
        mfiAPI.getAll()
      ]);
      setApplications(appsRes.data.slice(0, 5));
      setMfis(mfisRes.data.slice(0, 6));
      
      const stats = {
        total: appsRes.data.length,
        approved: appsRes.data.filter(a => a.status === 'approved').length,
        pending: appsRes.data.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
        rejected: appsRes.data.filter(a => a.status === 'rejected').length
      };
      setStats(stats);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      submitted: { variant: 'secondary', icon: <Clock className="w-3 h-3" />, label: 'Submitted' },
      under_review: { variant: 'default', icon: <TrendingUp className="w-3 h-3" />, label: 'Under Review' },
      approved: { variant: 'success', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Approved', className: 'bg-green-100 text-green-700 border-green-200' },
      rejected: { variant: 'destructive', icon: <XCircle className="w-3 h-3" />, label: 'Rejected' },
      disbursed: { variant: 'success', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Disbursed', className: 'bg-blue-100 text-blue-700 border-blue-200' }
    };
    const config = variants[status] || variants.submitted;
    return (
      <Badge variant={config.variant} className={`flex items-center space-x-1 ${config.className || ''}`}>
        {config.icon}
        <span>{config.label}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-green text-green-600 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in" data-testid="dashboard-page">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-green-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">Here's an overview of your microfinance journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-green-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-green-900">{stats.total}</p>
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
                <p className="text-3xl font-bold text-blue-900">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-100 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {user?.role === 'borrower' && (
        <Card className="border-2 border-green-100">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-xl font-semibold text-green-900 mb-1">Ready to apply for a loan?</h3>
                <p className="text-gray-600">Browse available MFIs and submit your application</p>
              </div>
              <Button
                onClick={() => navigate('/mfis')}
                data-testid="browse-mfis-btn"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Browse MFIs
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Applications */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Button
              variant="ghost"
              onClick={() => navigate('/applications')}
              data-testid="view-all-applications-btn"
              className="text-green-600 hover:text-green-700"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No applications yet</p>
              {user?.role === 'borrower' && (
                <Button
                  onClick={() => navigate('/mfis')}
                  variant="link"
                  className="text-green-600 mt-2"
                >
                  Apply for your first loan
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 border border-green-100 rounded-lg hover:bg-green-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/applications/${app.id}`)}
                  data-testid={`application-item-${app.id}`}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900">{app.business_name}</h4>
                    <p className="text-sm text-gray-600">
                      BDT {app.loan_amount.toLocaleString()} • {app.tenure_months} months
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Applied {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Featured MFIs */}
      {user?.role === 'borrower' && mfis.length > 0 && (
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle>Featured MFIs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mfis.map((mfi) => (
                <div
                  key={mfi.id}
                  className="border border-green-100 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/mfis/${mfi.id}`)}
                  data-testid={`mfi-card-${mfi.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 font-bold">{mfi.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-green-900 truncate">{mfi.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Interest: {mfi.interest_rate}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {mfi.processing_time_days} days approval
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
