import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { mfiAPI, applicationAPI } from '../utils/api';
import { toast } from 'sonner';

const LoanApplicationForm = () => {
  const { mfiId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mfi, setMfi] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    business_age_years: '',
    monthly_revenue: '',
    loan_amount: '',
    loan_purpose: '',
    tenure_months: ''
  });

  const totalSteps = 3;

  useEffect(() => {
    fetchMFI();
  }, [mfiId]);

  const fetchMFI = async () => {
    try {
      const response = await mfiAPI.getById(mfiId);
      setMfi(response.data);
    } catch (error) {
      toast.error('Failed to load MFI details');
      navigate('/mfis');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.business_name || !formData.business_type || !formData.business_age_years || !formData.monthly_revenue) {
        toast.error('Please fill in all business information fields');
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.loan_amount || !formData.loan_purpose || !formData.tenure_months) {
        toast.error('Please fill in all loan details');
        return false;
      }
      if (mfi && (parseFloat(formData.loan_amount) < mfi.min_loan_amount || parseFloat(formData.loan_amount) > mfi.max_loan_amount)) {
        toast.error(`Loan amount must be between BDT ${mfi.min_loan_amount.toLocaleString()} and BDT ${mfi.max_loan_amount.toLocaleString()}`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      await applicationAPI.create({
        mfi_id: mfiId,
        business_name: formData.business_name,
        business_type: formData.business_type,
        business_age_years: parseInt(formData.business_age_years),
        monthly_revenue: parseFloat(formData.monthly_revenue),
        loan_amount: parseFloat(formData.loan_amount),
        loan_purpose: formData.loan_purpose,
        tenure_months: parseInt(formData.tenure_months)
      });
      toast.success('Application submitted successfully!');
      navigate('/applications');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in" data-testid="loan-application-form">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate(`/mfis/${mfiId}`)}
          data-testid="back-btn"
          className="text-green-600 hover:text-green-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to MFI Details
        </Button>
        <h1 className="text-3xl font-bold text-green-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Loan Application
        </h1>
        <p className="text-gray-600">
          {mfi?.name} - Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="border-2 border-green-100">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Form Steps */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Business Information'}
            {currentStep === 2 && 'Loan Details'}
            {currentStep === 3 && 'Review & Submit'}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Tell us about your business'}
            {currentStep === 2 && 'Specify your loan requirements'}
            {currentStep === 3 && 'Review your application before submitting'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Business Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name *</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  data-testid="business-name-input"
                  placeholder="Enter your business name"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type *</Label>
                <Select
                  value={formData.business_type}
                  onValueChange={(value) => handleSelectChange('business_type', value)}
                  data-testid="business-type-select"
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Agriculture">Agriculture</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Trading">Trading</SelectItem>
                    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_age_years">Business Age (Years) *</Label>
                  <Input
                    id="business_age_years"
                    name="business_age_years"
                    type="number"
                    min="0"
                    value={formData.business_age_years}
                    onChange={handleChange}
                    data-testid="business-age-input"
                    placeholder="e.g., 2"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_revenue">Monthly Revenue (BDT) *</Label>
                  <Input
                    id="monthly_revenue"
                    name="monthly_revenue"
                    type="number"
                    min="0"
                    value={formData.monthly_revenue}
                    onChange={handleChange}
                    data-testid="monthly-revenue-input"
                    placeholder="e.g., 50000"
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Loan Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loan_amount">Loan Amount (BDT) *</Label>
                <Input
                  id="loan_amount"
                  name="loan_amount"
                  type="number"
                  min={mfi?.min_loan_amount || 0}
                  max={mfi?.max_loan_amount || 1000000}
                  value={formData.loan_amount}
                  onChange={handleChange}
                  data-testid="loan-amount-input"
                  placeholder="Enter loan amount"
                  className="border-green-200 focus:border-green-500"
                />
                {mfi && (
                  <p className="text-xs text-gray-500">
                    Range: BDT {mfi.min_loan_amount.toLocaleString()} - {mfi.max_loan_amount.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenure_months">Loan Tenure (Months) *</Label>
                <Select
                  value={formData.tenure_months}
                  onValueChange={(value) => handleSelectChange('tenure_months', value)}
                  data-testid="tenure-select"
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500">
                    <SelectValue placeholder="Select tenure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="18">18 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="loan_purpose">Loan Purpose *</Label>
                <Textarea
                  id="loan_purpose"
                  name="loan_purpose"
                  value={formData.loan_purpose}
                  onChange={handleChange}
                  data-testid="loan-purpose-input"
                  placeholder="Describe how you plan to use the loan"
                  rows={4}
                  className="border-green-200 focus:border-green-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-green-900 text-lg mb-4">Application Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">MFI</p>
                    <p className="font-medium text-green-900">{mfi?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Name</p>
                    <p className="font-medium text-green-900">{formData.business_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-medium text-green-900">{formData.business_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Business Age</p>
                    <p className="font-medium text-green-900">{formData.business_age_years} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Monthly Revenue</p>
                    <p className="font-medium text-green-900">BDT {parseFloat(formData.monthly_revenue).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Loan Amount</p>
                    <p className="font-medium text-green-900">BDT {parseFloat(formData.loan_amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tenure</p>
                    <p className="font-medium text-green-900">{formData.tenure_months} months</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Interest Rate</p>
                    <p className="font-medium text-green-900">{mfi?.interest_rate}%</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-green-200">
                  <p className="text-sm text-gray-500">Loan Purpose</p>
                  <p className="font-medium text-green-900">{formData.loan_purpose}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                data-testid="back-step-btn"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            ) : (
              <div></div>
            )}
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                data-testid="next-step-btn"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                data-testid="submit-application-btn"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanApplicationForm;
