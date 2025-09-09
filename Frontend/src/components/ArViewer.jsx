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

  // immediate control flags (refs to avoid closure problems)
  const placedRef = useRef(false);
  const hitTestSourceRef = useRef(null);

  // Gesture state refs
  const raycasterRef = useRef(new THREE.Raycaster());
  const draggingRef = useRef(false);
  const pinchRef = useRef(false);
  const initialPinchDistanceRef = useRef(0);
  const initialScaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const initialAngleRef = useRef(0);
  const initialRotationYRef = useRef(0);

  useEffect(() => {
    let camera, scene, renderer;
    let hitTestSource = null; // local reference used for cancel
    let hitTestSourceRequested = false;
    const tmpMatrix = new THREE.Matrix4();

    // Prepare DRACO loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");

    async function loadModel(urlOrFile) {
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);

      function onModelLoad(gltf) {
        try {
          const loadedModel = gltf.scene || gltf.scenes?.[0] || new THREE.Group();

          // bounding box & uniform scale
          const box = new THREE.Box3().setFromObject(loadedModel);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x || 1, size.y || 1, size.z || 1);
          const desired = 0.3; // meters
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
          console.log("Model loaded and ready");
        } catch (e) {
          console.error("onModelLoad error:", e);
          alert("Failed to prepare model. See console.");
        }
      }

      function onModelError(err) {
        console.error("GLTF loader error:", err);
        alert("Failed to load 3D model. Check console for details.");
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

          // fallback
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
        placedRef.current = false; // reset placed flag on new session
      });

      renderer.xr.addEventListener("sessionend", () => {
        console.log("AR session ended");
        setIsARActive(false);
        setIsPlaceButtonVisible(false);
        setIsModelPlaced(false);
        // cancel & clear hit test
        try {
          if (hitTestSource) {
            hitTestSource.cancel();
          }
        } catch (e) {}
        hitTestSource = null;
        hitTestSourceRequested = false;
        hitTestSourceRef.current = null;

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

    // Place model -> immediate effect via ref + cancel hits
    function placeModel() {
      if (!modelRef.current) return;
      // cancel hit test so no further hit results arrive
      try {
        if (hitTestSource) {
          hitTestSource.cancel();
          hitTestSource = null;
          hitTestSourceRef.current = null;
        }
      } catch (e) {
        console.warn("hitTestSource.cancel error:", e);
      }

      placedRef.current = true; // immediate stop for render loop
      setIsModelPlaced(true);
      setIsPlaceButtonVisible(false);
    }
    placeCallbackRef.current = placeModel;

    function getTouchPos(touch) {
      return { x: touch.clientX, y: touch.clientY };
    }
    function distanceBetweenTouches(t0, t1) {
      const dx = t1.clientX - t0.clientX;
      const dy = t1.clientY - t0.clientY;
      return Math.hypot(dx, dy);
    }
    function angleBetweenTouches(t0, t1) {
      return Math.atan2(t1.clientY - t0.clientY, t1.clientX - t0.clientX);
    }

    function onTouchStart(e) {
      if (!modelRef.current) return;
      e.preventDefault();

      if (e.touches.length === 1) {
        draggingRef.current = true;
      } else if (e.touches.length === 2) {
        pinchRef.current = true;
        const t0 = e.touches[0], t1 = e.touches[1];
        initialPinchDistanceRef.current = distanceBetweenTouches(t0, t1);
        initialScaleRef.current = modelRef.current.scale.clone();
        initialAngleRef.current = angleBetweenTouches(t0, t1);
        initialRotationYRef.current = modelRef.current.rotation.y;
      }
    }

    function onTouchMove(e) {
      if (!modelRef.current || !renderer || !camera) return;
      e.preventDefault();

      if (draggingRef.current && e.touches.length === 1) {
        const t = e.touches[0];
        const ndc = {
          x: (t.clientX / window.innerWidth) * 2 - 1,
          y: -(t.clientY / window.innerHeight) * 2 + 1,
        };
        raycasterRef.current.setFromCamera(ndc, camera);
        const planeY = modelRef.current.position.y;
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -planeY);
        const intersect = new THREE.Vector3();
        const intersected = raycasterRef.current.ray.intersectPlane(plane, intersect);
        if (intersected) {
          modelRef.current.position.copy(intersect);
        }
      }

      if (pinchRef.current && e.touches.length >= 2) {
        const t0 = e.touches[0], t1 = e.touches[1];
        const currDist = distanceBetweenTouches(t0, t1);
        if (initialPinchDistanceRef.current > 0) {
          const scaleFactor = currDist / initialPinchDistanceRef.current;
          const newScale = initialScaleRef.current.clone().multiplyScalar(scaleFactor);
          const min = 0.05, max = 5;
          newScale.x = THREE.MathUtils.clamp(newScale.x, min, max);
          newScale.y = THREE.MathUtils.clamp(newScale.y, min, max);
          newScale.z = THREE.MathUtils.clamp(newScale.z, min, max);
          modelRef.current.scale.copy(newScale);
        }

        const currAngle = angleBetweenTouches(t0, t1);
        const delta = currAngle - initialAngleRef.current;
        modelRef.current.rotation.y = initialRotationYRef.current - delta;
      }
    }

    function onTouchEnd(e) {
      e.preventDefault();
      if (e.touches.length === 0) {
        draggingRef.current = false;
        pinchRef.current = false;
      } else if (e.touches.length === 1) {
        draggingRef.current = true;
        pinchRef.current = false;
      }
    }

    function render(timestamp, frame) {
      if (!renderer) return;

      if (frame) {
        const session = renderer.xr.getSession();
        const referenceSpace = renderer.xr.getReferenceSpace ? renderer.xr.getReferenceSpace() : null;

        // request hit-test once per session
        if (!hitTestSourceRequested && session && !placedRef.current) {
          session
            .requestReferenceSpace("viewer")
            .then((refSpace) => {
              session
                .requestHitTestSource({ space: refSpace })
                .then((source) => {
                  hitTestSource = source;
                  hitTestSourceRef.current = source;
                  console.log("hitTestSource ready");
                })
                .catch((err) => console.error("requestHitTestSource failed:", err));
            })
            .catch((err) => console.error("requestReferenceSpace failed:", err));
          hitTestSourceRequested = true;
        }

        // update preview from hit-test only if not placed
        if (hitTestSource && modelLoadedRef.current && !placedRef.current) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            if (pose && modelRef.current) {
              tmpMatrix.fromArray(pose.transform.matrix);
              const pos = new THREE.Vector3();
              const quat = new THREE.Quaternion();
              tmpMatrix.decompose(pos, quat, new THREE.Vector3());

              // do not override while user is actively dragging/pinching
              if (!draggingRef.current && !pinchRef.current) {
                modelRef.current.position.copy(pos);
                modelRef.current.quaternion.copy(quat);
              }
              modelRef.current.visible = true;
              setIsPlaceButtonVisible(true);
            } else {
              setIsPlaceButtonVisible(false);
              if (modelRef.current && !placedRef.current) modelRef.current.visible = false;
            }
          } else {
            setIsPlaceButtonVisible(false);
            if (modelRef.current && !placedRef.current) modelRef.current.visible = false;
          }
        }
      }

      renderer.render(scene, camera);
    }

    // initialize & start animation loop
    init();
    if (renderer) renderer.setAnimationLoop(render);

    // attach touch listeners
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("touchstart", onTouchStart, { passive: false });
      canvas.addEventListener("touchmove", onTouchMove, { passive: false });
      canvas.addEventListener("touchend", onTouchEnd, { passive: false });
      canvas.addEventListener("touchcancel", onTouchEnd, { passive: false });
    }

    // cleanup on unmount
    return () => {
      try {
        if (renderer) renderer.setAnimationLoop(null);
        if (arButtonElRef.current && arButtonElRef.current.parentNode) {
          arButtonElRef.current.parentNode.removeChild(arButtonElRef.current);
        }
        window.removeEventListener("resize", onWindowResize);
        if (canvas) {
          canvas.removeEventListener("touchstart", onTouchStart);
          canvas.removeEventListener("touchmove", onTouchMove);
          canvas.removeEventListener("touchend", onTouchEnd);
          canvas.removeEventListener("touchcancel", onTouchEnd);
        }
        if (renderer) renderer.dispose();
      } catch (e) {
        console.warn("cleanup error:", e);
      } finally {
        try {
          dracoLoader.dispose();
        } catch (e) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelUrl]); // do NOT depend on isModelPlaced to avoid re-init on place

  // style canvas full-screen
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
