declare module "liquid-gl" {
  interface LiquidGLOptions {
    target?: string;
    snapshot?: string;
    resolution?: number;
    refraction?: number;
    aberration?: number;
    bevelDepth?: number;
    bevelWidth?: number;
    frost?: number;
    shadow?: boolean;
    specular?: boolean;
    reveal?: "none" | "fade";
    tilt?: boolean;
    tiltFactor?: number;
    tiltEase?: number;
    magnify?: number;
    on?: {
      init?: (instance: unknown) => void;
    };
  }

  interface LiquidGLLens {
    _element: HTMLElement;
  }

  interface LiquidGLSyncResult {
    lenis: unknown;
    locomotiveScroll: unknown;
  }

  interface LiquidGLStatic {
    (options: LiquidGLOptions): LiquidGLLens | LiquidGLLens[] | undefined;
    registerDynamic(elements: HTMLElement[] | NodeListOf<HTMLElement>): void;
    syncWith(config?: Record<string, unknown>): LiquidGLSyncResult;
  }

  const liquidGL: LiquidGLStatic;
  export default liquidGL;
}
