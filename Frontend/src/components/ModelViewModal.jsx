import React from 'react';
import ModelViewer from './ModelViewer';
import ArViewer from './ArViewer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Box } from 'lucide-react';

export default function ModelViewModal({ model, onClose }) {
  const [isArMode, setIsArMode] = React.useState(false);

  if (!model) return null;

  if (isArMode) {
    return <ArViewer modelUrl={model.modelUrl} onExit={() => setIsArMode(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl relative">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 z-10">
          <X className="h-5 w-5" />
        </Button>
        <CardHeader>
          <CardTitle>{model.title}</CardTitle>
          <CardDescription>{model.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full h-96 bg-slate-100 rounded-lg overflow-hidden">
            <ModelViewer modelUrl={model.modelUrl} />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setIsArMode(true)}>
              <Box className="mr-2 h-4 w-4" />
              View in AR
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}