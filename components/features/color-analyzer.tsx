'use client';

import { useState } from 'react';
import { Color } from '@/types';
import { colorApi, PaletteExplanation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Brain, Target, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColorAnalyzerProps {
  colors: Color[];
  context?: string;
}

export function ColorAnalyzer({ colors, context }: ColorAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PaletteExplanation | null>(null);
  const { toast } = useToast();

  const analyzeColors = async () => {
    // Show immediate feedback that function is called
    
    if (!colors || colors.length === 0) {
      toast({
        title: "No colors to analyze",
        description: "Please generate a palette first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert Color objects to hex strings for the API
      const hexColors = colors.map(color => color.hex);
      
      console.log('🎨 Starting color analysis...');
      console.log('Colors to analyze:', hexColors);
      console.log('Context:', context);
      
      // Try to make the API call exactly like the working HTML version
      const API_BASE_URL = 'https://bit-byte-rmtv.onrender.com';
      
      const requestBody = {
        palette: hexColors,
        context: context || 'Generated color palette'
      };
      
      console.log('📤 Sending request to API:', requestBody);
      
      const response = await fetch(`${API_BASE_URL}/explain-colors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const rawData = await response.json();
      console.log('📊 Raw API Response:', rawData);
      
      // Check if the response has the expected structure
      if (!rawData || typeof rawData !== 'object') {
        console.error('❌ Invalid response format:', rawData);
        throw new Error('Invalid API response format');
      }
      
      // Check for success field
      if (rawData.success === false) {
        console.error('❌ API returned success: false:', rawData);
        throw new Error(rawData.message || 'API returned failure status');
      }
      
      // Try to map the response to our expected format
      let mappedResult;
      
      if (rawData.color_explanations && rawData.palette_analysis) {
        // Format matches the HTML version
        mappedResult = {
          colors: rawData.color_explanations.map((color: any) => ({
            color: color.color,
            name: color.name || 'Unnamed Color',
            description: color.description || 'No description available',
            psychology: color.psychology || 'No psychology information available',
            common_uses: color.common_uses || []
          })),
          palette_analysis: {
            harmony: rawData.palette_analysis.harmony_type || rawData.palette_analysis.harmony || 'Unknown harmony',
            mood: rawData.palette_analysis.overall_mood || rawData.palette_analysis.mood || 'Unknown mood',
            use_cases: rawData.palette_analysis.applications || rawData.palette_analysis.use_cases || []
          }
        };
      } else if (rawData.colors && rawData.palette_analysis) {
        // Format matches our expected format
        mappedResult = rawData;
      } else {
        console.error('❌ Unexpected response structure:', rawData);
        throw new Error('Unexpected API response structure');
      }
      
      console.log('✅ Mapped result:', mappedResult);
      
      setAnalysis(mappedResult);
      
      toast({
        title: "Analysis Complete!",
        description: "Color psychology and recommendations have been generated.",
      });
      
    } catch (error) {
      console.error('❌ Color analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze colors. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Trigger */}
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={analyzeColors}
          disabled={isAnalyzing || !colors || colors.length === 0}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Colors...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Analyze Color Psychology
            </>
          )}
        </Button>
        
        {!analysis && !isAnalyzing && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Get AI-powered insights about your color palette's psychology, mood, and best use cases.
            </p>
            <div className="text-xs text-muted-foreground">
              <p>Colors available: {colors?.length || 0}</p>
              <p>Context: {context || 'No context'}</p>
              {colors && colors.length > 0 && (
                <div className="flex justify-center gap-1 mt-2">
                  {colors.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Palette Analysis */}
          {analysis.palette_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Palette Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Harmony & Mood
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Color Harmony:</strong> {analysis.palette_analysis.harmony}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Overall Mood:</strong> {analysis.palette_analysis.mood}
                  </p>
                </div>
                
                {analysis.palette_analysis.use_cases && analysis.palette_analysis.use_cases.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Best Use Cases
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.palette_analysis.use_cases.map((useCase, index) => (
                        <Badge key={index} variant="secondary">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Individual Color Analysis */}
          {analysis.colors && analysis.colors.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Individual Color Analysis</h3>
              
              {analysis.colors.map((colorAnalysis, index) => (
                <Card key={index} className="relative">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-200"
                        style={{ backgroundColor: colorAnalysis.color }}
                      />
                      <div>
                        <span className="font-mono text-sm">{colorAnalysis.color}</span>
                        <p className="text-sm text-muted-foreground font-normal">
                          {colorAnalysis.name}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {colorAnalysis.description}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Psychology</h4>
                      <p className="text-sm text-muted-foreground">
                        {colorAnalysis.psychology}
                      </p>
                    </div>
                    
                    {colorAnalysis.common_uses && colorAnalysis.common_uses.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Common Uses</h4>
                        <div className="flex flex-wrap gap-2">
                          {colorAnalysis.common_uses.map((use, useIndex) => (
                            <Badge key={useIndex} variant="outline">
                              {use}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
