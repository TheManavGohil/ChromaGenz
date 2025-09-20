'use client';

import { Color } from '@/types';
import { checkContrast } from '@/utils/colors';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AccessibilityCheckerProps {
  colors: Color[];
}

export function AccessibilityChecker({ colors }: AccessibilityCheckerProps) {
  const contrastChecks = [];

  // Check all color pairs for contrast
  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const check = checkContrast(colors[i].hex, colors[j].hex);
      contrastChecks.push({
        color1: colors[i],
        color2: colors[j],
        ...check,
      });
    }
  }

  const getIcon = (check: { aa: boolean; aaa: boolean }) => {
    if (check.aaa) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (check.aa) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getLabel = (check: { aa: boolean; aaa: boolean }) => {
    if (check.aaa) return 'AAA';
    if (check.aa) return 'AA';
    return 'Fail';
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Accessibility Check</h3>
      
      <div className="space-y-3">
        {contrastChecks.length > 0 ? (
          contrastChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: check.color1.hex }}
                  />
                  <span className="text-sm font-mono">{check.color1.hex}</span>
                </div>
                <span className="text-muted-foreground">vs</span>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: check.color2.hex }}
                  />
                  <span className="text-sm font-mono">{check.color2.hex}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium">{check.ratio}:1</span>
                <div className="flex items-center space-x-1">
                  {getIcon(check)}
                  <span className="text-xs font-medium">{getLabel(check)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Add more colors to check contrast ratios
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-md">
        <h4 className="text-sm font-medium mb-2">WCAG Guidelines</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>AAA: 7:1+ ratio (Enhanced accessibility)</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-3 w-3 text-yellow-500" />
            <span>AA: 4.5:1+ ratio (Standard accessibility)</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="h-3 w-3 text-red-500" />
            <span>Fail: Below 4.5:1 (Accessibility issues)</span>
          </div>
        </div>
      </div>
    </div>
  );
}