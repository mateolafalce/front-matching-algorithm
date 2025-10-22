import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { API_URL } from '../config';
import './PreferenciasVisualizacion3D.css'; // Reutilizamos el CSS existente

const VisualizacionSlot3D = ({ selectedSlot, reservingUser, onClose }) => {
  const mountRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null); // Cambio: de hoveredUser a selectedUser
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const cameraRef = useRef();
  const sceneRef = useRef();
  const preferencePoints = useRef([]);
  const controlsRef = useRef(); // Ref para los controles

  useEffect(() => {
    if (!selectedSlot || !reservingUser) return;

    let renderer, controls;
    let animationFrameId;

    const init = async () => {
      try {
        // 1. Fetch all data
        const [diasRes, horariosRes, canchasRes, usersRes, allPrefsRes] = await Promise.all([
          fetch(`${API_URL}/api/dias`),
          fetch(`${API_URL}/api/horarios`),
          fetch(`${API_URL}/api/canchas`),
          fetch(`${API_URL}/api/users`),
          fetch(`${API_URL}/api/preferencias/all`) // Endpoint para todas las preferencias
        ]);

        const dias = await diasRes.json();
        const horarios = await horariosRes.json();
        const canchas = await canchasRes.json();
        const users = await usersRes.json();
        const allPreferences = await allPrefsRes.json();

        // 2. Setup Scene & Camera
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);
        sceneRef.current = scene;

        const container = mountRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        cameraRef.current = camera;

        const maxDim = Math.max(dias.length, horarios.length, canchas.length);
        camera.position.set(maxDim * 0.9, maxDim * 0.9, maxDim * 0.9);

        // 3. Setup Renderer & Controls
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controlsRef.current = controls; // Guardar controles en el ref

        // 4. Create Axes and Grid
        createAxes(scene, dias, horarios, canchas);
        createGrid(scene, dias.length, horarios.length, canchas.length);

        // 5. Create Points
        const { diasMap, horariosMap, canchasMap } = createCoordinateMaps(dias, horarios, canchas);
        
        // Punto azul para el slot seleccionado
        createSelectedSlotPoint(scene, selectedSlot, diasMap, horariosMap, canchasMap);

        // Puntos naranjas para preferencias de otros usuarios
        preferencePoints.current = createClosestPreferencePoints(
          scene, 
          selectedSlot, 
          allPreferences, 
          users, 
          diasMap, 
          horariosMap, 
          canchasMap,
          reservingUser._id // Pasar el ID del usuario que reserva
        );

        // 6. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(maxDim, maxDim, maxDim);
        scene.add(pointLight);

        // 7. Animation Loop
        const animate = () => {
          animationFrameId = requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        // 8. Event Listeners
        container.addEventListener('click', onCanvasClick); // Cambio: de mousemove a click
        window.addEventListener('keydown', handleKeyDown);

        setLoading(false);
      } catch (err) {
        console.error('Error initializing 3D view:', err);
        setError('Error al cargar la visualización 3D');
        setLoading(false);
      }
    };

    const onCanvasClick = (event) => {
        if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
        
        const rect = mountRef.current.getBoundingClientRect();
        mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.current.setFromCamera(mouse.current, cameraRef.current);
        const intersects = raycaster.current.intersectObjects(preferencePoints.current);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject.userData.user) {
                setSelectedUser({
                    name: `${intersectedObject.userData.user.nombre} ${intersectedObject.userData.user.apellido}`,
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                });
            }
        } else {
            setSelectedUser(null); // Deseleccionar si se hace clic fuera de las bolas
        }
    };

    const handleKeyDown = (event) => {
      const zoomSpeed = 1.1; // Factor de zoom (1.1 = 10% más cerca/lejos)
      if (controlsRef.current && cameraRef.current) {
        switch (event.key) {
          case '+':
          case '=': // El signo '+' a menudo requiere Shift, '=' es la tecla física
            // Zoom in - acercar la cámara
            cameraRef.current.position.multiplyScalar(1 / zoomSpeed);
            controlsRef.current.update();
            break;
          case '-':
          case '_': // El signo '-' a menudo comparte tecla con '_'
            // Zoom out - alejar la cámara
            cameraRef.current.position.multiplyScalar(zoomSpeed);
            controlsRef.current.update();
            break;
          default:
            return;
        }
      }
    };

    init();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer) {
        mountRef.current?.removeChild(renderer.domElement);
        renderer.dispose();
      }
      mountRef.current?.removeEventListener('click', onCanvasClick); // Cambio: de mousemove a click
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSlot, reservingUser]);

  // --- Helper functions (createAxes, createGrid, etc.) ---
  // (Estas funciones son muy similares a las de PreferenciasVisualizacion3D.jsx)

  const createCoordinateMaps = (dias, horarios, canchas) => ({
    diasMap: new Map(dias.map((d, i) => [d._id, i + 1])),
    horariosMap: new Map(horarios.map((h, i) => [h._id, i + 1])),
    canchasMap: new Map(canchas.map((c, i) => [c._id, i + 1])),
  });

  const createSelectedSlotPoint = (scene, slot, diasMap, horariosMap, canchasMap) => {
    const x = diasMap.get(slot.dia._id);
    const y = horariosMap.get(slot.horario._id);
    const z = canchasMap.get(slot.cancha._id);

    if (x === undefined || y === undefined || z === undefined) return;

    const geometry = new THREE.SphereGeometry(0.25, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x0077ff, emissive: 0x0055cc });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    scene.add(sphere);
  };

  const createClosestPreferencePoints = (scene, slot, allPrefs, users, diasMap, horariosMap, canchasMap, reservingUserId) => {
    const points = [];
    const usersMap = new Map(users.map(u => [u._id, u]));
    
    const slotPos = {
      x: diasMap.get(slot.dia._id),
      y: horariosMap.get(slot.horario._id),
      z: canchasMap.get(slot.cancha._id),
    };

    // Agrupar preferencias por usuario
    const prefsByUser = new Map();
    allPrefs.forEach(p => {
      if (p.usuario_id !== reservingUserId) { // Excluir al usuario que reserva
        if (!prefsByUser.has(p.usuario_id)) {
          prefsByUser.set(p.usuario_id, []);
        }
        prefsByUser.get(p.usuario_id).push(p);
      }
    });

    // Array para almacenar usuarios con su punto más cercano y distancia
    const usersWithClosestPoints = [];

    // Para cada usuario, encontrar su punto de preferencia más cercano al slot
    prefsByUser.forEach((userPrefs, userId) => {
      let closestPoint = null;
      let minDistance = Infinity;

      userPrefs.forEach(pref => {
        pref.dias.forEach(diaId => {
          pref.horarios.forEach(horarioId => {
            pref.canchas.forEach(canchaId => {
              const pos = {
                x: diasMap.get(diaId),
                y: horariosMap.get(horarioId),
                z: canchasMap.get(canchaId),
              };
              if (pos.x === undefined || pos.y === undefined || pos.z === undefined) return;

              const distance = Math.sqrt(
                Math.pow(slotPos.x - pos.x, 2) +
                Math.pow(slotPos.y - pos.y, 2) +
                Math.pow(slotPos.z - pos.z, 2)
              );

              if (distance < minDistance) {
                minDistance = distance;
                closestPoint = pos;
              }
            });
          });
        });
      });

      if (closestPoint) {
        const user = usersMap.get(userId);
        if (user) {
          usersWithClosestPoints.push({
            user,
            point: closestPoint,
            distance: minDistance
          });
        }
      }
    });

    // Ordenar por distancia
    usersWithClosestPoints.sort((a, b) => a.distance - b.distance);

    // Crear las esferas para todos los usuarios
    usersWithClosestPoints.forEach(({ user, point, distance }, index) => {
      const geometry = new THREE.SphereGeometry(0.2, 16, 16);
      
      // Los primeros 6 son amarillos, el resto naranjas
      const isTop6 = index < 6;
      const material = new THREE.MeshPhongMaterial({ 
        color: isTop6 ? 0xffff00 : 0xffaa00,  // Amarillo para top 6, naranja para el resto
        emissive: isTop6 ? 0xffaa00 : 0xff6600 
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(point.x, point.y, point.z);
      sphere.userData = { user, isTop6 };
      scene.add(sphere);
      points.push(sphere);
    });

    return points;
  };

  const createAxes = (scene, dias, horarios, canchas) => {
    const maxDim = Math.max(dias.length, horarios.length, canchas.length) * 1.2;
    const createAxis = (dir, color) => new THREE.ArrowHelper(dir, new THREE.Vector3(0,0,0), maxDim, color, 0.5, 0.3);
    scene.add(createAxis(new THREE.Vector3(1,0,0), 0xff0000)); // Días
    scene.add(createAxis(new THREE.Vector3(0,1,0), 0x00ff00)); // Horarios
    scene.add(createAxis(new THREE.Vector3(0,0,1), 0x0000ff)); // Canchas
    // Aquí irían las etiquetas de los ejes, omitidas por brevedad
  };

  const createGrid = (scene, x, y, z) => {
    const size = Math.max(x, y, z);
    const grid = new THREE.GridHelper(size, size, 0x888888, 0x444444);
    grid.position.set(size/2, 0, size/2);
    scene.add(grid);
  };

  return (
    <div className="visualizacion-3d-modal">
      <div className="visualizacion-3d-content">
        <div className="visualizacion-3d-header">
          <h2>Visualización de Slot y Jugadores Cercanos</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        {loading && <div className="loading">Cargando visualización...</div>}
        {error && <div className="error">{error}</div>}
        <div ref={mountRef} className="canvas-container" style={{ position: 'relative' }}>
            {selectedUser && (
                <div style={{
                    position: 'absolute',
                    left: `${selectedUser.x + 15}px`,
                    top: `${selectedUser.y}px`,
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    pointerEvents: 'none',
                    transform: 'translateY(-100%)',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}>
                    {selectedUser.name}
                </div>
            )}
        </div>
        <div className="visualizacion-3d-info">
          <div className="legend">
            <h3>Leyenda:</h3>
            <div className="legend-item"><span className="color-box" style={{ background: '#0077ff' }}></span><span>Slot Seleccionado</span></div>
            <div className="legend-item"><span className="color-box" style={{ background: '#ffff00' }}></span><span>6 Jugadores Más Cercanos</span></div>
            <div className="legend-item"><span className="color-box" style={{ background: '#ffaa00' }}></span><span>Otros Jugadores</span></div>
          </div>
          <div className="controls-info">
            <h3>Controles:</h3>
            <p>• Click izquierdo sobre bola: Ver jugador</p>
            <p>• Click izquierdo + arrastrar: Rotar</p>
            <p>• Scroll: Zoom</p>
            <p>• Click derecho + arrastrar: Mover</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizacionSlot3D;