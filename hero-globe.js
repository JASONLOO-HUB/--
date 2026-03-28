/**
 * Hero 背景地球：暖灰底 + 浅灰网格/国界；高亮区为参考图式「橙色圆点点彩」——随机散布 + 平滑变化的疏密（非刚性网格）。
 * 岸线：Natural Earth — ne_50m_neighbors_cn_window.geojson；内地/台湾轮廓 ne_50m_admin_0_cn_hk + 邻域 Taiwan；
 * 香港岸线 OpenStreetMap relation 913110（`osm_hk_admin_913110.geojson`，ODbL），与高亮同球面半径；点彩与内地同一套随机疏密与相同球点尺寸。地球仅由地区 tab 驱动相机。
 */
import * as THREE from 'three';

const GEO_NEIGHBORS = new URL('./data/ne_50m_neighbors_cn_window.geojson', import.meta.url).href;
const GEO_CN_HK = new URL('./data/ne_50m_admin_0_cn_hk.geojson', import.meta.url).href;
const GEO_HK_DETAIL = new URL('./data/osm_hk_admin_913110.geojson', import.meta.url).href;

const COL_BG = 0xf2f0e9;
const COL_GLOBE = 0xeae7e0;
const COL_GRID = 0xd1d1d1;
const COL_BORDER = 0x9c9890;
/** 点彩橙（对齐参考图约 #E7A13D） */
const COL_STIPPLE = 0xe7a13d;

function latLonToVec3(lat, lon, r) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function ringContains(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (Math.abs(yj - yi) < 1e-12) continue;
    const inter = (yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (inter) inside = !inside;
  }
  return inside;
}

function polygonContains(lon, lat, polygonCoords) {
  const outer = polygonCoords[0];
  if (!outer || !ringContains(lon, lat, outer)) return false;
  for (let h = 1; h < polygonCoords.length; h++) {
    if (ringContains(lon, lat, polygonCoords[h])) return false;
  }
  return true;
}

function geometryContains(geom, lon, lat) {
  if (!geom) return false;
  if (geom.type === 'Polygon') return polygonContains(lon, lat, geom.coordinates);
  if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      if (polygonContains(lon, lat, poly)) return true;
    }
  }
  return false;
}

function geometryBBox(geom) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  function consumeRing(ring) {
    for (const [lon, lat] of ring) {
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
  }
  if (geom.type === 'Polygon') {
    for (const ring of geom.coordinates) consumeRing(ring);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) {
      for (const ring of poly) consumeRing(ring);
    }
  }
  return { minLon, maxLon, minLat, maxLat };
}

function bboxUnion(a, b) {
  if (!b) return a;
  return {
    minLon: Math.min(a.minLon, b.minLon),
    maxLon: Math.max(a.maxLon, b.maxLon),
    minLat: Math.min(a.minLat, b.minLat),
    maxLat: Math.max(a.maxLat, b.maxLat),
  };
}

