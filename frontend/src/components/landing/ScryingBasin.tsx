/**
 * The Scrying Basin — cursor-stirred liquid behind the landing hero.
 *
 * Shader derived from React Bits "LiquidChrome" (MIT + Commons Clause,
 * https://reactbits.dev/backgrounds/liquid-chrome), re-tinted to the Lunara
 * palette: indigo ink base, aqua specular, deep abyssal shadow.
 */
import { useEffect, useRef, useState } from "react";

import { BASIN_FALLBACK_CLASS } from "@/views/LandingView";

import { environmentFlags } from "./usePointerParallax";

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iMouse;
uniform vec2 iClickPos;
uniform float iClickTime;

const vec3 INK = vec3(0.055, 0.047, 0.114);
const vec3 AQUA = vec3(0.22, 0.65, 0.72);
const vec3 DEEP = vec3(0.04, 0.07, 0.18);

float noise(vec2 p) {
  return smoothstep(-0.5, 0.9, sin((p.x - p.y) * 555.0) * sin(p.y * 1444.0)) - 0.4;
}

float fabric(vec2 p) {
  mat2 m = mat2(0.06, 0.02, -0.02, -0.01);
  float f = 0.62 * noise(p);
  f += -0.43 * noise(p = m * p);
  f += -0.12 * noise(p = m * p);
  return f + 0.1 / noise(m * p);
}

float silk(vec2 uv, float t) {
  float s = sin(-15.0 * (uv.x + uv.y + cos(26.0 * uv.x + 5.0 * uv.y)) + sin(19.0 * (uv.x + uv.y)) - t);
  s = 1.17 + 0.01 * (s * s * 20.5 + s);
  s *= 0.8 + 0.91 * fabric(uv * min(iResolution.x, iResolution.y) * 0.5999);
  return s * 0.1009 + 0.8100;
}

void main() {
  float mr = min(iResolution.x, iResolution.y);
  vec2 uv = gl_FragCoord.xy / mr;
  float t = iTime;

  uv.y += 0.03 * sin(8.0 * uv.x - t);

  float timeSinceClick = t - iClickTime;
  if (timeSinceClick < 3.0 && iClickTime > 0.0) {
    vec2 clickUv = iClickPos.xy / mr;
    float dist = distance(clickUv, uv);
    float ripple = sin(dist * 50.0 - timeSinceClick * 12.0) * exp(-dist * 5.0 - timeSinceClick * 2.0);
    uv += normalize(uv - clickUv) * ripple * 0.08;
  }

  float mouseStir = iMouse.z * 0.5;
  uv += mouseStir * 0.02 * vec2(sin(uv.y * 14.0 + t * 2.0), cos(uv.x * 14.0 + t * 2.0));

  float s = sqrt(silk(uv, t));

  vec3 color = mix(INK, AQUA, smoothstep(0.72, 1.06, s));
  color = mix(DEEP, color, smoothstep(0.35, 0.72, s));

  float glint = pow(max(s - 0.98, 0.0) * 12.0, 2.0);
  color += AQUA * glint * 0.35;

  color = pow(color, vec3(0.52, 0.5, 0.4));
  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (shader === null) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export default function ScryingBasin() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);
  const { reducedMotion } = environmentFlags();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (gl === null) {
      setFailed(true);
      return;
    }
    const context: WebGLRenderingContext = gl;
    const surface: HTMLCanvasElement = canvas;

    const vertex = compile(context, context.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(context, context.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (vertex === null || fragment === null) {
      setFailed(true);
      return;
    }

    const program = context.createProgram();
    if (program === null) {
      setFailed(true);
      return;
    }
    context.attachShader(program, vertex);
    context.attachShader(program, fragment);
    context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    context.useProgram(program);

    const buffer = context.createBuffer();
    context.bindBuffer(context.ARRAY_BUFFER, buffer);
    context.bufferData(
      context.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      context.STATIC_DRAW,
    );
    const position = context.getAttribLocation(program, "position");
    context.enableVertexAttribArray(position);
    context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0);

    const uResolution = context.getUniformLocation(program, "iResolution");
    const uTime = context.getUniformLocation(program, "iTime");
    const uMouse = context.getUniformLocation(program, "iMouse");
    const uClickPos = context.getUniformLocation(program, "iClickPos");
    const uClickTime = context.getUniformLocation(program, "iClickTime");

    const mouse = { x: 0, y: 0, press: 0 };
    const click = { x: 0, y: 0, at: 0 };
    const startedAt = performance.now();
    const DPR_CAP = 1.5;

    function resize(): void {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      surface.width = Math.floor(surface.clientWidth * dpr);
      surface.height = Math.floor(surface.clientHeight * dpr);
    }
    resize();

    function onPointerMove(event: PointerEvent): void {
      const rect = surface.getBoundingClientRect();
      mouse.x = (event.clientX - rect.left) * Math.min(window.devicePixelRatio || 1, DPR_CAP);
      mouse.y = surface.height - (event.clientY - rect.top) * Math.min(window.devicePixelRatio || 1, DPR_CAP);
    }
    function onPointerDown(event: PointerEvent): void {
      onPointerMove(event);
      click.x = mouse.x;
      click.y = mouse.y;
      click.at = (performance.now() - startedAt) / 1000;
      mouse.press = 1;
    }
    function onPointerUp(): void {
      mouse.press = 0;
    }
    function onVisibility(): void {
      if (!document.hidden && !reducedMotion) requestFrame();
    }

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    let frameId = 0;
    let disposed = false;

    function draw(): void {
      context.viewport(0, 0, surface.width, surface.height);
      context.uniform2f(uResolution, surface.width, surface.height);
      context.uniform1f(uTime, (performance.now() - startedAt) / 1000);
      context.uniform3f(uMouse, mouse.x, mouse.y, mouse.press);
      context.uniform2f(uClickPos, click.x, click.y);
      context.uniform1f(uClickTime, click.at);
      context.drawArrays(context.TRIANGLE_STRIP, 0, 4);
    }

    function requestFrame(): void {
      if (disposed) return;
      frameId = requestAnimationFrame(loop);
    }

    function loop(): void {
      if (disposed || document.hidden) return;
      draw();
      requestFrame();
    }

    if (reducedMotion) {
      draw();
    } else {
      requestFrame();
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("visibilitychange", onVisibility);
      context.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reducedMotion]);

  if (failed) {
    return <div aria-hidden="true" className={BASIN_FALLBACK_CLASS} />;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      style={{ display: "block" }}
    />
  );
}
