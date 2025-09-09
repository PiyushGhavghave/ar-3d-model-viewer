import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthProvider";
import ModelViewer from "../components/ModelViewer";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, Box, X } from "lucide-react"; // Changed File3d to Box

export default function Home() {
  const { user, doLogout } = useAuth();
  const [modelUrl, setModelUrl] = useState(null);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModelUrl(url);
      setFileName(file.name);
    }
  };

  const handleReset = () => {
    if (modelUrl) {
      URL.revokeObjectURL(modelUrl);
    }
    setModelUrl(null);
    setFileName("");
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <Header onLogout={doLogout} appName="3D AR Model Viewer" />

      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col items-center justify-center">
        {!modelUrl ? (
          <Card className="w-full max-w-lg text-center shadow-lg border-dashed border-2">
            <CardContent className="p-10">
              <UploadCloud className="mx-auto h-16 w-16 text-slate-400" />
              <h2 className="mt-4 text-xl font-semibold text-slate-700">
                Upload your 3D Model
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Supports .gltf and .glb files.
              </p>
              <Button
                className="mt-6"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".gltf,.glb"
                onChange={handleFileChange}
                className="hidden"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="w-full max-w-4xl">
            <Card className="w-full shadow-lg overflow-hidden">
                <div className="bg-slate-100 p-3 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-slate-600"/> 
                        <span className="text-sm font-medium text-slate-800">{fileName}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleReset}>
                        <X className="h-4 w-4"/>
                    </Button>
                </div>
              <ModelViewer modelUrl={modelUrl} />
            </Card>
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload a Different Model
              </Button>
               <input
                ref={fileInputRef}
                type="file"
                accept=".gltf,.glb"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}