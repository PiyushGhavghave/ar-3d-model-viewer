// src/components/ArViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

export default function ArViewer({ modelUrl, onExit }) {
  const canvasRef = useRef(null);

  const [isPlaceButtonVisible, setIsPlaceButtonVisible] = useState(false);
  const [isModelPlaced, setIsModelPlaced] = useState(false);
  const [isARActive, setIsARActive] = useState(false);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const modelRef = useRef(null);
  const modelLoadedRef = useRef(false);
  const placeCallbackRef = useRef(null);
  const arButtonElRef = useRef(null);

  useEffect(() => {
    let camera, scene, renderer;
    let hitTestSource = null;
    let hitTestSourceRequested = false;
    const tmpMatrix = new THREE.Matrix4();

    // Prepare DRACO loader (required for Draco-compressed GLTF/GLB)
    const dracoLoader = new DRACOLoader();
    // Use Google's hosted decoders (works for most use-cases). You can serve locally if desired.
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

    async function loadModel(urlOrFile) {
      // Create GLTFLoader and attach dracoLoader
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      function onModelLoad(gltf) {
        try {
          const loadedModel = gltf.scene || gltf.scenes?.[0] || new THREE.Group();

          // compute bounding box & scale
          const box = new THREE.Box3().setFromObject(loadedModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x || 1, size.y || 1, size.z || 1);
          const desired = 0.3;
          const scale = desired / maxDim;
          loadedModel.scale.setScalar(scale);

          // center geometry
          const center = box.getCenter(new THREE.Vector3());
          loadedModel.position.sub(center.multiplyScalar(scale));

          const wrapper = new THREE.Group();
          wrapper.add(loadedModel);
          wrapper.visible = false;
          sceneRef.current.add(wrapper);
          modelRef.current = wrapper;
          modelLoadedRef.current = true;
          console.log("Model loaded (with DRACO support) ✅");
        } catch (e) {
          console.error("onModelLoad error:", e);
          alert("Failed to prepare model. See console.");
        }
      }

      function onModelError(err) {
        console.error("GLTF loader error:", err);
        alert(`Failed to load 3D model. Check console for details. ${err}`);
      }

      try {
        if (urlOrFile instanceof File) {
          const buffer = await urlOrFile.arrayBuffer();
          loader.parse(buffer, "", onModelLoad, onModelError);
          return;
        }

        if (typeof urlOrFile === "string") {
          const resp = await fetch(urlOrFile, { mode: "cors" });
          if (!resp.ok) throw new Error("HTTP " + resp.status);

          const contentType = (resp.headers.get("content-type") || "").toLowerCase();
          const lower = urlOrFile.toLowerCase();

          if (
            contentType.includes("model/gltf-binary") ||
            contentType.includes("application/octet-stream") ||
            lower.endsWith(".glb")
          ) {
            const buffer = await resp.arrayBuffer();
            loader.parse(buffer, "", onModelLoad, onModelError);
            return;
          }

          if (contentType.includes("application/json") || lower.endsWith(".gltf")) {
            const text = await resp.text();
            const basePath = urlOrFile.substring(0, urlOrFile.lastIndexOf("/") + 1);
            loader.parse(text, basePath, onModelLoad, onModelError);
            return;
          }

          // fallback parse attempt
          try {
            const buffer = await resp.arrayBuffer();
            loader.parse(buffer, "", onModelLoad, onModelError);
            return;
          } catch (err) {
            console.warn("arrayBuffer parse fallback failed, using loader.load", err);
            loader.load(urlOrFile, onModelLoad, undefined, onModelError);
            return;
          }
        }

        throw new Error("Unsupported modelUrl type");
      } catch (err) {
        console.error("loadModel error fallback:", err);
        try {
          loader.load(urlOrFile, onModelLoad, undefined, onModelError);
        } catch (e) {
          onModelError(e);
        }
      }
    }

    function init() {
      scene = new THREE.Scene();
      sceneRef.current = scene;

      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: canvasRef.current });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.xr.enabled = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;

      scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));
      const dir = new THREE.DirectionalLight(0xffffff, 0.8);
      dir.position.set(0, 5, 0);
      scene.add(dir);

      const btn = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
        domOverlay: { root: document.body },
      });
      document.body.appendChild(btn);
      arButtonElRef.current = btn;

      renderer.xr.addEventListener("sessionstart", () => {
        console.log("AR session started");
        setIsARActive(true);
        hitTestSourceRequested = false;
      });

      renderer.xr.addEventListener("sessionend", () => {
        console.log("AR session ended");
        setIsARActive(false);
        setIsPlaceButtonVisible(false);
        setIsModelPlaced(false);
        hitTestSource = null;
        hitTestSourceRequested = false;

        if (modelRef.current) {
          try {
            scene.remove(modelRef.current);
          } catch (e) {}
          modelRef.current = null;
          modelLoadedRef.current = false;
        }
      });

      window.addEventListener("resize", onWindowResize);

      if (modelUrl) loadModel(modelUrl);
      else console.warn("ArViewer: no modelUrl provided");
    }

    function onWindowResize() {
      if (!camera || !renderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function placeModel() {
      if (!modelRef.current) return;
      setIsModelPlaced(true);
      setIsPlaceButtonVisible(false);
    }
    placeCallbackRef.current = placeModel;

    function render(timestamp, frame) {
      if (!renderer) return;

      if (frame) {
        const session = renderer.xr.getSession();
        const referenceSpace = renderer.xr.getReferenceSpace ? renderer.xr.getReferenceSpace() : null;

        if (!hitTestSourceRequested && session) {
          session
            .requestReferenceSpace("viewer")
            .then((refSpace) => {
              session
                .requestHitTestSource({ space: refSpace })
                .then((source) => {
                  hitTestSource = source;
                  console.log("hitTestSource ready");
                })
                .catch((err) => console.error("requestHitTestSource failed:", err));
            })
            .catch((err) => console.error("requestReferenceSpace failed:", err));
          hitTestSourceRequested = true;
        }

        if (hitTestSource && modelLoadedRef.current && !isModelPlaced) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            if (pose && modelRef.current) {
              tmpMatrix.fromArray(pose.transform.matrix);
              const pos = new THREE.Vector3();
              const quat = new THREE.Quaternion();
              tmpMatrix.decompose(pos, quat, new THREE.Vector3());

              modelRef.current.position.copy(pos);
              modelRef.current.quaternion.copy(quat);
              modelRef.current.visible = true;

              setIsPlaceButtonVisible(true);
            } else {
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

    // cleanup
    return () => {
      try {
        if (renderer) renderer.setAnimationLoop(null);
        if (arButtonElRef.current && arButtonElRef.current.parentNode) {
          arButtonElRef.current.parentNode.removeChild(arButtonElRef.current);
        }
        window.removeEventListener("resize", onWindowResize);
        if (renderer) renderer.dispose();
      } catch (e) {
        console.warn("cleanup error:", e);
      } finally {
        // dispose draco loader
        try {
          dracoLoader.dispose();
        } catch (e) {
          /* ignore */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl, isModelPlaced]);

  useEffect(() => {
    const c = canvasRef.current;
    if (c) {
      c.style.position = "absolute";
      c.style.top = "0";
      c.style.left = "0";
      c.style.width = "100%";
      c.style.height = "100%";
      c.style.touchAction = "none";
    }
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "transparent" }}>
      <canvas ref={canvasRef} />

      <div style={{ position: "absolute", top: 20, right: 20, pointerEvents: "auto" }}>
        <button
          onClick={onExit}
          style={{
            padding: "10px 18px",
            backgroundColor: "rgba(255,255,255,0.95)",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Exit AR
        </button>
      </div>

      {isPlaceButtonVisible && !isModelPlaced && (
        <div style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)", pointerEvents: "auto" }}>
          <button
            onClick={() => {
              if (placeCallbackRef.current) placeCallbackRef.current();
            }}
            style={{
              padding: "14px 28px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 24,
              fontSize: 18,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Place Model Here
          </button>
        </div>
      )}

      {isARActive && !isPlaceButtonVisible && !isModelPlaced && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", color: "white", backgroundColor: "rgba(0,0,0,0.6)", padding: 14, borderRadius: 10, textAlign: "center", pointerEvents: "none" }}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>🔍 Scanning for surfaces...</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Move your device slowly</div>
        </div>
      )}

      {isModelPlaced && (
        <div style={{ position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)", backgroundColor: "rgba(76,175,80,0.95)", color: "white", padding: "8px 14px", borderRadius: 18, fontWeight: 700, pointerEvents: "none" }}>
          ✓ Model Placed
        </div>
      )}
    </div>
  );
}
