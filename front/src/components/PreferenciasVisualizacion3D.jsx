import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { API_URL } from '../config';
import './PreferenciasVisualizacion3D.css';

const PreferenciasVisualizacion3D = ({ userId, onClose }) => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let scene, camera, renderer, controls;
    let animationFrameId;

    const init = async () => {
      try {
        // Fetch data
        const [userRes, diasRes, horariosRes, canchasRes, prefsRes] = await Promise.all([
          fetch(`${API_URL}/api/users/${userId}`),
          fetch(`${API_URL}/api/dias`),
          fetch(`${API_URL}/api/horarios`),
          fetch(`${API_URL}/api/canchas`),
          fetch(`${API_URL}/api/preferencias/${userId}`)
        ]);

        const user = await userRes.json();
        const dias = await diasRes.json();
        const horarios = await horariosRes.json();
        const canchas = await canchasRes.json();
        const preferencias = await prefsRes.json();

        // Setup scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);

        // Setup camera
        const container = mountRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(
          Math.max(dias.length, horarios.length, canchas.length) * 0.8,
          Math.max(dias.length, horarios.length, canchas.length) * 0.8,
          Math.max(dias.length, horarios.length, canchas.length) * 0.8
        );

        // Setup renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        // Setup controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Create axes
        createAxes(scene, dias, horarios, canchas);

        // Create preference points
        createPreferencePoints(scene, preferencias, dias, horarios, canchas);

        // Create grid
        createGrid(scene, dias.length, horarios.length, canchas.length);

        // Animation loop
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        setLoading(false);
      } catch (err) {
        console.error('Error initializing 3D view:', err);
        setError('Error al cargar la visualización 3D');
        setLoading(false);
      }
    };

    init();

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (renderer) {
        mountRef.current?.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, [userId]);

  const createAxes = (scene, dias, horarios, canchas) => {
    const maxDim = Math.max(dias.length, horarios.length, canchas.length);
    const axisLength = maxDim * 1.2;

    // Eje X - Días
    const xAxis = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0xff0000,
      0.5,
      0.3
    );
    scene.add(xAxis);
    addAxisLabel(scene, 'Días', axisLength, 0, 0, 0xff0000);

    // Eje Y - Horarios
    const yAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0x00ff00,
      0.5,
      0.3
    );
    scene.add(yAxis);
    addAxisLabel(scene, 'Horarios', 0, axisLength, 0, 0x00ff00);

    // Eje Z - Canchas
    const zAxis = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 0),
      axisLength,
      0x0000ff,
      0.5,
      0.3
    );
    scene.add(zAxis);
    addAxisLabel(scene, 'Canchas', 0, 0, axisLength, 0x0000ff);

    // Add tick marks and labels
    addTickMarks(scene, dias, horarios, canchas);
  };

  const addAxisLabel = (scene, text, x, y, z, color) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = 'Bold 40px Arial';
    context.fillText(text, 10, 45);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x + 0.5, y + 0.5, z + 0.5);
    sprite.scale.set(2, 0.5, 1);
    scene.add(sprite);
  };

  const addTickMarks = (scene, dias, horarios, canchas) => {
    const tickSize = 0.1;

    // Días (X axis)
    dias.forEach((dia, i) => {
      const geometry = new THREE.SphereGeometry(tickSize, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const tick = new THREE.Mesh(geometry, material);
      tick.position.set(i + 1, 0, 0);
      scene.add(tick);
      addTextLabel(scene, dia.nombre, i + 1, -0.5, 0, 0xff0000);
    });

    // Horarios (Y axis)
    horarios.forEach((horario, i) => {
      const geometry = new THREE.SphereGeometry(tickSize, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const tick = new THREE.Mesh(geometry, material);
      tick.position.set(0, i + 1, 0);
      scene.add(tick);
      addTextLabel(scene, horario.hora, -0.5, i + 1, 0, 0x00ff00);
    });

    // Canchas (Z axis)
    canchas.forEach((cancha, i) => {
      const geometry = new THREE.SphereGeometry(tickSize, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
      const tick = new THREE.Mesh(geometry, material);
      tick.position.set(0, 0, i + 1);
      scene.add(tick);
      addTextLabel(scene, cancha.nombre, 0, -0.5, i + 1, 0x0000ff);
    });
  };

  const addTextLabel = (scene, text, x, y, z, color) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    context.font = '30px Arial';
    context.fillText(text, 10, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.set(x, y, z);
    sprite.scale.set(1.5, 0.375, 1);
    scene.add(sprite);
  };

  const createPreferencePoints = (scene, preferencias, dias, horarios, canchas) => {
    if (!preferencias || !preferencias.dias || !preferencias.horarios || !preferencias.canchas) {
      return;
    }

    // Crear mapas de índices
    const diasMap = new Map(dias.map((d, i) => [d._id, i + 1]));
    const horariosMap = new Map(horarios.map((h, i) => [h._id, i + 1]));
    const canchasMap = new Map(canchas.map((c, i) => [c._id, i + 1]));

    // Crear puntos para cada combinación de preferencias
    preferencias.dias.forEach(diaId => {
      preferencias.horarios.forEach(horarioId => {
        preferencias.canchas.forEach(canchaId => {
          const x = diasMap.get(diaId) || 0;
          const y = horariosMap.get(horarioId) || 0;
          const z = canchasMap.get(canchaId) || 0;

          const geometry = new THREE.SphereGeometry(0.2, 16, 16);
          const material = new THREE.MeshPhongMaterial({
            color: 0xffaa00,
            emissive: 0xff6600,
            shininess: 100
          });
          const sphere = new THREE.Mesh(geometry, material);
          sphere.position.set(x, y, z);
          scene.add(sphere);

          // Add glow effect
          const glowGeometry = new THREE.SphereGeometry(0.25, 16, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.3
          });
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.set(x, y, z);
          scene.add(glow);
        });
      });
    });

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
  };

  const createGrid = (scene, xSize, ySize, zSize) => {
    // XY plane
    const xyGrid = new THREE.GridHelper(Math.max(xSize, ySize), Math.max(xSize, ySize), 0x888888, 0xcccccc);
    xyGrid.rotation.x = Math.PI / 2;
    xyGrid.position.set(xSize / 2, ySize / 2, 0);
    scene.add(xyGrid);

    // XZ plane
    const xzGrid = new THREE.GridHelper(Math.max(xSize, zSize), Math.max(xSize, zSize), 0x888888, 0xcccccc);
    xzGrid.position.set(xSize / 2, 0, zSize / 2);
    scene.add(xzGrid);

    // YZ plane
    const yzGrid = new THREE.GridHelper(Math.max(ySize, zSize), Math.max(ySize, zSize), 0x888888, 0xcccccc);
    yzGrid.rotation.z = Math.PI / 2;
    yzGrid.position.set(0, ySize / 2, zSize / 2);
    scene.add(yzGrid);
  };

  return (
    <div className="visualizacion-3d-modal">
      <div className="visualizacion-3d-content">
        <div className="visualizacion-3d-header">
          <h2>Visualización 3D de Preferencias</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {loading && <div className="loading">Cargando visualización...</div>}
        {error && <div className="error">{error}</div>}
        <div ref={mountRef} className="canvas-container" />
        <div className="visualizacion-3d-info">
          <div className="legend">
            <h3>Leyenda:</h3>
            <div className="legend-item">
              <span className="color-box" style={{ background: '#ff0000' }}></span>
              <span>Eje X: Días</span>
            </div>
            <div className="legend-item">
              <span className="color-box" style={{ background: '#00ff00' }}></span>
              <span>Eje Y: Horarios</span>
            </div>
            <div className="legend-item">
              <span className="color-box" style={{ background: '#0000ff' }}></span>
              <span>Eje Z: Canchas</span>
            </div>
            <div className="legend-item">
              <span className="color-box" style={{ background: '#ffaa00' }}></span>
              <span>Puntos naranjas: Preferencias del usuario</span>
            </div>
          </div>
          <div className="controls-info">
            <h3>Controles:</h3>
            <p>• Click izquierdo + arrastrar: Rotar</p>
            <p>• Scroll: Zoom</p>
            <p>• Click derecho + arrastrar: Mover</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenciasVisualizacion3D;