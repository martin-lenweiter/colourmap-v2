import { execSync } from 'node:child_process';

import type { NextConfig } from 'next';

/*
 * Resolve the current git branch + short SHA at build time so the
 * dev HUD can display "what am I looking at." On Vercel deploys,
 * Vercel already injects VERCEL_GIT_COMMIT_REF and VERCEL_GIT_COMMIT_SHA —
 * we prefer those when present and fall back to a local git call.
 */
function resolveBuildId(): { ref: string; sha: string } {
  const ref = process.env.VERCEL_GIT_COMMIT_REF;
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (ref && sha) return { ref, sha: sha.slice(0, 7) };
  try {
    const localRef = execSync('git rev-parse --abbrev-ref HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    const localSha = execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    return { ref: localRef, sha: localSha };
  } catch {
    return { ref: 'unknown', sha: '0000000' };
  }
}

const { ref: buildRef, sha: buildSha } = resolveBuildId();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_REF: buildRef,
    NEXT_PUBLIC_BUILD_SHA: buildSha,
  },
  // Allow kokoro-js (ONNX Runtime Web) to run client-side.
  // onnxruntime-node is the server-only binding — exclude it from
  // the browser bundle so the WASM backend is used instead.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node': false,
        sharp: false,
      };
    }
    return config;
  },
};

export default nextConfig;
