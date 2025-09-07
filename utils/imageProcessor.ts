import { ImageFile, Adjustments, Curves, CurvePoint } from '../types';

// Helper for Catmull-Rom spline interpolation
function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

// Generates a lookup table (LUT) from a set of curve points
function generateLut(points: CurvePoint[]): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256);
  const sortedPoints = [...points].sort((a, b) => a.x - b.x);
  
  // Add virtual points for smooth start/end
  const p = [
    { x: sortedPoints[0].x, y: sortedPoints[0].y },
    ...sortedPoints,
    { x: sortedPoints[sortedPoints.length-1].x, y: sortedPoints[sortedPoints.length-1].y }
  ];

  let pointIndex = 0;
  for (let i = 0; i < 256; i++) {
    while (pointIndex < p.length - 1 && p[pointIndex + 1].x < i) {
      pointIndex++;
    }

    if (pointIndex < p.length - 1) {
      const p0 = p[pointIndex - 1] || p[pointIndex];
      const p1 = p[pointIndex];
      const p2 = p[pointIndex + 1];
      const p3 = p[pointIndex + 2] || p[pointIndex + 1];
      
      const t = (i - p1.x) / (p2.x - p1.x);
      
      lut[i] = catmullRom(p0.y, p1.y, p2.y, p3.y, t);
    } else {
        lut[i] = p[p.length - 1].y;
    }
  }
  return lut;
}


export const drawAdjustedImageToCanvas = (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  adjustments: Adjustments
) => {
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // LUTs for curves
    const lutR = generateLut(adjustments.curves.r);
    const lutG = generateLut(adjustments.curves.g);
    const lutB = generateLut(adjustments.curves.b);
    const lutRGB = generateLut(adjustments.curves.rgb);
    
    // Apply basic CSS filters that are performant
    const filters = [
      `brightness(${adjustments.brightness / 100})`,
      `contrast(${adjustments.contrast / 100})`,
      `saturate(${adjustments.saturation / 100})`,
    ].join(' ');
    
    ctx.filter = filters;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.filter = 'none'; // Reset filter to apply manual adjustments

    // Apply adjustments that don't have direct CSS filter equivalents or require pixel manipulation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i+1];
      let b = data[i+2];

      // Apply curves
      r = lutR[lutRGB[r]];
      g = lutG[lutRGB[g]];
      b = lutB[lutRGB[b]];
      
      data[i] = r;
      data[i+1] = g;
      data[i+2] = b;
    }

    ctx.putImageData(imageData, 0, 0);

    // Apply color filter if strength is greater than 0
    if (adjustments.filterStrength > 0) {
      ctx.globalCompositeOperation = 'soft-light';
      ctx.globalAlpha = adjustments.filterStrength / 100;
      ctx.fillStyle = adjustments.filterColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Reset context properties
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
    }
};


/**
 * Applies all visual adjustments to an image and returns a base64 data URL.
 * This function uses a canvas to "bake in" the adjustments.
 */
export const applyAdjustmentsToImage = (imageFile: ImageFile, adjustments: Adjustments): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      drawAdjustedImageToCanvas(canvas, img, adjustments);
      resolve(canvas.toDataURL(imageFile.type));
    };
    img.onerror = (err) => {
      reject(new Error('Failed to load image for processing.'));
    };
    img.src = imageFile.base64;
  });
};