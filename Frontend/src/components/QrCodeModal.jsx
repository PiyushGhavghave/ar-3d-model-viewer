import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { X, Smartphone } from 'lucide-react';

export default function QrCodeModal({ url, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-70 z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-sm relative bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-2 right-2 z-10 text-gray-900 dark:text-gray-100">
          <X className="h-5 w-5" />
        </Button>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-gray-100">
            <Smartphone className="mr-2"/>View in Your Space
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Scan this QR code with your mobile device's camera to view this model in Augmented Reality.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <QRCodeSVG 
            value={url} 
            size={256} 
            bgColor={document.documentElement.classList.contains('dark') ? "#1f2937" : "#ffffff"} 
            fgColor={document.documentElement.classList.contains('dark') ? "#e5e7eb" : "#000000"} 
            level={"L"} 
            includeMargin={false} 
          />
        </CardContent>
      </Card>
    </div>
  );
}