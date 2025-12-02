import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Building2, Search, TrendingDown, Clock, CheckCircle2, ExternalLink } from 'lucide-react';
import { mfiAPI } from '../utils/api';
import { toast } from 'sonner';

const MFIDirectory = () => {
  const [mfis, setMfis] = useState([]);
  const [filteredMfis, setFilteredMfis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMFIs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = mfis.filter(mfi =>
        mfi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mfi.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMfis(filtered);
    } else {
      setFilteredMfis(mfis);
    }
  }, [searchTerm, mfis]);

  const fetchMFIs = async () => {
    try {
      const response = await mfiAPI.getAll();
      setMfis(response.data);
      setFilteredMfis(response.data);
    } catch (error) {
      toast.error('Failed to load MFIs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse-green text-green-600 text-lg">Loading MFIs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in" data-testid="mfi-directory-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-green-900 mb-2" style={{ fontFamily: 'Space Grotesk' }}>
          Microfinance Institutions
        </h1>
        <p className="text-gray-600">Compare and choose the best MFI for your business needs</p>
      </div>

      {/* Search */}
      <Card className="border-2 border-green-100">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search MFIs by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="mfi-search-input"
              className="pl-10 border-green-200 focus:border-green-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* MFI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMfis.map((mfi) => (
          <Card
            key={mfi.id}
            className="border-2 border-green-100 hover:border-green-300 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => navigate(`/mfis/${mfi.id}`)}
            data-testid={`mfi-card-${mfi.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-green-900">{mfi.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {mfi.interest_rate}% Interest
                      </Badge>
                      {!mfi.collateral_required && (
                        <Badge variant="success" className="text-xs bg-green-100 text-green-700">
                          No Collateral
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-3">
                {mfi.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Loan Range</p>
                    <p className="font-semibold text-sm">BDT {(mfi.min_loan_amount / 1000).toFixed(0)}K - {(mfi.max_loan_amount / 1000).toFixed(0)}K</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Processing</p>
                    <p className="font-semibold text-sm">{mfi.processing_time_days} days</p>
                  </div>
                </div>
              </div>

              {mfi.requirements && mfi.requirements.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Requirements:</p>
                  <div className="flex flex-wrap gap-1">
                    {mfi.requirements.slice(0, 3).map((req, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))}
                    {mfi.requirements.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{mfi.requirements.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/mfis/${mfi.id}`);
                }}
                data-testid={`view-details-btn-${mfi.id}`}
              >
                View Details & Apply
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMfis.length === 0 && (
        <Card className="border-2 border-gray-200">
          <CardContent className="py-12 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No MFIs found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MFIDirectory;
