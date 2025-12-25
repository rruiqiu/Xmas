import * as THREE from 'three';

// Generate points for a cone (Tree) - Generic for Gems
export const generateGemPositions = (count: number, radius: number, height: number) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const dummyColor = new THREE.Color();
  
  // Jewel tones palette
  const gemColors = [
      '#e60000', // Ruby
      '#00e600', // Emerald
      '#0000e6', // Sapphire
      '#e6e600', // Gold/Topaz
      '#00e6e6', // Cyan/Aquamarine
      '#e600e6', // Amethyst
      '#ffffff', // Diamond
  ];

  for (let i = 0; i < count; i++) {
    // Normalized height (0 at bottom, 1 at top)
    const yNorm = Math.pow(Math.random(), 1.5); // Bias towards bottom for density
    const y = yNorm * height;
    
    // Radius at this height
    const r = (1 - yNorm) * radius;
    
    // Random angle
    const theta = Math.random() * Math.PI * 2;
    
    // Random distance from center (solid cone)
    const dist = Math.sqrt(Math.random()) * r;

    const x = Math.cos(theta) * dist;
    const z = Math.sin(theta) * dist;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y - height / 2; // Center vertically
    positions[i * 3 + 2] = z;

    // Random Gem Color
    dummyColor.set(gemColors[Math.floor(Math.random() * gemColors.length)]);
    
    // Add some variation
    dummyColor.multiplyScalar(0.8 + Math.random() * 0.4);

    colors[i * 3] = dummyColor.r;
    colors[i * 3 + 1] = dummyColor.g;
    colors[i * 3 + 2] = dummyColor.b;
  }
  return { positions, colors };
};

// Generate pearl necklace positions (Drapes)
export const generatePearlPositions = (count: number, radius: number, height: number) => {
    const positions = new Float32Array(count * 3);
    const loops = 8; // Number of necklace loops around the tree
    
    for (let i = 0; i < count; i++) {
        const t = i / count; // 0 to 1
        
        // Helix calculation
        const theta = t * Math.PI * 2 * loops;
        const yNorm = t; // linear up
        
        const currentRadius = (1 - yNorm) * (radius + 0.2); // Slightly outside the tree
        const x = Math.cos(theta) * currentRadius;
        const z = Math.sin(theta) * currentRadius;
        const y = (yNorm * height) - (height / 2);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
};

// Generate points for a ring/nebula
export const generateNebulaPositions = (count: number, radius: number, thickness: number) => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = radius + (Math.random() - 0.5) * thickness;
    const y = (Math.random() - 0.5) * (thickness * 0.5); // Flat disk-ish

    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;
  }
  return positions;
};

// Generate spiral positions for ornaments on tree
export const generateOrnamentTreePositions = (count: number, radius: number, height: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const pct = i / count;
    // Reverse spiral for ornaments to cross pearls visually maybe?
    const y = pct * height - height / 2;
    const r = (1 - pct) * (radius + 0.1); // Slightly outside tree
    const theta = pct * Math.PI * 10 + Math.PI; // Offset angle

    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = Math.sin(theta) * r;
  }
  return positions;
};

// Generate ring positions for ornaments/photos in nebula
export const generateOrnamentNebulaPositions = (count: number, radius: number) => {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = (i / count) * Math.PI * 2;
    positions[i * 3] = Math.cos(theta) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2; // Slight vertical jitter
    positions[i * 3 + 2] = Math.sin(theta) * radius;
  }
  return positions;
};