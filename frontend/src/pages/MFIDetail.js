import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Building2, TrendingDown, Clock, CheckCircle2, Phone, Mail, Globe, ArrowLeft } from 'lucide-react';
import { mfiAPI } from '../utils/api';
import { toast } from 'sonner';

const MFIDetail = () => {
  const { mfiId } = useParams();
  const navigate = useNavigate();
  const [mfi, setMfi] = useState(null);
  const [loanProducts, setLoanProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMFIDetails();
  }, [mfiId]);

  const fetchMFIDetails = async () => {
    try {
      const [mfiRes, productsRes] = await Promise.all([
        mfiAPI.getById(mfiId),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/loan-products?mfi_id=${mfiId}`).then(r => r.json())
      ]);
      setMfi(mfiRes.data);
      setLoanProducts(productsRes);
    } catch (error) {
      toast.error('Failed to load MFI details');
      navigate('/mfis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-green text-green-600 text-lg">Loading MFI details...</div>
      </div>
    );
  }

  if (!mfi) {
    return null;
  }

  return (
    <div className="space-y-6 fade-in" data-testid="mfi-detail-page">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/mfis')}
        data-testid="back-to-mfis-btn"
        className="text-green-600 hover:text-green-700"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to MFIs
      </Button>

      {/* MFI Header */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-green-900 mb-2">{mfi.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {mfi.interest_rate}% Interest Rate
                  </Badge>
                  {!mfi.collateral_required && (
                    <Badge className="text-sm bg-green-100 text-green-700">
                      No Collateral Required
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-sm">
                    {mfi.processing_time_days} Days Processing
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate(`/apply/${mfiId}`)}
              data-testid="apply-now-btn"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Apply for Loan
            </Button>
          </div>
          {mfi.description && (
            <CardDescription className="text-base mt-4">
              {mfi.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* MFI Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Information */}
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span>Loan Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Loan Range</p>
              <p className="text-lg font-semibold text-green-900">
                BDT {mfi.min_loan_amount.toLocaleString()} - BDT {mfi.max_loan_amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Interest Rate</p>
              <p className="text-lg font-semibold text-green-900">{mfi.interest_rate}% per annum</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Processing Time</p>
              <p className="text-lg font-semibold text-green-900">{mfi.processing_time_days} days</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Collateral</p>
              <p className="text-lg font-semibold text-green-900">
                {mfi.collateral_required ? 'Required' : 'Not Required'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-green-600" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mfi.contact_phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-green-900">{mfi.contact_phone}</p>
                </div>
              </div>
            )}
            {mfi.contact_email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-green-900">{mfi.contact_email}</p>
                </div>
              </div>
            )}
            {mfi.website && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Website</p>
                  <a
                    href={mfi.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-green-600 hover:text-green-700 underline"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Requirements */}
      {mfi.requirements && mfi.requirements.length > 0 && (
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Requirements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mfi.requirements.map((req, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{req}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Products */}
      {loanProducts.length > 0 && (
        <Card className="border-2 border-green-100">
          <CardHeader>
            <CardTitle>Available Loan Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loanProducts.map((product) => (
                <Card key={product.id} className="border border-green-200">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold text-lg text-green-900 mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount Range:</span>
                        <span className="font-medium">BDT {product.min_amount.toLocaleString()} - {product.max_amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Interest Rate:</span>
                        <span className="font-medium">{product.interest_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Tenure Options:</span>
                        <span className="font-medium">{product.tenure_months.join(', ')} months</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to Apply?</h3>
          <p className="text-green-50 mb-6">Start your loan application with {mfi.name} today</p>
          <Button
            size="lg"
            onClick={() => navigate(`/apply/${mfiId}`)}
            data-testid="cta-apply-btn"
            className="bg-white text-green-700 hover:bg-green-50"
          >
            Apply for Loan Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MFIDetail;
