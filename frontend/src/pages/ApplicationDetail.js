import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ArrowLeft, Building2, Calendar, DollarSign, FileText, User, Download, Clock, CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { applicationAPI, mfiAPI } from '../utils/api';
import { toast } from 'sonner';
import { exportApplicationToPDF } from '../utils/pdfExport';

const ApplicationDetail = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [mfi, setMfi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');

  useEffect(() => {
    fetchApplicationDetails();
  }, [appId]);

  const fetchApplicationDetails = async () => {
    try {
      const appRes = await applicationAPI.getById(appId);
      setApplication(appRes.data);
      
      // Fetch MFI details
      const mfiRes = await mfiAPI.getById(appRes.data.mfi_id);
      setMfi(mfiRes.data);
    } catch (error) {
      toast.error('Failed to load application details');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!officerNotes.trim()) {
      toast.error('Please add officer notes before approving');
      return;
    }
    
    setActionLoading(true);
    try {
      await applicationAPI.update(appId, {
        status: 'approved',
        officer_notes: officerNotes
      });
      toast.success('Application approved successfully!');
      fetchApplicationDetails();
    } catch (error) {
      toast.error('Failed to approve application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setActionLoading(true);
    try {
      await applicationAPI.update(appId, {
        status: 'rejected',
        rejection_reason: rejectionReason,
        officer_notes: officerNotes || 'Application rejected'
      });
      toast.success('Application rejected');
      setShowRejectDialog(false);
      fetchApplicationDetails();
    } catch (error) {
      toast.error('Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      submitted: {
        icon: <Clock className="w-5 h-5" />,
        label: 'Submitted',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        description: 'Your application has been submitted and is awaiting review'
      },
      under_review: {
        icon: <FileText className="w-5 h-5" />,
        label: 'Under Review',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        description: 'Your application is currently being reviewed by our loan officers'
      },
      approved: {
        icon: <CheckCircle2 className="w-5 h-5" />,
        label: 'Approved',
        color: 'bg-green-100 text-green-700 border-green-200',
        description: 'Congratulations! Your loan application has been approved'
      },
      rejected: {
        icon: <XCircle className="w-5 h-5" />,
        label: 'Rejected',
        color: 'bg-red-100 text-red-700 border-red-200',
        description: 'Unfortunately, your application was not approved'
      },
      disbursed: {
        icon: <CheckCircle2 className="w-5 h-5" />,
        label: 'Disbursed',
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        description: 'Your loan has been successfully disbursed'
      }
    };
    return configs[status] || configs.submitted;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-green text-green-600 text-lg">Loading application details...</div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const statusConfig = getStatusConfig(application.status);

  return (
    <div className="space-y-6 fade-in" data-testid="application-detail-page">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/applications')}
          data-testid="back-to-applications-btn"
          className="text-green-600 hover:text-green-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
              Application Details
            </h1>
            <p className="text-gray-600">Application ID: {application.id.slice(0, 8)}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              exportApplicationToPDF(application, mfi);
              toast.success('PDF downloaded successfully');
            }}
            data-testid="download-pdf-btn"
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <Card className={`border-2 ${statusConfig.color}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${statusConfig.color} rounded-lg flex items-center justify-center`}>
                {statusConfig.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">{statusConfig.label}</h3>
                <p className="text-sm opacity-80">{statusConfig.description}</p>
              </div>
            </div>
            <Badge className={`${statusConfig.color} text-base px-4 py-2`}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Application Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-green-600" />
              <span>Business Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Business Name</p>
              <p className="text-lg font-semibold text-green-900">{application.business_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Business Type</p>
              <p className="text-lg font-semibold text-green-900">{application.business_type}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Business Age</p>
                <p className="font-semibold text-green-900">{application.business_age_years} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Monthly Revenue</p>
                <p className="font-semibold text-green-900">BDT {application.monthly_revenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span>Loan Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Loan Amount</p>
              <p className="text-2xl font-bold text-green-900">BDT {application.loan_amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Loan Tenure</p>
              <p className="text-lg font-semibold text-green-900">{application.tenure_months} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
              <p className="text-lg font-semibold text-green-900">{mfi?.interest_rate}% per annum</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MFI Information */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-green-600" />
            <span>Microfinance Institution</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-green-900 mb-1">{mfi?.name}</p>
              <p className="text-sm text-gray-600">{mfi?.description}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(`/mfis/${mfi?.id}`)}
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              View MFI Details
            </Button>
          </div>
          <Separator />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
              <p className="font-semibold text-green-900">{mfi?.interest_rate}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Processing Time</p>
              <p className="font-semibold text-green-900">{mfi?.processing_time_days} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Collateral</p>
              <p className="font-semibold text-green-900">{mfi?.collateral_required ? 'Required' : 'Not Required'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Contact</p>
              <p className="font-semibold text-green-900 text-sm">{mfi?.contact_phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Purpose */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-green-600" />
            <span>Loan Purpose</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{application.loan_purpose}</p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span>Application Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Application Submitted</p>
              <p className="font-semibold text-green-900">{new Date(application.created_at).toLocaleString()}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Updated</p>
              <p className="font-semibold text-green-900">{new Date(application.updated_at).toLocaleString()}</p>
            </div>
          </div>
          {application.officer_id && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-1">Reviewed By</p>
                <p className="font-semibold text-green-900">Loan Officer</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Officer Notes (if any) */}
      {application.officer_notes && (
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Officer Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{application.officer_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Reason (if rejected) */}
      {application.status === 'rejected' && application.rejection_reason && (
        <Card className="border-2 border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>Rejection Reason</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{application.rejection_reason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApplicationDetail;
