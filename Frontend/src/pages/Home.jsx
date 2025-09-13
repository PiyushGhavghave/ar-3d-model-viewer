import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthProvider";
import * as api from "../api";
import Header from "../components/Header";
import ModelViewModal from "../components/ModelViewModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Trash2, MoreVertical } from "lucide-react"; // Import MoreVertical
import { Link } from "react-router-dom";

export default function Home() {
    const { user, doLogout } = useAuth();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedModel, setSelectedModel] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null); // State to track which menu is open
    const menuRef = useRef(null);

    // Effect to close menu when clicking outside
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
        setOpenMenuId(null); // Close the menu

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
        e.stopPropagation(); // Prevent modal from opening
        setOpenMenuId(openMenuId === modelId ? null : modelId);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-slate-50">
            <Header onLogout={doLogout} appName="My 3D Models" />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                {loading && <p className="text-center">Loading your models...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                
                {!loading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {models.map(model => (
                            <Card 
                                key={model._id} 
                                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group relative"
                                onClick={() => setSelectedModel(model)}
                            >
                                {/* --- UPDATED: Options Menu --- */}
                                {user && user._id === model.user && (
                                    <div className="absolute top-2 right-2 z-10" ref={openMenuId === model._id ? menuRef : null}>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 rounded-full"
                                            onClick={(e) => toggleMenu(e, model._id)}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                        {openMenuId === model._id && (
                                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-20">
                                                <Button 
                                                    variant="ghost" 
                                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={(e) => handleDelete(e, model._id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </Button>
                                                {/* You can add more options here in the future */}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* --- End of Update --- */}

                                <div className="aspect-square bg-slate-100 overflow-hidden">
                                   <img 
                                    src={model.thumbnailUrl} 
                                    alt={model.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                   />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold truncate">{model.title}</h3>
                                    <p className="text-xs text-slate-500">Uploaded by you</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {selectedModel && <ModelViewModal model={selectedModel} onClose={() => setSelectedModel(null)} />}
        </div>
    );
}