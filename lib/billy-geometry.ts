import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Build a single merged BufferGeometry that approximates Billy.
// The result is centered and scaled to fit unit-bounding-sphere so it plays nicely
// with anything that expects normalised input (MeshSurfaceSampler, particle systems).
export function buildBillyGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];

  function addPart(geom: THREE.BufferGeometry, m: THREE.Matrix4) {
    const cloned = geom.clone();
    cloned.applyMatrix4(m);
    if (cloned.index) cloned.deleteAttribute('normal');
    parts.push(cloned);
  }

  const mat = new THREE.Matrix4();

  // BODY — tall ellipsoid
  const body = new THREE.SphereGeometry(0.55, 40, 28);
  body.scale(1, 1.5, 1);
  mat.makeTranslation(0, 0.95, 0);
  addPart(body, mat);
  body.dispose();

  // CROWN LEAVES — small cones
  const leafGeom = new THREE.ConeGeometry(0.14, 0.7, 6, 1, false);
  leafGeom.scale(1, 1, 0.45);
  const leafCount = 7;
  for (let i = 0; i < leafCount; i += 1) {
    const angle = (i / leafCount) * Math.PI * 2;
    const x = Math.cos(angle) * 0.08;
    const z = Math.sin(angle) * 0.08;
    const m = new THREE.Matrix4();
    m.makeTranslation(x, 2.03, z);
    const rot = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(-Math.cos(angle) * 0.4, angle, Math.sin(angle) * 0.4),
    );
    m.multiply(rot);
    addPart(leafGeom, m);
  }
  // central taller leaf
  const tallLeaf = new THREE.ConeGeometry(0.16, 0.84, 6, 1, false);
  tallLeaf.scale(1, 1, 0.45);
  mat.makeTranslation(0, 2.1, 0);
  addPart(tallLeaf, mat);
  tallLeaf.dispose();
  leafGeom.dispose();

  // EYES
  const eye = new THREE.SphereGeometry(0.13, 18, 12);
  for (const x of [-0.17, 0.17]) {
    mat.makeTranslation(x, 1.18, 0.46);
    addPart(eye, mat);
  }
  eye.dispose();

  // PUPILS
  const pupil = new THREE.SphereGeometry(0.05, 12, 10);
  for (const x of [-0.17, 0.17]) {
    mat.makeTranslation(x, 1.17, 0.56);
    addPart(pupil, mat);
  }
  pupil.dispose();

  // EYEBROWS
  const brow = new THREE.CapsuleGeometry(0.018, 0.13, 4, 8);
  for (const [x, tilt] of [
    [-0.17, 0.32],
    [0.17, -0.32],
  ] as const) {
    const m = new THREE.Matrix4();
    m.makeTranslation(x, 1.34, 0.5);
    m.multiply(new THREE.Matrix4().makeRotationZ(tilt));
    addPart(brow, m);
  }
  brow.dispose();

  // MOUTH — torus arc smile (approximated by a thick torus, sampler doesn't care)
  const mouthGeom = new THREE.TorusGeometry(0.16, 0.022, 8, 18, Math.PI);
  mat.identity();
  mat.makeTranslation(0, 0.96, 0.52);
  mat.multiply(new THREE.Matrix4().makeRotationX(Math.PI));
  addPart(mouthGeom, mat);
  mouthGeom.dispose();

  // ARMS
  const armUpper = new THREE.CapsuleGeometry(0.045, 0.4, 4, 8);
  const handGeom = new THREE.SphereGeometry(0.085, 12, 10);
  for (const side of [-1, 1] as const) {
    const m = new THREE.Matrix4();
    m.makeTranslation(side * 0.6, 1.1, 0);
    m.multiply(new THREE.Matrix4().makeRotationZ(side * 0.6));
    // upper arm — its capsule centre is at root, then offset by -0.2 on y
    const armMat = m.clone();
    armMat.multiply(new THREE.Matrix4().makeTranslation(0, -0.2, 0));
    addPart(armUpper, armMat);
    // hand — at the tip
    const handMat = m.clone();
    handMat.multiply(new THREE.Matrix4().makeTranslation(0, -0.42, 0));
    addPart(handGeom, handMat);
  }
  armUpper.dispose();
  handGeom.dispose();

  // LEGS
  const legUpper = new THREE.CapsuleGeometry(0.05, 0.3, 4, 8);
  const shoeTop = new THREE.SphereGeometry(0.1, 12, 10);
  shoeTop.scale(1, 0.7, 1.4);
  const shoeSole = new THREE.BoxGeometry(0.2, 0.04, 0.28);
  for (const side of [-1, 1] as const) {
    const m = new THREE.Matrix4();
    m.makeTranslation(side * 0.18, 0.32, 0);
    const upperMat = m.clone();
    upperMat.multiply(new THREE.Matrix4().makeTranslation(0, -0.15, 0));
    addPart(legUpper, upperMat);
    const topMat = m.clone();
    topMat.multiply(new THREE.Matrix4().makeTranslation(0, -0.32, 0));
    addPart(shoeTop, topMat);
    const soleMat = m.clone();
    soleMat.multiply(new THREE.Matrix4().makeTranslation(0, -0.37, 0));
    addPart(shoeSole, soleMat);
  }
  legUpper.dispose();
  shoeTop.dispose();
  shoeSole.dispose();

  // Merge requires geometries to either all have or all lack an index. SphereGeometry,
  // ConeGeometry, etc. all have indices; merge handles them correctly when uniform.
  // CapsuleGeometry / TorusGeometry also have indices. Force-normalise to non-indexed
  // for safety since we mixed primitive types.
  for (let i = 0; i < parts.length; i += 1) {
    parts[i] = parts[i].toNonIndexed();
  }

  const merged = mergeGeometries(parts, false);
  if (!merged) {
    // Fallback: return just the body
    const fallback = new THREE.SphereGeometry(1, 32, 24);
    return fallback;
  }
  for (const p of parts) p.dispose();

  merged.computeBoundingSphere();
  const radius = merged.boundingSphere?.radius ?? 1;
  merged.center();
  merged.scale(1 / radius, 1 / radius, 1 / radius);
  merged.computeVertexNormals();
  return merged;
}
