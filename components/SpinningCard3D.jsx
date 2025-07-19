import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { HexColorPicker } from 'react-colorful';
import { proxy, useSnapshot } from 'valtio';

// State management for shoe customization
const state = proxy({
  current: null,
  items: { 
    laces: "#ffffff",
    mesh: "#ffffff", 
    caps: "#ffffff",
    inner: "#ffffff",
    sole: "#ffffff",
    stripes: "#ffffff",
    band: "#ffffff",
    patch: "#ffffff",
    // Fallback for unknown parts
    main: "#fbe5bf",
  },
});

export default function CharacterConfigurator() {
  const [statusMessage, setStatusMessage] = useState({ type: 'loading', text: 'Loading GLB...' });

  return (
    <div className="w-full h-screen bg-gradient-to-br from-orange-50 to-orange-100 relative">
      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-2">3D Shoe Customizer</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p>🎨 <strong>Click</strong> shoe parts to customize colors</p>
          <p>🖱️ <strong>Drag</strong> to rotate</p>
          <p>⚲ <strong>Scroll</strong> to zoom</p>
        </div>
      </div>

      {/* Status Message */}
      <div className={`absolute top-32 left-4 z-10 px-4 py-3 rounded max-w-md ${
        statusMessage.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
        statusMessage.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
        'bg-blue-100 border border-blue-400 text-blue-700'
      }`}>
        <div className="text-sm">
          {statusMessage.type === 'error' && '❌ '}
          {statusMessage.type === 'success' && '✅ '}
          {statusMessage.type === 'loading' && '🔄 '}
          {statusMessage.text}
        </div>
        {statusMessage.type === 'error' && (
          <div className="text-xs mt-2">
            Make sure A1.glb is in: <code>public/models/A1.glb</code>
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <spotLight 
          intensity={0.5} 
          angle={0.1} 
          penumbra={1} 
          position={[10, 15, 10]} 
          castShadow 
        />
        
        <Character setStatusMessage={setStatusMessage} />
        
        <Environment preset="city" />
        <ContactShadows 
          position={[0, -1.2, 0]} 
          opacity={0.25} 
          scale={10} 
          blur={1.5} 
          far={0.8} 
        />
        
        <OrbitControls 
          minPolarAngle={Math.PI / 2} 
          maxPolarAngle={Math.PI / 2} 
          enableZoom={true} 
          enablePan={false} 
        />
      </Canvas>
      
      <ColorPicker />
    </div>
  );
}

function Character({ setStatusMessage }) {
  const ref = useRef();
  const snap = useSnapshot(state);
  const [hovered, setHovered] = useState(null);
  
  // Load the shoe GLB file
  let model = null;
  let nodes = {};
  let materials = {};
  
  try {
    model = useGLTF('/models/shoe-draco.glb');
    nodes = model?.nodes || {};
    materials = model?.materials || {};
  } catch (error) {
    console.error('Error loading shoe GLB:', error);
  }
  
  // Handle loading status
  useEffect(() => {
    if (model && Object.keys(nodes).length > 0) {
      console.log('🎯 Shoe GLB Model loaded successfully!');
      console.log('📦 Available nodes:', Object.keys(nodes));
      console.log('🎨 Available materials:', Object.keys(materials));
      
      // Detailed analysis of the shoe model
      console.log('🔍 SHOE MODEL ANALYSIS:');
      Object.keys(nodes).forEach(nodeName => {
        const node = nodes[nodeName];
        console.log(`📋 Node "${nodeName}":`, {
          type: node.type,
          hasGeometry: !!node.geometry,
          hasChildren: node.children?.length > 0,
          material: node.material?.name || 'no material',
          userData: node.userData
        });
      });
      
      // Count total renderable parts
      let renderableParts = 0;
      const traverseAndCount = (object) => {
        if (object.geometry) renderableParts++;
        if (object.children) {
          object.children.forEach(traverseAndCount);
        }
      };
      
      Object.values(nodes).forEach(traverseAndCount);
      
      console.log(`🎯 Total renderable parts found: ${renderableParts}`);
      
      setStatusMessage({ 
        type: 'success', 
        text: `Shoe model loaded! Found ${Object.keys(nodes).length} nodes, ${renderableParts} parts` 
      });
    } else {
      setStatusMessage({ 
        type: 'error', 
        text: 'Shoe GLB file not found at /models/shoe-draco.glb' 
      });
    }
  }, [model, nodes, materials, setStatusMessage]);
  
  // Gentle floating animation
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.rotation.set(
        Math.cos(t / 4) / 8, 
        Math.sin(t / 4) / 8, 
        -0.1 - (1 + Math.sin(t / 1.5)) / 20
      );
      ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
    }
  });

  // Custom cursor effect
  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = 'pointer';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered]);

  const hasModel = Object.keys(nodes).length > 0;

  return (
    <group
      ref={ref}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(e.object.userData.name || e.object.material?.name || 'unknown');
      }}
      onPointerOut={(e) => e.intersections.length === 0 && setHovered(null)}
      onPointerMissed={() => (state.current = null)}
      onClick={(e) => {
        e.stopPropagation();
        const partName = e.object.userData.name || e.object.material?.name || 'main';
        state.current = partName;
      }}
    >
      {hasModel ? (
        // Render shoe parts from GLB
        Object.keys(nodes).map(nodeName => {
          const node = nodes[nodeName];
          if (!node.geometry) return null;
          
          // Try to determine part name from node name or material
          let partName = 'main'; // fallback
          const nodeNameLower = nodeName.toLowerCase();
          
          // Map node names to shoe parts
          if (nodeNameLower.includes('lace')) partName = 'laces';
          else if (nodeNameLower.includes('mesh')) partName = 'mesh';
          else if (nodeNameLower.includes('cap')) partName = 'caps';
          else if (nodeNameLower.includes('inner')) partName = 'inner';
          else if (nodeNameLower.includes('sole')) partName = 'sole';
          else if (nodeNameLower.includes('stripe')) partName = 'stripes';
          else if (nodeNameLower.includes('band')) partName = 'band';
          else if (nodeNameLower.includes('patch')) partName = 'patch';
          else if (nodeNameLower.includes('shoe')) {
            // For numbered shoe parts, try to map to known parts
            if (nodeNameLower.includes('shoe_1')) partName = 'mesh';
            else if (nodeNameLower.includes('shoe_2')) partName = 'caps';
            else if (nodeNameLower.includes('shoe_3')) partName = 'inner';
            else if (nodeNameLower.includes('shoe_4')) partName = 'sole';
            else if (nodeNameLower.includes('shoe_5')) partName = 'stripes';
            else if (nodeNameLower.includes('shoe_6')) partName = 'band';
            else if (nodeNameLower.includes('shoe_7')) partName = 'patch';
            else partName = 'laces'; // shoe without number = main part
          }
          
          return (
            <mesh
              key={nodeName}
              receiveShadow
              castShadow
              geometry={node.geometry}
              userData={{ name: partName }}
            >
              <meshStandardMaterial color={snap.items[partName]} />
            </mesh>
          );
        })
      ) : (
        // Fallback shoe shape if GLB doesn't load
        <group>
          <mesh 
            receiveShadow 
            castShadow 
            position={[0, 0, 0]}
            userData={{ name: 'main' }}
          >
            <boxGeometry args={[2, 0.8, 0.6]} />
            <meshStandardMaterial color={snap.items.main} />
          </mesh>
          
          <mesh 
            receiveShadow 
            castShadow 
            position={[0, -0.3, 0.1]}
            userData={{ name: 'sole' }}
          >
            <boxGeometry args={[2.2, 0.2, 0.8]} />
            <meshStandardMaterial color={snap.items.sole} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function ColorPicker() {
  const snap = useSnapshot(state);
  
  return (
    <div 
      className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg transition-all duration-300"
      style={{ 
        display: snap.current ? "block" : "none",
        transform: snap.current ? "translateY(0)" : "translateY(20px)",
        opacity: snap.current ? 1 : 0
      }}
    >
      {snap.current && (
        <>
          <h3 className="text-lg font-bold text-gray-800 mb-3 capitalize">
            Customize {snap.current} Color
          </h3>
          <HexColorPicker 
            className="mb-3" 
            color={snap.items[snap.current]} 
            onChange={(color) => (state.items[snap.current] = color)} 
          />
          <div className="text-sm text-gray-600 text-center">
            Current: {snap.items[snap.current]}
          </div>
          <div className="text-xs text-gray-500 text-center mt-2">
            👟 Click different parts of the shoe to customize!
          </div>
        </>
      )}
    </div>
  );
}

// Preload the shoe GLB file
useGLTF.preload('/models/shoe-draco.glb');