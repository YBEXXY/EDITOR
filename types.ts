export interface ImageFile {
  name: string;
  type: string;
  base64: string;
}

export interface EditImageResult {
  editedImage: string | null;
  text: string | null;
}

export type EditMode = 'global' | 'mask';

export interface CurvePoint {
  x: number;
  y: number;
}

export type CurvesChannel = CurvePoint[];

export interface Curves {
  rgb: CurvesChannel;
  r: CurvesChannel;
  g: CurvesChannel;
  b: CurvesChannel;
}

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  exposure: number;
  highlights: number;
  shadows: number;
  temperature: number;
  tint: number;
  sharpen: number;
  vignette: number;
  grain: number;
  curves: Curves;
  filterColor: string;
  filterStrength: number;
}

export type BlendMode = 'source-over' | 'multiply' | 'screen' | 'overlay' | 'soft-light';

export interface BrushSettings {
  size: number;
  hardness: number; // 0 to 1
  opacity: number; // 0 to 1
  mode: 'brush' | 'eraser';
  feather: number; // in pixels
  blendMode: BlendMode;
}