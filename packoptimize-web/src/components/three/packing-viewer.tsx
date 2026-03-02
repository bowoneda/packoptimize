"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { PackedBoxScene } from "./packed-box-scene";
import type { PackedBox } from "@/types/api";

interface PackingViewerProps {
  packedBoxes: PackedBox[];
}

export default function PackingViewer({ packedBoxes }: PackingViewerProps) {
  // Calculate offsets so boxes are spaced along X axis
  const offsets = useMemo(() => {
    const result: number[] = [];
    let currentX = 0;

    for (let i = 0; i < packedBoxes.length; i++) {
      result.push(currentX);
      const box = packedBoxes[i].box;
      const gap = Math.max(box.innerWidth, box.innerDepth) * 0.2;
      currentX += box.innerWidth + gap;
    }

    return result;
  }, [packedBoxes]);

  // Calculate camera position based on total scene size
  const cameraPosition = useMemo((): [number, number, number] => {
    if (packedBoxes.length === 0) return [500, 400, 500];

    const lastOffset = offsets[offsets.length - 1] || 0;
    const lastBox = packedBoxes[packedBoxes.length - 1].box;
    const totalWidth = lastOffset + lastBox.innerWidth;
    const maxHeight = Math.max(...packedBoxes.map((b) => b.box.innerHeight));
    const maxDepth = Math.max(...packedBoxes.map((b) => b.box.innerDepth));

    const maxDim = Math.max(totalWidth, maxHeight, maxDepth);
    const distance = maxDim * 1.8;

    return [totalWidth / 2 + distance * 0.5, distance * 0.6, distance * 0.8];
  }, [packedBoxes, offsets]);

  // Camera target (center of scene)
  const cameraTarget = useMemo((): [number, number, number] => {
    if (packedBoxes.length === 0) return [0, 0, 0];

    const lastOffset = offsets[offsets.length - 1] || 0;
    const lastBox = packedBoxes[packedBoxes.length - 1].box;
    const totalWidth = lastOffset + lastBox.innerWidth;
    const maxHeight = Math.max(...packedBoxes.map((b) => b.box.innerHeight));
    const maxDepth = Math.max(...packedBoxes.map((b) => b.box.innerDepth));

    return [totalWidth / 2, maxHeight / 2, maxDepth / 2];
  }, [packedBoxes, offsets]);

  if (packedBoxes.length === 0) {
    return (
      <div className="flex h-[250px] sm:h-[400px] items-center justify-center bg-[#F5F6F8] rounded-2xl sm:rounded-3xl border border-gray-100 text-muted-foreground">
        No packed boxes to display
      </div>
    );
  }

  return (
    <div className="h-[300px] sm:h-[400px] lg:h-[500px] w-full rounded-2xl sm:rounded-3xl border border-gray-100 bg-[#F5F6F8]">
      <Canvas
        camera={{ position: cameraPosition, fov: 50, near: 1, far: 10000 }}
        style={{ borderRadius: "1.5rem" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[200, 400, 200]} intensity={0.8} />
        <directionalLight position={[-200, 300, -200]} intensity={0.3} />

        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={100}
          maxDistance={3000}
          target={cameraTarget}
        />

        <gridHelper
          args={[2000, 40, "#cbd5e1", "#e2e8f0"]}
          position={[cameraTarget[0], -1, cameraTarget[2]]}
        />

        {packedBoxes.map((box, i) => (
          <PackedBoxScene
            key={box.boxIndex}
            packedBox={box}
            offsetX={offsets[i]}
          />
        ))}
      </Canvas>
    </div>
  );
}
