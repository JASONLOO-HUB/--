/**
 * Hero 背景地球：暖灰底 + 浅灰网格 + 灰色国界折线；选中内地/香港时仅该国界以橙色加粗线强调（无域内面填充）。
 * 岸线：ne_50m_neighbors_cn_window.geojson；ne_50m_admin_0_cn_hk；osm_hk_admin_913110.geojson（ODbL）。
 */
import * as THREE from 'three';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

const GEO_NEIGHBORS = new URL('./data/ne_50m_neighbors_cn_window.geojson', import.meta.url).href;
const GEO_CN_HK = new URL('./data/ne_50m_admin_0_cn_hk.geojson', import.meta.url).href;
const GEO_HK_DETAIL = new URL('./data/osm_hk_admin_913110.geojson', import.meta.url).href;

const COL_BG = 0xf2f0e9;
const COL_GLOBE = 0xeae7e0;
const COL_GRID = 0xd1d1d1;
const COL_BORDER = 0x9c9890;
const COL_BORDER_ACTIVE = 0xf97316;

function latLonToVec3(lat, lon, r) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function addCountryLines(group, geojson, color, opacity, r) {
  const lineMat = new THREE.LineBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
  });

  function ringToLine(ring) {
    const pts = ring.map(([lon, lat]) => latLonToVec3(lat, lon, r));
    if (pts.length < 2) return;
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.LineLoop(g, lineMat));
  }

  for (const f of geojson.features || []) {
    const geom = f.geometry;
    if (!geom) continue;
    if (geom.type === 'Polygon') {
      for (const ring of geom.coordinates) ringToLine(ring);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        for (const ring of poly) ringToLine(ring);
      }
    }
  }
}

function ringToClosedVec3(ring, r) {
  let pts = ring.map(([lon, lat]) => latLonToVec3(lat, lon, r));
  if (pts.length < 2) return null;
  const a = ring[0];
  const b = ring[ring.length - 1];
  if (a[0] === b[0] && a[1] === b[1]) pts = pts.slice(0, -1);
  if (pts.length < 2) return null;
  return pts;
}

function addBorderFatLines(group, geojson, r, lineMaterial) {
  function ringToLine2(ring) {
    const pts = ringToClosedVec3(ring, r);
    if (!pts) return;
    const flat = [];
    for (const p of pts) flat.push(p.x, p.y, p.z);
    const p0 = pts[0];
    flat.push(p0.x, p0.y, p0.z);
    const lg = new LineGeometry();
    lg.setPositions(flat);
    const line = new Line2(lg, lineMaterial);
    line.computeLineDistances();
    group.add(line);
  }

  for (const f of geojson.features || []) {
    const geom = f.geometry;
    if (!geom) continue;
    if (geom.type === 'Polygon') {
      for (const ring of geom.coordinates) ringToLine2(ring);
    } else if (geom.type === 'MultiPolygon') {
      for (const poly of geom.coordinates) {
        for (const ring of poly) ringToLine2(ring);
      }
    }
  }
}

function addGraticule(group, r, step) {
  const mat = new THREE.LineBasicMaterial({
    color: COL_GRID,
    transparent: true,
    opacity: 0.4,
  });
  const segs = 72;
  for (let lon = -180; lon < 180; lon += step) {
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const lat = -90 + (180 * i) / segs;
      pts.push(latLonToVec3(lat, lon, r));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.Line(g, mat));
  }
  for (let lat = -75; lat <= 80; lat += step) {
    const pts = [];
    for (let i = 0; i <= segs * 2; i++) {
      const lon = -180 + (360 * i) / (segs * 2);
      pts.push(latLonToVec3(lat, lon, r));
    }
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    group.add(new THREE.Line(g, mat));
  }
}

const REGIONS = {
  mainland: { lat: 33.2, lon: 104.5, dist: 1.94 },
  hk: { lat: 22.35, lon: 114.15, dist: 1.28 },
};

function initialHeroRegion() {
  const id = document.querySelector('[data-hero-region-tab].is-active')?.getAttribute('data-hero-region-tab');
  return id === 'hk' || id === 'mainland' ? id : 'hk';
}

function camPosFor(lat, lon, dist) {
  return latLonToVec3(lat, lon, dist);
}

