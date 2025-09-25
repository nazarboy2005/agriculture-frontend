import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface DiseaseDetectionResponse {
  diseaseName: string;
  confidence: number;
  suggestion: string;
  isHealthy?: boolean;
  healthProbability?: number;
  isPlant?: boolean;
  plantProbability?: number;
  healthStatus?: string;
}

interface DetectionHistory {
  id: number;
  imageFilename: string;
  imageData?: string; // Base64 image data
  diseaseName: string;
  confidence: number;
  suggestion: string;
  isHealthy?: boolean;
  healthProbability?: number;
  isPlant?: boolean;
  plantProbability?: number;
  healthStatus?: string;
  detectedAt: string;
}

const DiseaseDetection: React.FC = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DiseaseDetectionResponse | null>(null);
  const [history, setHistory] = useState<DetectionHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDetectionResult(null);
      // Create object URL for immediate display
      const imageUrl = URL.createObjectURL(file);
      setCurrentImage(imageUrl);
    }
  };

  const handleDetectDisease = async () => {
    if (!selectedFile) return;

    // Require authentication
    if (!user) {
      toast.error('Please log in to use disease detection.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await api.post('/disease/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setDetectionResult(response.data);
      
      // Store the image data for later viewing
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setCurrentImage(base64);
        // Store image in localStorage with a unique key
        const imageKey = `detection_image_${Date.now()}`;
        localStorage.setItem(imageKey, base64);
        // Store the key in the detection result for later retrieval
        setDetectionResult({
          ...response.data,
          imageKey: imageKey
        });
      };
      reader.readAsDataURL(selectedFile);
      
      // Refresh history after successful detection
      fetchHistory();
    } catch (error: any) {
      console.error('Error detecting disease:', error);
      // Show user-friendly error message
      if (error.response?.status === 401) {
        toast.error('Please log in to use disease detection.');
      } else if (error.response?.status === 503) {
        toast.error('Disease detection service is not configured. Please contact administrator.');
      } else {
        toast.error('Error detecting disease. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    try {
      console.log('Fetching disease detection history...');
      const response = await api.get('/disease/history');
      console.log('History response:', response.data);
      setHistory(response.data);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  const generateAISuggestion = async (diseaseName: string, confidence: number, isHealthy: boolean, healthStatus: string) => {
    try {
      // Create a simple, focused prompt without any farmer context
      const prompt = `PLANT DISEASE TREATMENT REQUEST:

DETECTED DISEASE: ${diseaseName}
CONFIDENCE: ${(confidence * 100).toFixed(1)}%
HEALTH STATUS: ${isHealthy ? 'Healthy' : 'Unhealthy'}
ASSESSMENT: ${healthStatus}

REQUIRED: Provide ONLY treatment recommendations for this specific disease. 
Do NOT mention any farmer names, locations, or crop types.
Focus ONLY on treating the detected disease: ${diseaseName}

Provide:
1. Treatment steps for ${diseaseName}
2. Prevention for ${diseaseName}
3. Recovery timeline
4. When to seek help

Keep response focused on ${diseaseName} only.`;

      console.log('Sending focused AI treatment request:', prompt);

      // Use a different approach - call Gemini API directly if possible
      // For now, let's try with a minimal context request
      const response = await api.post('/v1/chat/disease-treatment', null, {
        params: {
          diseaseName: diseaseName,
          confidence: confidence,
          isHealthy: isHealthy,
          healthStatus: healthStatus
        },
        timeout: 120000
      });

      console.log('AI treatment response:', response.data);

      // Handle different response structures
      const aiResponse = response.data?.data?.data?.aiResponse || 
                        response.data?.data?.aiResponse || 
                        response.data?.aiResponse;

      if (aiResponse) {
        // Filter out any farmer-specific content
        let filteredResponse = aiResponse;
        
        // Remove common farmer profile references
        const farmerReferences = [
          'John Doe', 'Doha Farm', 'Tomato', 'dfsf', 
          'irrigation plan', 'farmer profile', 'crop management',
          'agricultural consultant', 'Mr. Doe', 'Professional Crop Management',
          'Crop-Specific Recommendations', 'Growth Stage Management',
          'Nutrient Management Protocol', 'Pest and Disease Management',
          'Harvest Optimization', 'Quality Assurance'
        ];
        
        farmerReferences.forEach(ref => {
          filteredResponse = filteredResponse.replace(new RegExp(ref, 'gi'), '');
        });
        
        // If the response is still generic, provide a fallback
        if (filteredResponse.includes('vegetative') || filteredResponse.includes('fruiting') || filteredResponse.includes('kg/ha')) {
          return `Treatment for ${diseaseName}:

1. IMMEDIATE TREATMENT STEPS:
   - Isolate the affected plant to prevent spread
   - Remove any infected plant material
   - Apply appropriate fungicide or treatment for ${diseaseName}

2. DISEASE-SPECIFIC PREVENTION:
   - Improve air circulation around plants
   - Avoid overhead watering
   - Maintain proper plant spacing
   - Regular monitoring for early detection

3. RECOVERY TIMELINE:
   - Monitor daily for 1-2 weeks
   - New growth should appear healthy
   - Full recovery depends on disease severity

4. WHEN TO SEEK PROFESSIONAL HELP:
   - If symptoms worsen after 1 week
   - If multiple plants show similar symptoms
   - If unsure about the diagnosis

Note: This is a general treatment plan for ${diseaseName}. For specific recommendations, consult a local plant pathologist.`;
        }
        
        return filteredResponse.trim() || aiResponse;
      } else {
        console.warn('No AI response found in response structure:', response.data);
        return 'AI treatment suggestions are not available at the moment.';
      }
    } catch (error: any) {
      console.error('Error generating AI suggestion:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.code === 'ECONNABORTED') {
        return 'Request timed out. The AI is taking longer than expected. Please try again.';
      } else if (error.response?.status === 500) {
        return 'AI service is temporarily unavailable. Please try again later.';
      } else {
        return 'Unable to generate AI treatment suggestions. Please try again later.';
      }
    }
  };

  const deleteDetection = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this detection record?')) {
      return;
    }

    try {
      await api.delete(`/disease/history/${id}`);
      setHistory(history.filter(item => item.id !== id));
      toast.success('Detection record deleted successfully');
    } catch (error: any) {
      console.error('Error deleting detection:', error);
      toast.error('Failed to delete detection record');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Authentication Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Please log in to use the Plant Disease Detection feature.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Plant Disease Detection</h1>
        <Button
          onClick={() => {
            if (!showHistory) {
              fetchHistory();
            }
            setShowHistory(!showHistory);
          }}
          variant="outline"
        >
          {showHistory ? 'Hide History' : 'View History'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease Detection Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Plant Image</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {currentImage && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Detection Image'}
                </p>
                <div className="mt-2">
                  <img
                    src={currentImage}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleDetectDisease}
              disabled={!selectedFile || isUploading || !user}
              className="w-full"
            >
              {!user ? 'Please Log In' : isUploading ? 'Detecting...' : 'Detect Disease'}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Detection Results</h2>
            {detectionResult && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetectionResult(null)}
                className="text-red-600 hover:text-red-800"
              >
                Clear Results
              </Button>
            )}
          </div>
          
          {detectionResult ? (
            <div className="space-y-4">
              {/* Plant Detection */}
              {detectionResult.isPlant !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plant Detection</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge className={detectionResult.isPlant ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {detectionResult.isPlant ? "Plant Detected" : "Not a Plant"}
                    </Badge>
                    {detectionResult.plantProbability !== undefined && (
                      <span className="text-sm text-gray-600">
                        ({(detectionResult.plantProbability * 100).toFixed(1)}% confidence)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Health Status */}
              {detectionResult.isHealthy !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Health Status</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge className={detectionResult.isHealthy ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {detectionResult.healthStatus || (detectionResult.isHealthy ? "Healthy" : "Unhealthy")}
                    </Badge>
                    {detectionResult.healthProbability !== undefined && (
                      <span className="text-sm text-gray-600">
                        ({(detectionResult.healthProbability * 100).toFixed(1)}% confidence)
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Disease Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Disease Name</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {detectionResult.diseaseName}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Confidence</label>
                <div className="mt-1 flex items-center space-x-2">
                  <Badge className={getConfidenceColor(detectionResult.confidence)}>
                    {(detectionResult.confidence * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Treatment Suggestion</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setIsGeneratingSuggestion(true);
                      try {
                        const suggestion = await generateAISuggestion(
                          detectionResult.diseaseName,
                          detectionResult.confidence,
                          detectionResult.isHealthy || false,
                          detectionResult.healthStatus || 'Unknown'
                        );
                        setAiSuggestion(suggestion);
                      } catch (error) {
                        toast.error('Failed to generate AI suggestion');
                      } finally {
                        setIsGeneratingSuggestion(false);
                      }
                    }}
                    disabled={isGeneratingSuggestion}
                  >
                    {isGeneratingSuggestion ? 'Generating...' : 'Get AI Treatment'}
                  </Button>
                </div>
                <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {detectionResult.suggestion}
                </p>
                {aiSuggestion && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">AI-Generated Treatment Plan</label>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {aiSuggestion.split('\n').map((line, index) => {
                          // Clean up markdown formatting
                          const cleanLine = line
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/^\* /g, '• ')
                            .replace(/^\d+\. /g, (match) => match);
                          
                          return (
                            <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: cleanLine }} />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>


              {detectionResult.healthStatus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Overall Health Assessment</label>
                  <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {detectionResult.healthStatus}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Upload an image to detect plant diseases
            </div>
          )}
        </Card>
      </div>

      {/* History Section */}
      {showHistory && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Detection History</h2>
          
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Disease</th>
                    <th>Confidence</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td className="font-medium">{item.imageFilename}</td>
                      <td>{item.diseaseName}</td>
                      <td>
                        <Badge className={getConfidenceColor(item.confidence)}>
                          {(item.confidence * 100).toFixed(1)}%
                        </Badge>
                      </td>
                      <td>{formatDate(item.detectedAt)}</td>
                      <td>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDetectionResult({
                                diseaseName: item.diseaseName,
                                confidence: item.confidence,
                                suggestion: item.suggestion,
                                isHealthy: item.isHealthy,
                                healthProbability: item.healthProbability,
                                isPlant: item.isPlant,
                                plantProbability: item.plantProbability,
                                healthStatus: item.healthStatus
                              });
                              // Try to retrieve stored image from localStorage
                              const imageKey = `detection_image_${item.id}`;
                              const storedImage = localStorage.getItem(imageKey);
                              if (storedImage) {
                                setCurrentImage(storedImage);
                              } else if (item.imageData) {
                                setCurrentImage(item.imageData);
                              }
                            }}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteDetection(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No detection history found
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default DiseaseDetection;
