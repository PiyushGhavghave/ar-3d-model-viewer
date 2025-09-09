import React from "react";
import { useGLTF } from "@react-three/drei";

export default function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}