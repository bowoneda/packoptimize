"use client";

import { Html } from "@react-three/drei";
import { BoxWireframe } from "./box-wireframe";
import { ItemMesh } from "./item-mesh";
import type { PackedBox } from "@/types/api";

interface PackedBoxSceneProps {
  packedBox: PackedBox;
  offsetX?: number;
}

export function PackedBoxScene({ packedBox, offsetX = 0 }: PackedBoxSceneProps) {
  const { box, placements, utilization, boxIndex, boxName } = packedBox;

  const utilizationColor =
    utilization > 0.7 ? "#22C55E" : utilization > 0.4 ? "#F59E0B" : "#EF4444";

  return (
    <group position={[offsetX, 0, 0]}>
      <BoxWireframe
        width={box.innerWidth}
        height={box.innerHeight}
        depth={box.innerDepth}
      />

      {placements.map((placement, i) => (
        <ItemMesh key={`${placement.itemId}-${i}`} placement={placement} />
      ))}

      {/* Label above box */}
      <Html
        position={[box.innerWidth / 2, box.innerHeight + 40, box.innerDepth / 2]}
        center
        style={{ pointerEvents: "none", zIndex: 0 }}
        zIndexRange={[0, 0]}
      >
        <div className="text-center whitespace-nowrap">
          <p className="text-xs font-semibold text-[#0B4228]">
            Box {boxIndex}: {boxName}
          </p>
          <p className="text-xs text-[#8B95A5] flex items-center justify-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: utilizationColor }}
            />
            Utilization: {(utilization * 100).toFixed(1)}%
          </p>
        </div>
      </Html>
    </group>
  );
}
