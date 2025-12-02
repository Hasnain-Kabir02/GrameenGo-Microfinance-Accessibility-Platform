import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileText, Search, Download } from 'lucide-react';
import { applicationAPI, mfiAPI } from '../utils/api';
import { toast } from 'sonner';
import { exportApplicationToPDF } from '../utils/pdfExport';

const Applications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [mfis, setMfis] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchTerm, statusFilter, applications]);

  const fetchData = async () => {
    try {
      const [appsRes, mfisRes] = await Promise.all([
        applicationAPI.getAll(),
        mfiAPI.getAll()
      ]);
      setApplications(appsRes.data);
      setFilteredApps(appsRes.data);
      
      const mfiMap = {};
      mfisRes.data.forEach(mfi => {
        mfiMap[mfi.id] = mfi;
      });
      setMfis(mfiMap);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mfis[app.mfi_id]?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApps(filtered);
  };

  const getStatusConfig = (status) => {
    const configs = {
      submitted: { variant: 'secondary', label: 'Submitted', className: '' },
      under_review: { variant: 'default', label: 'Under Review', className: 'bg-blue-100 text-blue-700' },
      approved: { variant: 'success', label: 'Approved', className: 'bg-green-100 text-green-700' },
      rejected: { variant: 'destructive', label: 'Rejected', className: '' },
      disbursed: { variant: 'success', label: 'Disbursed', className: 'bg-indigo-100 text-indigo-700' }
    };
    return configs[status] || configs.submitted;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-green text-green-600 text-lg">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in" data-testid="applications-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-green-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            My Applications
          </h1>
          <p className="text-gray-600">Track and manage your loan applications</p>
        </div>
        {user?.role === 'borrower' && (
          <Button
            onClick={() => navigate('/mfis')}
            data-testid="new-application-btn"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            New Application
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-2 border-green-100">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by business name or MFI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="search-input"
                className="pl-10 border-green-200 focus:border-green-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter">
              <SelectTrigger className="border-green-200 focus:border-green-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="disbursed">Disbursed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <Card className="border-2 border-gray-200">
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Start by applying for a loan'}
            </p>
            {user?.role === 'borrower' && (
              <Button
                onClick={() => navigate('/mfis')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Browse MFIs
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => {
            const mfi = mfis[app.mfi_id];
            const statusConfig = getStatusConfig(app.status);
            
            return (
              <Card
                key={app.id}
                className="border-2 border-green-100 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/applications/${app.id}`)}
                data-testid={`application-card-${app.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-green-900">{app.business_name}</h3>
                        <Badge className={statusConfig.className} variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        MFI: <span className="font-medium">{mfi?.name || 'Unknown'}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Amount: <span className="font-medium">BDT {app.loan_amount.toLocaleString()}</span> • 
                        Tenure: <span className="font-medium">{app.tenure_months} months</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Applied on {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportApplicationToPDF(app, mfi);
                          toast.success('PDF downloaded successfully');
                        }}
                        data-testid={`download-pdf-btn-${app.id}`}
                        className="border-green-600 text-green-600 hover:bg-green-50"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/applications/${app.id}`);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Applications;