function addCountryLines(group, geojson, color, opacity, r) {
  const lineMat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
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

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 0.26–1：大块疏密变化 + 细颗粒，模仿参考图「有呼吸感」的点彩 */
function stippleAcceptWeight(lon, lat) {
  const low = 0.5 + 0.5 * Math.sin(lon * 0.092 + 0.8) * Math.cos(lat * 0.081 - 0.5);
  const mid = 0.5 + 0.5 * Math.sin((lon * 0.7 - lat * 0.55) * 0.11);
  const micro = 0.5 + 0.5 * Math.sin(lon * 0.38 + lat * 0.31);
  return Math.min(1, Math.max(0.26, 0.52 * low + 0.28 * mid + 0.2 * micro));
}

/**
 * 内地 ∪ 台湾 ＼ 香港：bbox 内均匀随机 + 多边形判定 + 按 stippleAcceptWeight 二次接受，得到非网格点彩。
 */
function sampleMainlandStipple(chinaGeom, hkGeom, twGeom, rSurf, targetCount, seed) {
  let b = geometryBBox(chinaGeom);
  if (twGeom) b = bboxUnion(b, geometryBBox(twGeom));
  const rng = mulberry32(seed);
  const pts = [];
  const maxAttempts = Math.min(2_200_000, Math.max(targetCount * 100, targetCount + 5000));
  let attempts = 0;
  function inMainland(lon, lat) {
    const inChina = geometryContains(chinaGeom, lon, lat);
    const inTw = twGeom && geometryContains(twGeom, lon, lat);
    if (!inChina && !inTw) return false;
    if (hkGeom && geometryContains(hkGeom, lon, lat)) return false;
    return true;
  }
  while (pts.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const lon = b.minLon + rng() * (b.maxLon - b.minLon);
    const lat = b.minLat + rng() * (b.maxLat - b.minLat);
    if (!inMainland(lon, lat)) continue;
    if (rng() > stippleAcceptWeight(lon, lat)) continue;
    pts.push(latLonToVec3(lat, lon, rSurf));
  }
  return pts;
}

function sampleHkStipple(hkGeom, rSurf, targetCount, seed) {
  const b = geometryBBox(hkGeom);
  const rng = mulberry32(seed);
  const pts = [];
  const maxAttempts = Math.min(800_000, targetCount * 120);
  let attempts = 0;
  while (pts.length < targetCount && attempts < maxAttempts) {
    attempts++;
    const lon = b.minLon + rng() * (b.maxLon - b.minLon);
    const lat = b.minLat + rng() * (b.maxLat - b.minLat);
    if (!geometryContains(hkGeom, lon, lat)) continue;
    if (rng() > stippleAcceptWeight(lon, lat)) continue;
    pts.push(latLonToVec3(lat, lon, rSurf));
  }
  return pts;
}

function makeStippleInstancedMesh(positions, sphereRadius) {
  if (positions.length === 0) return null;
  const geom = new THREE.SphereGeometry(sphereRadius, 7, 6);
  const mat = new THREE.MeshBasicMaterial({
    color: COL_STIPPLE,
    transparent: true,
    opacity: 0.93,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geom, mat, positions.length);
  const m = new THREE.Matrix4();
  for (let i = 0; i < positions.length; i++) {
    m.makeTranslation(positions[i].x, positions[i].y, positions[i].z);
    mesh.setMatrixAt(i, m);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.renderOrder = 2;
  return mesh;
}

const REGIONS = {
  mainland: { lat: 33.2, lon: 104.5, dist: 1.94 },
  /** dist 必须 > 1：相机在半径 1 的球外，lookAt(0) 才能看到朝外的香港一侧；0.62 会把相机放进球内，表面与点阵在身后。 */
  hk: { lat: 22.35, lon: 114.15, dist: 1.28 },
};

function camPosFor(lat, lon, dist) {
  return latLonToVec3(lat, lon, dist);
}

function init() {
  const canvas = document.getElementById('hero-globe-canvas');
  const hero = document.getElementById('slide-hero');
  const stage = document.getElementById('hero-stage');
  if (!canvas || !hero || !stage) return;

  const prefersReduced =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  /** 高亮实例与香港岸线共用同一球面半径，避免 zoom 时轮廓与填充视差错位 */
  const dotR = 1.0045;

  addGraticule(globe, linesR, 15);

  const state = {
    camGoal: camPosFor(REGIONS.mainland.lat, REGIONS.mainland.lon, REGIONS.mainland.dist),
    animatingCam: false,
    dim: hero.classList.contains('is-active') ? 1 : 0.5,
    focus: 'mainland',
    dotsMainland: null,
    dotsHk: null,
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
      addCountryLines(globe, neighborOnly, COL_BORDER, 0.95, borderR);
      const cnhkNoHk = {
        type: 'FeatureCollection',
        features: (cnhk.features || []).filter((f) => f.properties?.ADMIN !== 'Hong Kong S.A.R.'),
      };
      addCountryLines(globe, cnhkNoHk, COL_BORDER, 0.95, borderR);
      addCountryLines(globe, hkDetail, COL_BORDER, 0.95, dotR);

      const chinaFeat = cnhk.features?.find((f) => f.properties?.ADMIN === 'China');
      const hkFeat = hkDetail.features?.find((f) => f.properties?.ADMIN === 'Hong Kong S.A.R.');
      const twFeat = neighbors.features?.find((f) => f.properties?.ADMIN === 'Taiwan');
      const chinaGeom = chinaFeat?.geometry;
      const hkGeom = hkFeat?.geometry;
      const twGeom = twFeat?.geometry;

      if (chinaGeom && hkGeom) {
        const mainlandN = prefersReduced ? 5600 : 11800;
        const hkN = prefersReduced ? 320 : 720;
        const mainlandPts = sampleMainlandStipple(chinaGeom, hkGeom, twGeom, dotR, mainlandN, 0x9e3779b9);
        state.dotsMainland = makeStippleInstancedMesh(mainlandPts, 0.0036);
        if (state.dotsMainland) {
          state.dotsMainland.visible = state.focus === 'mainland';
          globe.add(state.dotsMainland);
        }

        const hkPts = sampleHkStipple(hkGeom, dotR, hkN, 0x85ebca6b);
        /** 香港区域小、相机更近：球点半径再小于内地，点数也更少 */
        state.dotsHk = makeStippleInstancedMesh(hkPts, 0.000875);
        if (state.dotsHk) {
          state.dotsHk.visible = state.focus === 'hk';
          globe.add(state.dotsHk);
        }
      }
    })
    .catch(() => {});

  function resize() {
    const w = Math.max(1, stage.clientWidth);
    const h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener('resize', resize);

  function applyFocus(id) {
    state.focus = id;
    if (state.dotsMainland) state.dotsMainland.visible = id === 'mainland';
    if (state.dotsHk) state.dotsHk.visible = id === 'hk';
  }

  function focusRegion(id, animate) {
    const r = REGIONS[id];
    if (!r) return;
    state.camGoal = camPosFor(r.lat, r.lon, r.dist);
    applyFocus(id);
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
      focusRegion(id, animate);
    }

    tabs.forEach((btn) => {
      btn.addEventListener('click', () => sync(btn.getAttribute('data-hero-region-tab'), true));
    });

    const initial =
      document.querySelector('[data-hero-region-tab].is-active')?.getAttribute('data-hero-region-tab') || 'mainland';
    sync(initial, false);
  }

  bindTabs();

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
    const dotOp = 0.93 * (0.45 + 0.55 * state.dim);
    if (state.dotsMainland) state.dotsMainland.material.opacity = dotOp;
    if (state.dotsHk) state.dotsHk.material.opacity = dotOp;

    renderer.render(scene, camera);
  }

  requestAnimationFrame(frame);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
