import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import * as api from "../api";
import Header from "../components/Header";
import ModelViewModal from "../components/ModelViewModal";
import ArViewer from "../components/ArViewer"; // Import ArViewer here
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, MoreVertical } from "lucide-react";

export default function Home() {
  const { user, doLogout } = useAuth();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const [isArMode, setIsArMode] = useState(false);
  const [arModelUrl, setArModelUrl] = useState(null);
  
  const menuRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setOpenMenuId(null);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await api.getAllModels();
        setModels(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch your models.');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
        fetchModels();
    }
  }, [user]);

  const handleDelete = async (e, modelId) => {
    e.stopPropagation();
    setOpenMenuId(null);

    if (window.confirm("Are you sure you want to delete this model? This action cannot be undone.")) {
        try {
            await api.deleteModel(modelId);
            setModels(prevModels => prevModels.filter(model => model._id !== modelId));
        } catch (err) {
            setError(err.message || 'Failed to delete the model.');
        }
    }
  };

  const toggleMenu = (e, modelId) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === modelId ? null : modelId);
  };

  const handleEnterAr = (modelUrl) => {
    setArModelUrl(modelUrl);
    setIsArMode(true);
    setSelectedModel(null); // Close the modal when entering AR
  };

  if (isArMode && arModelUrl) {
    return <ArViewer modelUrl={arModelUrl} onExit={() => setIsArMode(false)} />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-gray-900">
      <Header onLogout={doLogout} appName="My 3D Models" />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {loading && <p className="text-center text-gray-900 dark:text-gray-100">Loading your models...</p>}
        {error && <p className="text-center text-red-500 dark:text-red-400">{error}</p>}
        
        {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {models.map(model => (
                    <Card 
                        key={model._id} 
                        className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group relative bg-white dark:bg-gray-800"
                        onClick={() => setSelectedModel(model)}
                    >
                        {user && user._id === model.user && (
                            <div className="absolute top-2 right-2 z-10" ref={openMenuId === model._id ? menuRef : null}>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full bg-white/50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-600"
                                    onClick={(e) => toggleMenu(e, model._id)}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                {openMenuId === model._id && (
                                    <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                                        <Button 
                                            variant="ghost" 
                                            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900"
                                            onClick={(e) => handleDelete(e, model._id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="aspect-square bg-slate-100 dark:bg-gray-700 overflow-hidden">
                           <img 
                            src={model.thumbnailUrl} 
                            alt={model.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                           />
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold truncate text-gray-900 dark:text-gray-100">{model.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-gray-400">Uploaded by you</p>
                        </div>
                    </Card>
                ))}
            </div>
        )}
      </main>

      {selectedModel && (
        <ModelViewModal 
            model={selectedModel} 
            onClose={() => setSelectedModel(null)}
            onEnterAr={handleEnterAr} // Pass the new handler function
        />
      )}
    </div>
  );
}