import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ArViewer({ modelUrl, onExit }) {
  const canvasRef = useRef(null);
  const [isPlaceButtonVisible, setIsPlaceButtonVisible] = useState(false);
  const [isModelPlaced, setIsModelPlaced] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  
  // Store references that need to persist across renders
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const reticleRef = useRef(null);
  const modelRef = useRef(null);
  const placeModelCallbackRef = useRef(null);

  useEffect(() => {
    // === Core Three.js Variables ===
    const canvas = canvasRef.current;
    let camera, scene, renderer, reticle;
    let hitTestSource = null;
    let hitTestSourceRequested = false;
    let arButton;
    let controller;

    // Initialize the Three.js scene
    function init() {
      scene = new THREE.Scene();
      sceneRef.current = scene;
      
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      
      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        canvas: canvas 
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      rendererRef.current = renderer;

      // Add lighting
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      light.position.set(0.5, 1, 0.25);
      scene.add(light);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 5, 0);
      scene.add(directionalLight);
      
      // Create and append the AR button
      arButton = ARButton.createButton(renderer, { 
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body }
      });
      document.body.appendChild(arButton);
      
      // Create reticle for placement preview
      const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
      const reticleMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ff00,
        opacity: 0.75,
        transparent: true
      });
      reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      scene.add(reticle);
      reticleRef.current = reticle;

      // Add controller for interaction
      controller = renderer.xr.getController(0);
      scene.add(controller);

      // Handle AR session events
      renderer.xr.addEventListener('sessionstart', () => {
        console.log('AR Session started');
        setIsARActive(true);
        hitTestSourceRequested = false;
      });

      renderer.xr.addEventListener('sessionend', () => {
        console.log('AR Session ended');
        setIsARActive(false);
        setIsPlaceButtonVisible(false);
        setIsModelPlaced(false);
        hitTestSource = null;
        hitTestSourceRequested = false;
        
        // Clean up placed model
        if (modelRef.current) {
          scene.remove(modelRef.current);
          modelRef.current = null;
        }
      });
      
      window.addEventListener('resize', onWindowResize);
    }

    // Handle screen resize
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Place model function
    function placeModel() {
      if (reticleRef.current && reticleRef.current.visible && !modelRef.current) {
        console.log('Placing model at reticle position');
        
        const loader = new GLTFLoader();
        loader.load(
          modelUrl, 
          (gltf) => {
            const model = gltf.scene;
            
            // Calculate bounding box and auto-scale
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const desiredSize = 0.3; // Desired size in meters
            const scale = desiredSize / maxDim;
            model.scale.set(scale, scale, scale);

            // Center the model
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center.multiplyScalar(scale));

            // Create a group to hold the model
            const modelGroup = new THREE.Group();
            modelGroup.add(model);
            
            // Copy position from reticle
            modelGroup.position.setFromMatrixPosition(reticleRef.current.matrix);
            
            // Add a slight rotation for better initial view
            modelGroup.rotation.y = 0;
            
            // Add to scene
            sceneRef.current.add(modelGroup);
            modelRef.current = modelGroup;
            
            // Hide reticle and button after placement
            reticleRef.current.visible = false;
            setIsPlaceButtonVisible(false);
            setIsModelPlaced(true);
            
            console.log('Model placed successfully');
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total) * 100, '%');
          },
          (error) => {
            console.error('Error loading model:', error);
            alert('Failed to load 3D model. Please try again.');
          }
        );
      }
    }

    // Store the placeModel function in ref so it can be accessed by button
    placeModelCallbackRef.current = placeModel;

    // The animation loop
    function render(timestamp, frame) {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();
        
        // Request hit test source
        if (!hitTestSourceRequested && session) {
          session.requestReferenceSpace('viewer').then((refSpace) => {
            session.requestHitTestSource({ space: refSpace }).then((source) => {
              hitTestSource = source;
              console.log('Hit test source obtained');
            }).catch((err) => {
              console.error('Failed to request hit test source:', err);
            });
          }).catch((err) => {
            console.error('Failed to request reference space:', err);
          });
          hitTestSourceRequested = true;
        }
        
        // Perform hit testing
        if (hitTestSource && !modelRef.current) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            
            if (pose && reticleRef.current) {
              reticleRef.current.visible = true;
              reticleRef.current.matrix.fromArray(pose.transform.matrix);
              
              // Show place button when reticle is visible
              if (!isModelPlaced) {
                setIsPlaceButtonVisible(true);
              }
            }
          } else {
            if (reticleRef.current) {
              reticleRef.current.visible = false;
            }
            setIsPlaceButtonVisible(false);
          }
        }
      }
      
      renderer.render(scene, camera);
    }

    init();
    renderer.setAnimationLoop(render);

    // Cleanup function
    return () => {
      console.log('Cleaning up AR viewer');
      renderer.setAnimationLoop(null);
      
      if (arButton && arButton.parentNode) {
        document.body.removeChild(arButton);
      }
      
      window.removeEventListener('resize', onWindowResize);
      
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [modelUrl]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      backgroundColor: 'black'
    }}>
      <canvas ref={canvasRef} style={{ display: 'block' }}></canvas>
      
      {/* UI Overlay */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        pointerEvents: 'none'
      }}>
        {/* Exit Button */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          pointerEvents: 'auto'
        }}>
          <button 
            onClick={onExit}
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            Exit AR
          </button>
        </div>

        {/* Place Model Button */}
        {isPlaceButtonVisible && !isModelPlaced && (
          <div style={{ 
            position: 'absolute', 
            bottom: '100px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            pointerEvents: 'auto'
          }}>
            <button 
              onClick={() => {
                if (placeModelCallbackRef.current) {
                  placeModelCallbackRef.current();
                }
              }}
              style={{
                padding: '16px 32px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                animation: 'pulse 2s infinite'
              }}
            >
              Place Model Here
            </button>
          </div>
        )}

        {/* Status Messages */}
        {isARActive && !isPlaceButtonVisible && !isModelPlaced && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '20px',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '20px', marginBottom: '10px' }}>
              🔍 Scanning for surfaces...
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Move your device slowly to detect planes
            </div>
          </div>
        )}

        {isModelPlaced && (
          <div style={{ 
            position: 'absolute', 
            top: '80px', 
            left: '50%', 
            transform: 'translateX(-50%)',
            textAlign: 'center',
            color: 'white',
            backgroundColor: 'rgba(76, 175, 80, 0.9)',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '16px'
          }}>
            ✓ Model Placed Successfully
          </div>
        )}
      </div>

      {/* Add pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}