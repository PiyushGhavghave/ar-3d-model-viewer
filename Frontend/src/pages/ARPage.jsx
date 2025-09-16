import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../api';
import ArViewer from '../components/ArViewer';

// This page is loaded by mobile devices after scanning the QR code
export default function ARPage() {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const data = await api.getModelById(modelId);
        setModel(data);
      } catch (err) {
        setError(err.message || 'Failed to load model.');
      } finally {
        setLoading(false);
      }
    };
    if (modelId) {
        fetchModel();
    }
  }, [modelId]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-100">Loading AR Experience...</div>;
  }

  if (error) {
    return <div className="flex h-screen w-full items-center justify-center bg-slate-100 text-red-500">{error}</div>;
  }

  return <ArViewer modelUrl={model.modelUrl} onExit={() => navigate('/')} />;
}