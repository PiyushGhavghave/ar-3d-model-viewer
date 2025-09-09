import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Bounds, Center } from "@react-three/drei";
import Model from "./Model";

export default function ModelViewer({ modelUrl }) {
  return (
    <div style={{ height: "500px", width: "100%" }}>
      <Canvas camera={{ position: [0, 0, 10], fov: 25 }}>
        {/* Adds soft lighting to the scene */}
        <ambientLight intensity={1.5} />
        {/* Adds a directional light to cast shadows */}
        <directionalLight position={[10, 10, 5]} intensity={2.5} />

        {/* Suspense provides a fallback while the model is loading */}
        <Suspense fallback={null}>
          {/* Bounds automatically fits the model to the view */}
          <Bounds fit clip observe margin={1.2}>
            <Center>
              <Model url={modelUrl} />
            </Center>
          </Bounds>
        </Suspense>

        {/* Allows the user to rotate the model with the mouse */}
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}