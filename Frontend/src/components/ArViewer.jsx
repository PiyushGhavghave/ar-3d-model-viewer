// src/components/ArViewer.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ArViewer({ modelUrl, onExit }) {
  const canvasRef = useRef(null);
  const [isPlaceButtonVisible, setIsPlaceButtonVisible] = useState(false);
  const [isModelPlaced, setIsModelPlaced] = useState(false);
  const [isARActive, setIsARActive] = useState(false);

  // Persistent refs
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null); // the loaded model root
  const modelLoadedRef = useRef(false);
  const placeModelCallbackRef = useRef(null);

  useEffect(() => {
    let camera, scene, renderer;
    let hitTestSource = null;
    let hitTestSourceRequested = false;
    let arButtonEl = null;
    const tmpMatrix = new THREE.Matrix4();

    function init() {
      scene = new THREE.Scene();
      sceneRef.current = scene;

      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

      // Use the provided canvas so WebXR can use it
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: canvasRef.current,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      renderer.outputEncoding = THREE.sRGBEncoding;

      // IMPORTANT: allow camera feed to show through
      renderer.setClearColor(0x000000, 0); // transparent background
      rendererRef.current = renderer;

      // Lights
      scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(0, 5, 0);
      scene.add(directionalLight);

      // Add ARButton
      arButtonEl = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: document.body },
      });
      document.body.appendChild(arButtonEl);

      // session events
      renderer.xr.addEventListener('sessionstart', () => {
        setIsARActive(true);
        hitTestSourceRequested = false;
      });
      renderer.xr.addEventListener('sessionend', () => {
        setIsARActive(false);
        setIsPlaceButtonVisible(false);
        setIsModelPlaced(false);
        hitTestSource = null;
        hitTestSourceRequested = false;

        if (modelRef.current) {
          scene.remove(modelRef.current);
          modelRef.current = null;
          modelLoadedRef.current = false;
        }
      });

      window.addEventListener('resize', onWindowResize);

      // Preload GLTF model (hidden initially)
      if (modelUrl) {
        const loader = new GLTFLoader();
        loader.load(
          modelUrl,
          (gltf) => {
            // Use a group wrapper so transforms are predictable
            const wrapper = new THREE.Group();
            const model = gltf.scene;

            // Auto-scale to desired size (meters)
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x || 1, size.y || 1, size.z || 1);
            const desiredSize = Math.max(0.3, Math.min(1.5, maxDim)); // clamp slightly
            const scale = 0.3 / maxDim; // default desired size 0.3m
            model.scale.setScalar(scale);

            // center model geometry inside its local space
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center.multiplyScalar(scale));

            wrapper.add(model);
            wrapper.visible = false; // will be shown when a hit is available
            scene.add(wrapper);
            modelRef.current = wrapper;
            modelLoadedRef.current = true;
            console.log('GLTF loaded and prepped');
          },
          (progress) => {
            // optional: you can show progress
            // console.log('Model loading progress', progress);
          },
          (err) => {
            console.error('Failed to load GLTF model:', err);
            alert('Failed to load 3D model. Check console for details.');
          }
        );
      } else {
        console.warn('No modelUrl provided to ArViewer');
      }
    }

    function onWindowResize() {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function placeModel() {
      if (!modelRef.current) return;
      // When placing, we stop following the hit-test and keep current transform
      setIsModelPlaced(true);
      setIsPlaceButtonVisible(false);
      // modelRef.current remains visible and fixed in world space
    }
    placeModelCallbackRef.current = placeModel;

    function render(timestamp, frame) {
      if (!renderer) return;
      if (frame) {
        const session = renderer.xr.getSession();

        // get reference space from renderer — safe to call
        const referenceSpace = renderer.xr.getReferenceSpace ? renderer.xr.getReferenceSpace() : null;

        // Request hit test source once per session
        if (!hitTestSourceRequested && session) {
          session.requestReferenceSpace('viewer').then((refSpace) => {
            session
              .requestHitTestSource({ space: refSpace })
              .then((source) => {
                hitTestSource = source;
                console.log('Hit test source ready');
              })
              .catch((err) => console.error('requestHitTestSource failed:', err));
          });
          hitTestSourceRequested = true;
        }

        // If we have a hitTestSource, do hit testing while model not placed
        if (hitTestSource && modelLoadedRef.current && !isModelPlaced) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            if (pose && modelRef.current) {
              // Apply pose position & rotation but KEEP the model scale you precomputed
              tmpMatrix.fromArray(pose.transform.matrix);
              const pos = new THREE.Vector3();
              const quat = new THREE.Quaternion();
              tmpMatrix.decompose(pos, quat, new THREE.Vector3()); // ignore decomposed scale

              modelRef.current.position.copy(pos);
              modelRef.current.quaternion.copy(quat);
              modelRef.current.visible = true;

              // allow user to place
              setIsPlaceButtonVisible(true);
            } else {
              // no pose
              setIsPlaceButtonVisible(false);
              if (modelRef.current && !isModelPlaced) modelRef.current.visible = false;
            }
          } else {
            setIsPlaceButtonVisible(false);
            if (modelRef.current && !isModelPlaced) modelRef.current.visible = false;
          }
        }
      }

      renderer.render(scene, camera);
    }

    init();
    if (renderer) renderer.setAnimationLoop(render);

    // Cleanup
    return () => {
      if (renderer) renderer.setAnimationLoop(null);
      if (arButtonEl && arButtonEl.parentNode) arButtonEl.parentNode.removeChild(arButtonEl);
      window.removeEventListener('resize', onWindowResize);
      try {
        if (renderer) renderer.dispose();
      } catch (e) {
        console.warn('renderer.dispose error', e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, isModelPlaced]);

  // Make canvas full-screen and pointer-friendly
  useEffect(() => {
    const c = canvasRef.current;
    if (c) {
      c.style.position = 'absolute';
      c.style.top = '0';
      c.style.left = '0';
      c.style.width = '100%';
      c.style.height = '100%';
      c.style.touchAction = 'none'; // prevent scroll gestures interfering
    }
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        // do NOT set a black background; keep transparent so camera feed is visible
        backgroundColor: 'transparent',
      }}
    >
      <canvas ref={canvasRef} />

      {/* Exit Button */}
      <div style={{ position: 'absolute', top: 20, right: 20, pointerEvents: 'auto' }}>
        <button
          onClick={onExit}
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Exit AR
        </button>
      </div>

      {/* Place Model Button */}
      {isPlaceButtonVisible && !isModelPlaced && (
        <div
          style={{
            position: 'absolute',
            bottom: 100,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
          }}
        >
          <button
            onClick={() => {
              if (placeModelCallbackRef.current) placeModelCallbackRef.current();
            }}
            style={{
              padding: '14px 28px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: 24,
              fontSize: 18,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Place Model Here
          </button>
        </div>
      )}
    </div>
  );
}