function init() {
  const canvas = document.getElementById('hero-globe-canvas');
  const hero = document.getElementById('slide-hero');
  const stage = document.getElementById('hero-stage');
  if (!canvas || !hero || !stage) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(COL_BG, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, 0.08, 100);

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(1, 72, 56),
    new THREE.MeshBasicMaterial({ color: COL_GLOBE })
  );
  scene.add(globe);

  const linesR = 1.0015;
  const borderR = 1.0022;
  const borderHiR = 1.0025;
  const dotR = 1.0045;

  let highlightGroupMainland = null;
  let highlightGroupHk = null;
  let borderHighlightMat = null;

  addGraticule(globe, linesR, 15);

  const r0 = REGIONS[initialHeroRegion()];
  const state = {
    camGoal: camPosFor(r0.lat, r0.lon, r0.dist),
    animatingCam: false,
    dim: hero.classList.contains('is-active') ? 1 : 0.5,
  };

  camera.position.copy(state.camGoal);
  camera.lookAt(0, 0, 0);

  Promise.all([
    fetch(GEO_NEIGHBORS).then((r) => r.json()),
    fetch(GEO_CN_HK).then((r) => r.json()),
    fetch(GEO_HK_DETAIL).then((r) => r.json()),
  ])
    .then(([neighbors, cnhk, hkDetail]) => {
      const skip = new Set(['China', 'Hong Kong S.A.R.']);
      const neighborOnly = {
        type: 'FeatureCollection',
        features: (neighbors.features || []).filter((f) => !skip.has(f.properties?.ADMIN)),
      };
      addCountryLines(globe, neighborOnly, COL_BORDER, 1, borderR);
      const cnhkNoHk = {
        type: 'FeatureCollection',
        features: (cnhk.features || []).filter((f) => f.properties?.ADMIN !== 'Hong Kong S.A.R.'),
      };
      addCountryLines(globe, cnhkNoHk, COL_BORDER, 1, borderR);
      if (hkDetail && (hkDetail.features?.length ?? 0) > 0) {
        addCountryLines(globe, hkDetail, COL_BORDER, 1, dotR);
      }

      const w = Math.max(1, stage.clientWidth);
      const h = Math.max(1, stage.clientHeight);
      borderHighlightMat = new LineMaterial({
        color: COL_BORDER_ACTIVE,
        linewidth: 1,
        worldUnits: false,
        transparent: true,
        opacity: 0.79,
        resolution: new THREE.Vector2(w, h),
      });

      highlightGroupMainland = new THREE.Group();
      highlightGroupHk = new THREE.Group();
      globe.add(highlightGroupMainland);
      globe.add(highlightGroupHk);
      addBorderFatLines(highlightGroupMainland, cnhkNoHk, borderHiR, borderHighlightMat);
      if (hkDetail && (hkDetail.features?.length ?? 0) > 0) {
        addBorderFatLines(highlightGroupHk, hkDetail, dotR + 0.00025, borderHighlightMat);
      }
      const tabNow =
        document.querySelector('[data-hero-region-tab].is-active')?.getAttribute('data-hero-region-tab') ||
        initialHeroRegion();
      highlightGroupMainland.visible = tabNow === 'mainland';
      highlightGroupHk.visible = tabNow === 'hk';
    })
    .catch((err) => console.error('[hero-globe] geo load / build failed:', err));

  function resize() {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (borderHighlightMat) borderHighlightMat.resolution.set(w, h);
  }

  resize();
  window.addEventListener('resize', resize);

  function focusRegion(id, animate) {
    const r = REGIONS[id];
    if (!r) return;
    state.camGoal = camPosFor(r.lat, r.lon, r.dist);
    if (animate) {
      state.animatingCam = true;
    } else {
      camera.position.copy(state.camGoal);
      camera.lookAt(0, 0, 0);
      state.animatingCam = false;
    }
  }

  function bindTabs() {
    const tabs = document.querySelectorAll('[data-hero-region-tab]');
    const panels = document.querySelectorAll('[data-hero-region-panel]');

    function sync(id, animate = true) {
      tabs.forEach((btn) => {
        const on = btn.getAttribute('data-hero-region-tab') === id;
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        btn.classList.toggle('is-active', on);
        btn.setAttribute('tabindex', on ? '0' : '-1');
      });
      panels.forEach((p) => {
        const on = p.getAttribute('data-hero-region-panel') === id;
        p.toggleAttribute('hidden', !on);
      });
      if (highlightGroupMainland) highlightGroupMainland.visible = id === 'mainland';
      if (highlightGroupHk) highlightGroupHk.visible = id === 'hk';
      focusRegion(id, animate);
    }

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => sync(btn.getAttribute('data-hero-region-tab'), true));
    });

    const initial =
      document.querySelector('[data-hero-region-tab].is-active')?.getAttribute('data-hero-region-tab') ||
      initialHeroRegion();
    sync(initial, false);
  }

  bindTabs();

  const prefersReduced =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lerpK = prefersReduced ? 0.24 : 0.11;

  function frame() {
    requestAnimationFrame(frame);
    const on = hero.classList.contains('is-active');
    state.dim = THREE.MathUtils.lerp(state.dim, on ? 1 : 0.48, on ? 0.1 : 0.12);

    if (state.animatingCam) {
      camera.position.lerp(state.camGoal, lerpK);
      camera.lookAt(0, 0, 0);
      if (camera.position.distanceTo(state.camGoal) < 0.02) {
        camera.position.copy(state.camGoal);
        camera.lookAt(0, 0, 0);
        state.animatingCam = false;
      }
    }

    const g0 = new THREE.Color(COL_GLOBE);
    const g1 = new THREE.Color(0xd4cfc6);
    globe.material.color.copy(g0.lerp(g1, 1 - state.dim));
    renderer.render(scene, camera);
  }

  requestAnimationFrame(frame);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
