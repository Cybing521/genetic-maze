// 3D适应度景观可视化
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { GenerationResult } from '../types';

interface FitnessLandscape3DProps {
  history: GenerationResult[];
  width?: number;
  height?: number;
  onClose?: () => void;
}

export function FitnessLandscape3D({ 
  history, 
  width = 800, 
  height = 600,
  onClose 
}: FitnessLandscape3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current || history.length === 0) return;

    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1115);
    sceneRef.current = scene;

    // 初始化相机
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    );
    camera.position.set(30, 30, 30);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 初始化渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // 创建网格
    createFitnessLandscape(scene, history);

    // 添加坐标轴
    const axesHelper = new THREE.AxesHelper(25);
    scene.add(axesHelper);

    // 添加网格
    const gridHelper = new THREE.GridHelper(50, 20, 0x88C0D0, 0x2E3440);
    scene.add(gridHelper);

    // 动画循环
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // 自动旋转
      if (meshRef.current) {
        meshRef.current.rotation.z += 0.002;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 鼠标交互
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      camera.position.x += deltaX * 0.05;
      camera.position.y -= deltaY * 0.05;
      camera.lookAt(0, 0, 0);

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * 0.01;
      camera.position.z += delta;
      camera.position.z = Math.max(10, Math.min(100, camera.position.z));
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel);

    // 清理
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      
      if (containerRef.current && renderer.domElement.parentNode) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [history, width, height]);

  const createFitnessLandscape = (scene: THREE.Scene, history: GenerationResult[]) => {
    if (history.length < 2) return;

    const segments = Math.min(history.length - 1, 50);
    const geometry = new THREE.PlaneGeometry(40, 40, segments, 10);
    
    // 修改顶点高度以表示适应度
    const vertices = geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const y = vertices[i + 1];
      
      // 计算在历史中的索引
      const xIndex = Math.floor(((x + 20) / 40) * segments);
      const histIndex = Math.max(0, Math.min(segments, xIndex));
      
      if (history[histIndex]) {
        // 使用适应度作为高度
        const fitness = history[histIndex].bestFitness;
        const normalizedFitness = Math.log(fitness + 1) / 10; // 对数缩放
        vertices[i + 2] = normalizedFitness;
      }
    }
    
    geometry.computeVertexNormals();

    // 创建渐变材质
    const material = new THREE.MeshPhongMaterial({
      color: 0x88C0D0,
      wireframe: false,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    meshRef.current = mesh;
    scene.add(mesh);

    // 添加线框
    const wireframeGeometry = new THREE.WireframeGeometry(geometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x00ffff, 
      transparent: true, 
      opacity: 0.3 
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    wireframe.rotation.x = -Math.PI / 2;
    scene.add(wireframe);

    // 添加路径线
    const pathPoints: THREE.Vector3[] = [];
    history.forEach((gen, idx) => {
      const x = (idx / segments) * 40 - 20;
      const z = Math.log(gen.bestFitness + 1) / 10;
      pathPoints.push(new THREE.Vector3(x, 0, z));
    });

    const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    const pathMaterial = new THREE.LineBasicMaterial({ 
      color: 0xEBCB8B, 
      linewidth: 3 
    });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{
        marginBottom: '20px',
        color: '#ECEFF4',
        fontSize: '24px',
        fontWeight: 600
      }}>
        Fitness Landscape 3D
      </div>
      
      <div 
        ref={containerRef} 
        style={{ 
          border: '2px solid #88C0D0',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
      
      <div style={{
        marginTop: '20px',
        color: '#D8DEE9',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        🖱️ Drag to rotate | 🔄 Scroll to zoom | ESC to close
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: '20px',
          padding: '12px 30px',
          background: '#BF616A',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Close
      </button>
    </div>
  );
}

