"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface BoxWireframeProps {
  width: number;
  height: number;
  depth: number;
}

export function BoxWireframe({ width, height, depth }: BoxWireframeProps) {
  const geometry = useMemo(() => {
    const box = new THREE.BoxGeometry(width, height, depth);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    return edges;
  }, [width, height, depth]);

  return (
    <lineSegments
      geometry={geometry}
      position={[width / 2, height / 2, depth / 2]}
    >
      <lineBasicMaterial color="#94a3b8" />
    </lineSegments>
  );
}
