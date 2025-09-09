import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three-stdlib';
import { Button } from "@/components/ui/button";

export default function ArViewer({ modelUrl, onExit }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    // === Core Three.js Variables ===
    const canvas = canvasRef.current;
    let camera, scene, renderer, reticle;
    let hitTestSource = null;
    let hitTestSourceRequested = false;
    let arButton;
    let loadedModel = null;

    // Initialize the Three.js scene
    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvas });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;

      // Add basic lighting
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
      light.position.set(0.5, 1, 0.25);
      scene.add(light);
      
      // Create and append the AR button
      arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] });
      document.body.appendChild(arButton);
      
      // Reticle to show placement position
      reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.045, 0.05, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial()
      );
      reticle.matrixAutoUpdate = false;
      reticle.visible = false;
      scene.add(reticle);

      // Handle user tap/select event
      renderer.xr.addEventListener('sessionstart', () => {
        const session = renderer.xr.getSession();
        session.addEventListener('select', onSelect);
      });
      
      window.addEventListener('resize', onWindowResize);
    }

    // Handle screen resize
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Called when the user taps the screen
    function onSelect() {
      if (reticle.visible && !loadedModel) {
        const loader = new GLTFLoader();
        loader.load(modelUrl, (gltf) => {
          loadedModel = gltf.scene;
          
          // Auto-scale the model to a reasonable size
          const box = new THREE.Box3().setFromObject(loadedModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 0.5 / maxDim; // Scale to be about 0.5 meters
          loadedModel.scale.set(scale, scale, scale);

          // This is the stable placement logic from your measurement app
          loadedModel.matrix.copy(reticle.matrix);
          loadedModel.matrixAutoUpdate = false; // <<< KEY FOR STABILITY
          
          scene.add(loadedModel);
          reticle.visible = false; // Hide reticle after placing
        });
      }
    }

    // The animation loop
    function render(timestamp, frame) {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();
        
        if (!hitTestSourceRequested) {
          session.requestReferenceSpace('viewer').then((refSpace) => {
            session.requestHitTestSource({ space: refSpace }).then((source) => {
              hitTestSource = source;
            });
          });
          hitTestSourceRequested = true;
        }
        
        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            if (reticle && !loadedModel) {
              reticle.visible = true;
              reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
            }
          } else {
            if (reticle) reticle.visible = false;
          }
        }
      }
      renderer.render(scene, camera);
    }

    init();
    renderer.setAnimationLoop(render);

    // Cleanup function when the component unmounts
    return () => {
      renderer.setAnimationLoop(null);
      if (arButton && arButton.parentNode) {
        document.body.removeChild(arButton);
      }
      window.removeEventListener('resize', onWindowResize);
    };
  }, [modelUrl, onExit]);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <canvas ref={canvasRef}></canvas>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
        <Button onClick={onExit}>Exit AR</Button>
      </div>
    </div>
  );
}