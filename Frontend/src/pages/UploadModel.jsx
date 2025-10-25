import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import Header from "../components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { UploadCloud } from "lucide-react";

export default function UploadModel() {
    const { doLogout } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ title: "", description: "" });
    const [modelFile, setModelFile] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleModelChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setModelFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!modelFile) {
            setMessage({ type: 'error', text: 'Please select a 3D model file.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const modelFormData = new FormData();
            modelFormData.append('file', modelFile);
            modelFormData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_RAW_UPLOAD_PRESET);
            // IMPORTANT: use the image upload endpoint (not raw)
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadResp = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                modelFormData
            );

            // Inspect this in debug if needed:
            // console.log('uploadResp.data', uploadResp.data);

            const { public_id: publicIdFromResp, format: modelFormat } = uploadResp.data;
            // publicIdFromResp is typically like "folder/name" or "name" (without double extension)

            // encode each segment but preserve slashes
            const encodedPublicId = publicIdFromResp
                .split('/')
                .map(s => encodeURIComponent(s))
                .join('/');

            // camera + size (follow Cloudinary docs examples)
            const cameraTransform = 'e_camera:up_20;right_-30;zoom_1.1;env_pillars;exposure_1.4';
            // request JPEG format; you can also add w_500,h_500 after f_jpg if you want
            const formatTransform = 'f_jpg,w_500,h_500';

            // Build delivery URL like the docs: /image/upload/<transforms>/<format>/<public_id>
            const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${cameraTransform}/${formatTransform}/${encodedPublicId}`;

            const modelData = {
                ...formData,
                modelUrl: uploadResp.data.secure_url,
                modelPublicId: publicIdFromResp,
                thumbnailUrl,
            };

            await api.uploadModel(modelData);

            setMessage({ type: 'success', text: 'Model uploaded successfully! Redirecting...' });
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            let errorMessage = err.message || 'Upload failed. Please try again.';
            if (err.response && err.response.data && err.response.data.error) {
                errorMessage = err.response.data.error.message;
            }
            setMessage({ type: 'error', text: errorMessage });
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-gray-900">
          <Header onLogout={doLogout} appName="Upload Model" />
          <main className="flex-grow container mx-auto p-4 md:p-8 flex items-start justify-center">
            <Card className="w-full max-w-2xl shadow-lg border-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <CardHeader>
                <CardTitle className="dark:text-gray-100">Upload a New 3D Model</CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-300">
                  Fill in the details and upload your model file. A thumbnail will be generated automatically.
                </CardDescription>
              </CardHeader>
            
              <CardContent>
                {message.text && (
                  <div
                    className={`p-3 rounded-md mb-4 text-sm ${
                      message.type === "success"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-400"
                    }`}
                  >
                    {message.text}
                  </div>
                )}
        
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="dark:text-gray-200">Model Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Antique Chair"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
            
                  <div className="space-y-2">
                    <Label htmlFor="description" className="dark:text-gray-200">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="A short description of your model."
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
            
                  <div className="space-y-2">
                    <Label htmlFor="model" className="dark:text-gray-200">3D Model File (.glb, .gltf)</Label>
                    <div className="w-full h-40 bg-slate-100 dark:bg-gray-700 rounded-md flex flex-col items-center justify-center text-center p-4 border border-gray-200 dark:border-gray-600">
                      <UploadCloud className="h-10 w-10 text-slate-400 dark:text-gray-400" />
                      {modelFile ? (
                        <p className="text-sm mt-2 text-slate-600 dark:text-gray-300 truncate w-full">
                          {modelFile.name}
                        </p>
                      ) : (
                        <p className="text-sm mt-2 text-slate-500 dark:text-gray-400">
                          Select a file to upload
                        </p>
                      )}
                    </div>
                    <Input
                      id="model"
                      type="file"
                      accept=".glb,.gltf"
                      onChange={handleModelChange}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                  >
                    {loading ? "Uploading..." : "Upload Model"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
);
}
