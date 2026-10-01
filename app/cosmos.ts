import * as THREE from 'three';

// All sky particles are created once. The three distance shells give natural
// parallax when orbiting, without moving points or running per-particle JS.
const vertexShader = `
  attribute float pointSize;
  attribute float pointOpacity;
  varying vec3 tint;
  varying float alpha;
  uniform float pixelRatio;
  void main() {
    tint = color;
    alpha = pointOpacity;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * view;
    gl_PointSize = clamp(pointSize * pixelRatio * 100.0 / max(1.0, -view.z), .7, 52.0 * pixelRatio);
  }
`;
const fragmentShader = `
  varying vec3 tint;
  varying float alpha;
  void main() {
    float radius = length(gl_PointCoord - .5) * 2.0;
    if (radius > 1.0) discard;
    float glow = exp(-radius * radius * 4.0) * (1.0 - smoothstep(.65, 1.0, radius));
    gl_FragColor = vec4(tint, alpha * glow);
    #include <colorspace_fragment>
  }
`;

type Particle = {x: number; y: number; z: number; size: number; opacity: number; color: THREE.Color};

export function createCosmos(narrow: boolean, pixelRatio: number) {
  const sky = new THREE.Group();
  sky.name = 'Layered starfield and distant spiral galaxy';
  let seed = 73;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(random(), .0001))) * Math.cos(random() * Math.PI * 2);
  const materials: THREE.ShaderMaterial[] = [];
  const points = (particles: Particle[]) => {
    const geometry = new THREE.BufferGeometry();
    const position = new Float32Array(particles.length * 3);
    const color = new Float32Array(particles.length * 3);
    const size = new Float32Array(particles.length);
    const opacity = new Float32Array(particles.length);
    particles.forEach((p, i) => {
      position.set([p.x, p.y, p.z], i * 3);
      color.set([p.color.r, p.color.g, p.color.b], i * 3);
      size[i] = p.size;
      opacity[i] = p.opacity;
    });
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(color, 3));
    geometry.setAttribute('pointSize', new THREE.BufferAttribute(size, 1));
    geometry.setAttribute('pointOpacity', new THREE.BufferAttribute(opacity, 1));
    const material = new THREE.ShaderMaterial({
      vertexShader, fragmentShader, vertexColors: true,
      uniforms: {pixelRatio: {value: pixelRatio}},
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    materials.push(material);
    return new THREE.Points(geometry, material);
  };

  const silver = new THREE.Color('#cbd6df');
  const warm = new THREE.Color('#dec5a0');
  const blue = new THREE.Color('#8ba9c0');
  [
    {count: narrow ? 700 : 1300, distance: 78, size: .62, opacity: .4},
    {count: narrow ? 420 : 750, distance: 55, size: .77, opacity: .52},
    {count: narrow ? 90 : 150, distance: 36, size: 1.05, opacity: .72},
  ].forEach((layer, index) => {
    const particles: Particle[] = [];
    for (let i = 0; i < layer.count; i++) {
      const angle = random() * Math.PI * 2;
      const height = random() * 2 - 1;
      const radius = layer.distance + random() * 14;
      const circle = Math.sqrt(1 - height * height) * radius;
      particles.push({
        x: Math.cos(angle) * circle, y: height * radius, z: Math.sin(angle) * circle,
        size: layer.size * (.7 + random() * .95), opacity: layer.opacity * (.65 + random() * .35),
        color: i % 11 === 0 ? warm : i % 7 === 0 ? blue : silver,
      });
    }
    const stars = points(particles);
    stars.name = `Star depth ${index + 1}`;
    sky.add(stars);
  });

  const galaxy = new THREE.Group();
  galaxy.name = 'Quiet spiral galaxy';
  galaxy.position.set(narrow ? 1.1 : -3.7, narrow ? 7.3 : 5.1, -25);
  galaxy.rotation.set(.83, -.18, -.32);
  const disc = new THREE.Group();
  galaxy.add(disc);
  sky.add(galaxy);
  const center = new THREE.Color('#edd7b3');
  const middle = new THREE.Color('#a7b3b8');
  const edge = new THREE.Color('#537b8e');
  const sampleGalaxy = (haze: boolean): Particle => {
    const bulge = random() < .23;
    const radius = bulge ? Math.pow(random(), 2.1) * 3.2 : Math.pow(random(), .65) * 11.5;
    const arm = Math.floor(random() * 3) * Math.PI * 2 / 3;
    const spread = bulge ? random() * Math.PI * 2 : normal() * (.12 + radius * .009);
    const angle = arm + radius * .48 + spread;
    const scatter = bulge ? .14 : .13 + radius * .024;
    const tint = radius < 3
      ? center.clone().lerp(middle, radius / 3)
      : middle.clone().lerp(edge, Math.min((radius - 3) / 8.5, 1));
    return {
      x: Math.cos(angle) * radius + normal() * scatter,
      y: Math.sin(angle) * radius + normal() * scatter,
      z: normal() * (bulge ? .52 : .11 + radius * .012),
      size: haze ? 6 + random() * 10 : .36 + random() * .77,
      opacity: haze ? .012 + (1 - radius / 12) * .016 : .19 + random() * .32,
      color: tint,
    };
  };
  const haze = points(Array.from({length: narrow ? 650 : 1200}, () => sampleGalaxy(true)));
  haze.name = 'Soft galactic dust';
  disc.add(haze);
  const galaxyStars = points(Array.from({length: narrow ? 4200 : 7800}, () => sampleGalaxy(false)));
  galaxyStars.name = 'Spiral arms and luminous core';
  disc.add(galaxyStars);

  return {
    sky,
    update: (seconds: number) => { disc.rotation.z += seconds * .002; },
    setPixelRatio: (value: number) => { materials.forEach(material => { material.uniforms.pixelRatio.value = value; }); },
  };
}
