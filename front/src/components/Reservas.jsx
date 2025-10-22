import { useState, useEffect } from 'react';
import { X, Users } from 'lucide-react';
import './Reservas.css';
import VisualizacionSlot3D from './VisualizacionSlot3D';
import { API_URL } from '../config';

const Reservas = () => {
  const [diaActual, setDiaActual] = useState(0);
  const [dias, setDias] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [is3DViewOpen, setIs3DViewOpen] = useState(false);
  const [reservingUser, setReservingUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [diasRes, horariosRes, canchasRes, reservasRes, usersRes] = await Promise.all([
          fetch(`${API_URL}/api/dias`),
          fetch(`${API_URL}/api/horarios`),
          fetch(`${API_URL}/api/canchas`),
          fetch(`${API_URL}/api/reservas`),
          fetch(`${API_URL}/api/users`)
        ]);

        if (!diasRes.ok || !horariosRes.ok || !canchasRes.ok || !reservasRes.ok || !usersRes.ok) {
          throw new Error('Error al cargar los datos del servidor');
        }

        const diasData = await diasRes.json();
        const horariosData = await horariosRes.json();
        const canchasData = await canchasRes.json();
        const reservasData = await reservasRes.json();
        const usersData = await usersRes.json();

        setDias(Array.isArray(diasData) ? diasData : []);
        setHorarios(Array.isArray(horariosData) ? horariosData : []);
        setCanchas(Array.isArray(canchasData) ? canchasData : []);
        setReservas(Array.isArray(reservasData) ? reservasData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);

      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchReservas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/reservas`);
      if (!response.ok) throw new Error('No se pudieron recargar las reservas');
      const data = await response.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const siguienteDia = () => dias.length > 0 && setDiaActual((prev) => (prev + 1) % dias.length);
  const diaAnterior = () => dias.length > 0 && setDiaActual((prev) => (prev - 1 + dias.length) % dias.length);

  const handleSlotClick = (dia, horario, cancha) => {
    const reserva = reservas.find(r => 
      r.dia_id === dia._id && 
      r.horario_id === horario._id && 
      r.cancha_id === cancha._id
    );
    const bookedCount = reserva ? reserva.usuarios.length : 0;

    setSelectedSlot({ dia, horario, cancha, bookedCount });
    setIsModalOpen(true);
  };

  const handleUserSelectFor3D = (user) => {
    setReservingUser(user);
    setIsModalOpen(false);
    setIs3DViewOpen(true);
  };

  const handleReserva = async (usuarioId) => {
    if (!selectedSlot) return;
    const { dia, horario, cancha } = selectedSlot;

    try {
      const response = await fetch(`${API_URL}/api/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dia_id: dia._id,
          horario_id: horario._id,
          cancha_id: cancha._id,
          usuarios: [usuarioId]
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Error al procesar la reserva');
      }

      alert(responseData.message);
      setIsModalOpen(false);
      setSelectedSlot(null);
      await fetchReservas();
    } catch (error) {
      console.error('Error al reservar:', error);
      alert(error.message);
    }
  };

  const getBookedUsersCount = (diaId, horarioId, canchaId) => {
    const reserva = reservas.find(r => 
      r.dia_id === diaId && 
      r.horario_id === horarioId && 
      r.cancha_id === canchaId
    );
    return reserva ? reserva.usuarios.length : 0;
  };

  if (loading) return <div className="reservas-container"><div className="loading">Cargando...</div></div>;
  if (error) return <div className="reservas-container"><div className="error">Error: {error}</div></div>;
  if (dias.length === 0 || horarios.length === 0 || canchas.length === 0) {
    return <div className="reservas-container"><div className="error">No hay datos de configuración disponibles.</div></div>;
  }

  const diaSeleccionado = dias[diaActual];

  return (
    <div className="reservas-container">
      {is3DViewOpen && selectedSlot && (
        <VisualizacionSlot3D 
          selectedSlot={selectedSlot}
          reservingUser={reservingUser}
          onClose={() => setIs3DViewOpen(false)}
        />
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setIsModalOpen(false)} className="modal-close-button">
              <X size={24} />
            </button>
            <h2>¿Quién va a reservar?</h2>
            {users.length > 0 ? (
              <ul className="user-list">
                {users.map(user => (
                  <li key={user._id} onClick={() => handleUserSelectFor3D(user)}>
                    {user.nombre} {user.apellido}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay usuarios disponibles para seleccionar.</p>
            )}
          </div>
        </div>
      )}

      <div className="dia-selector">
        <button onClick={diaAnterior} className="nav-button">
          &lt;
        </button>
        <h2 className="dia-actual">{diaSeleccionado?.nombre || 'Cargando...'}</h2>
        <button onClick={siguienteDia} className="nav-button">
          &gt;
        </button>
      </div>

      <div className="reservas-grid">
        <div className="header-row" style={{ gridTemplateColumns: `100px repeat(${canchas.length}, 1fr)` }}>
          <div className="hora-header">Hora</div>
          {canchas.map((cancha) => <div key={cancha._id} className="cancha-header">{cancha.nombre}</div>)}
        </div>

        {horarios.map((horario) => (
          <div key={horario._id} className="horario-row" style={{ gridTemplateColumns: `100px repeat(${canchas.length}, 1fr)` }}>
            <div className="hora-cell">{horario.hora}</div>
            {canchas.map((cancha) => {
              const bookedCount = getBookedUsersCount(diaSeleccionado._id, horario._id, cancha._id);
              return (
                <div 
                  key={`${horario._id}-${cancha._id}`} 
                  className={`cancha-cell ${bookedCount > 0 ? 'cancha-cell-ocupado' : 'cancha-cell-disponible'}`}
                  onClick={() => handleSlotClick(diaSeleccionado, horario, cancha)}
                >
                  <div className="slot-content">
                    <Users size={16} />
                    <span>{bookedCount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reservas;