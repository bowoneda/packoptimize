"use client";

import { useState, useMemo, memo } from "react";
import { Html, Edges } from "@react-three/drei";
import type { Placement } from "@/types/api";

interface ItemMeshProps {
  placement: Placement;
}

function getItemColor(placement: Placement): { color: string; edgeColor: string } {
  if (placement.isFragile) {
    return { color: "#EF4444", edgeColor: "#B91C1C" };
  }
  if (placement.weight > 5000) {
    return { color: "#F59E0B", edgeColor: "#B45309" };
  }
  // Check if this looks like an insert material (no SKU or special name patterns)
  if (placement.sku === "" || placement.name.toLowerCase().includes("insert")) {
    return { color: "#3B82F6", edgeColor: "#1D4ED8" };
  }
  return { color: "#22C55E", edgeColor: "#15803D" };
}

function ItemMeshComponent({ placement }: ItemMeshProps) {
  const [hovered, setHovered] = useState(false);

  const { color, edgeColor } = useMemo(() => getItemColor(placement), [placement]);

  // Convert from corner position to center position for Three.js
  const position: [number, number, number] = [
    placement.x + placement.width / 2,
    placement.y + placement.height / 2,
    placement.z + placement.depth / 2,
  ];

  return (
    <mesh
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <boxGeometry args={[placement.width, placement.height, placement.depth]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={hovered ? 1.0 : 0.7}
        emissive={hovered ? color : "#000000"}
        emissiveIntensity={hovered ? 0.2 : 0}
      />
      <Edges color={edgeColor} threshold={15} />

      {hovered && (
        <Html
          position={[0, placement.height / 2 + 10, 0]}
          center
          style={{ pointerEvents: "none", zIndex: 50 }}
          zIndexRange={[50, 0]}
        >
          <div className="rounded-2xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] whitespace-nowrap -translate-y-full mb-2">
            <p className="font-semibold">{placement.name}</p>
            <p className="text-muted-foreground">SKU: {placement.sku}</p>
            <p className="text-muted-foreground">
              {placement.width} x {placement.height} x {placement.depth} mm
            </p>
            <p className="text-muted-foreground">{placement.weight}g</p>
            {placement.rotation !== 0 && (
              <p className="text-[#0B4228]">Rotated {placement.rotation}&deg;</p>
            )}
            {placement.isFragile && (
              <p className="text-red-600 font-medium">Fragile</p>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
}

export const ItemMesh = memo(ItemMeshComponent);
