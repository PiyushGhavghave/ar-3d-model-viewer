import React, { useState, useEffect } from 'react';
import ModelViewer from './ModelViewer';
import QrCodeModal from './QrCodeModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Box } from 'lucide-react';
import { isArSupported } from '../lib/ar-support';

export default function ModelViewModal({ model, onClose, onEnterAr }) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [arIsSupported, setArIsSupported] = useState(false);
  
  useEffect(() => {
    isArSupported().then(setArIsSupported);
  }, []);

  if (!model) return null;

  const handleArClick = () => {
    if (arIsSupported) {
      onEnterAr(model.modelUrl);
    } else {
      setShowQrModal(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-2xl dark:shadow-2xl relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 z-10 text-gray-900 dark:text-gray-100">
            <X className="h-5 w-5" />
          </Button>
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">{model.title}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">{model.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 bg-slate-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <ModelViewer modelUrl={model.modelUrl} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleArClick} className="bg-blue-500 text-white dark:bg-blue-600 dark:hover:bg-blue-500">
                <Box className="mr-2 h-4 w-4" />
                View in AR
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      {showQrModal && (
        <QrCodeModal 
            url={`${window.location.origin}/ar/${model._id}`}
            onClose={() => setShowQrModal(false)}
        />
      )}
    </>
  );
}