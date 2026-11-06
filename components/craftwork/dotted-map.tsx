// Dotted map, from craftwork.design/components/magic-ui/dotted-map
// Source: Magic UI by Dillion Verma (github.com/magicuidesign/magicui), MIT licence. The map is the
// original: svg-dotted-map's points, every other row staggered by half a step, markers on top with the
// optional pulse rings and a per-marker overlay. Ported changes: VISTASY tokens (dots in ink-4, markers in
// the violet accent), the library's `region` passed through so a map can show one part of the world, and
// two slots the original does not have: `renderRoute` (SVG drawn between the dots and the markers, with
// the markers' projected positions) and `renderLabels` (HTML laid over the map at those positions, so
// labels stay readable text at any width). The pulse loops, so it stays off unless asked for and is never
// drawn for reduced motion. No hooks beyond useMemo: it renders on the server and ships no script.
import * as React from "react";
import { createMap } from "svg-dotted-map";

import { cn } from "@/lib/utils";

export interface Marker {
  lat: number;
  lng: number;
  size?: number;
  pulse?: boolean;
}

/** addMarkers returns markers with lat/lng removed; only x, y and other props (e.g. size) remain */
export type MapMarker<M extends Marker> = Omit<M, "lat" | "lng"> & {
  x: number;
  y: number;
};

export interface DottedMapProps<M extends Marker = Marker> extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  mapSamples?: number;
  /** passed to svg-dotted-map: the part of the world to draw, in degrees */
  region?: { lat: { min: number; max: number }; lng: { min: number; max: number } };
  markers?: M[];
  dotColor?: string;
  markerColor?: string;
  dotRadius?: number;
  stagger?: boolean;
  pulse?: boolean;

  renderMarkerOverlay?: (args: { marker: MapMarker<M>; index: number; x: number; y: number; r: number }) => React.ReactNode;
  /** VISTASY: SVG between the dots and the markers (a route between them), in map units */
  renderRoute?: (markers: MapMarker<M>[]) => React.ReactNode;
  /** VISTASY: HTML over the map; place it with left = x / width and top = y / height */
  renderLabels?: (markers: MapMarker<M>[], size: { width: number; height: number }) => React.ReactNode;
}

export function DottedMap<M extends Marker = Marker>({
  width = 150,
  height = 75,
  mapSamples = 5000,
  region,
  markers = [],
  dotColor = "currentColor",
  markerColor = "var(--cross)",
  dotRadius = 0.2,
  stagger = true,
  pulse = false,
  renderMarkerOverlay,
  renderRoute,
  renderLabels,
  className,
  style,
  ...svgProps
}: DottedMapProps<M>) {
  const { points, addMarkers } = createMap({
    width,
    height,
    mapSamples,
    region,
  });
  const processedMarkers = addMarkers(markers) as unknown as MapMarker<M>[];

  // Compute stagger helpers in a single, simple pass
  const { xStep, yToRowIndex } = React.useMemo(() => {
    const sorted = [...points].sort((a, b) => a.y - b.y || a.x - b.x);
    const rowMap = new Map<number, number>();
    let step = 0;
    let prevY = Number.NaN;
    let prevXInRow = Number.NaN;

    for (const p of sorted) {
      if (p.y !== prevY) {
        // new row
        prevY = p.y;
        prevXInRow = Number.NaN;
        if (!rowMap.has(p.y)) rowMap.set(p.y, rowMap.size);
      }
      if (!Number.isNaN(prevXInRow)) {
        const delta = p.x - prevXInRow;
        if (delta > 0) step = step === 0 ? delta : Math.min(step, delta);
      }
      prevXInRow = p.x;
    }

    return { xStep: step || 1, yToRowIndex: rowMap };
  }, [points]);

  // the markers where they are drawn (with the stagger), for the route and the labels
  const placed = processedMarkers.map((marker) => {
    const rowIndex = yToRowIndex.get(marker.y) ?? 0;
    const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
    return { ...marker, x: marker.x + offsetX, y: marker.y };
  });

  const svg = (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("text-ink-4", className)} style={{ width: "100%", height: "100%", ...style }} {...svgProps}>
      {points.map((point, index) => {
        const rowIndex = yToRowIndex.get(point.y) ?? 0;
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
        return <circle cx={point.x + offsetX} cy={point.y} r={dotRadius} fill={dotColor} key={`${point.x}-${point.y}-${index}`} />;
      })}

      {renderRoute?.(placed)}

      {placed.map((marker, index) => {
        const { x, y } = marker;
        const r = marker.size ?? dotRadius;
        const shouldPulse = pulse ? marker.pulse !== false : marker.pulse === true;
        const pulseTo = r * 2.8;

        return (
          <g key={`${marker.x}-${marker.y}-${index}`}>
            <circle cx={x} cy={y} r={r} fill={markerColor} />

            {shouldPulse ? (
              <g pointerEvents="none" className="motion-reduce:hidden">
                <circle cx={x} cy={y} r={r} fill="none" stroke={markerColor} strokeOpacity={1} strokeWidth={0.35}>
                  <animate attributeName="r" values={`${r};${pulseTo}`} dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0" dur="1.4s" repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={y} r={r} fill="none" stroke={markerColor} strokeOpacity={0.9} strokeWidth={0.3}>
                  <animate attributeName="r" values={`${r};${pulseTo}`} dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.9;0" dur="1.4s" begin="0.7s" repeatCount="indefinite" />
                </circle>
              </g>
            ) : null}

            {renderMarkerOverlay?.({
              marker,
              index,
              x,
              y,
              r,
            })}
          </g>
        );
      })}
    </svg>
  );

  if (!renderLabels) return svg;
  return (
    <div className="relative" style={{ aspectRatio: `${width} / ${height}` }}>
      {svg}
      {renderLabels(placed, { width, height })}
    </div>
  );
}
