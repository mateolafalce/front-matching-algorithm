import { useState, useEffect } from 'react';
import './GestionarUsers.css';
import PreferenciasVisualizacion3D from './PreferenciasVisualizacion3D';
import { API_URL } from '../config';

const GestionarUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', apellido: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [showVisualizacion, setShowVisualizacion] = useState(false);
  const [selectedUserForViz, setSelectedUserForViz] = useState(null);
  
  // Estados para preferencias
  const [dias, setDias] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [preferencias, setPreferencias] = useState({
    dias: [],
    horarios: [],
    canchas: []
  });

  useEffect(() => {
    fetchUsers();
    fetchDias();
    fetchHorarios();
    fetchCanchas();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDias = async () => {
    try {
      const response = await fetch(`${API_URL}/api/dias`);
      const data = await response.json();
      setDias(data);
    } catch (error) {
      console.error('Error fetching dias:', error);
    }
  };

  const fetchHorarios = async () => {
    try {
      const response = await fetch(`${API_URL}/api/horarios`);
      const data = await response.json();
      setHorarios(data);
    } catch (error) {
      console.error('Error fetching horarios:', error);
    }
  };

  const fetchCanchas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/canchas`);
      const data = await response.json();
      setCanchas(data);
    } catch (error) {
      console.error('Error fetching canchas:', error);
    }
  };

  const fetchPreferencias = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/preferencias/${userId}`);
      const data = await response.json();
      if (data) {
        setPreferencias({
          dias: data.dias || [],
          horarios: data.horarios || [],
          canchas: data.canchas || []
        });
      }
    } catch (error) {
      console.error('Error fetching preferencias:', error);
    }
  };

  const savePreferencias = async (userId) => {
    try {
      await fetch(`${API_URL}/api/preferencias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: userId,
          ...preferencias
        }),
      });
    } catch (error) {
      console.error('Error saving preferencias:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const newUser = await response.json();
        await savePreferencias(newUser._id);
        fetchUsers();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/users/${editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await savePreferencias(editingUser._id);
        fetchUsers();
        resetForm();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        const response = await fetch(`${API_URL}/api/users/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const startEdit = async (user) => {
    setEditingUser(user);
    setFormData({ nombre: user.nombre, apellido: user.apellido });
    setIsCreating(false);
    await fetchPreferencias(user._id);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({ nombre: '', apellido: '' });
    setIsCreating(false);
    setPreferencias({ dias: [], horarios: [], canchas: [] });
  };

  const handlePreferenciaToggle = (tipo, id) => {
    setPreferencias(prev => {
      const current = prev[tipo];
      const isSelected = current.includes(id);
      
      return {
        ...prev,
        [tipo]: isSelected 
          ? current.filter(item => item !== id)
          : [...current, id]
      };
    });
  };

  const handleVisualizacion3D = (user) => {
    setSelectedUserForViz(user);
    setShowVisualizacion(true);
  };

  return (
    <div className="gestionar-users-container">
      <h2>Gestión de Usuarios</h2>
      
      <button 
        className="btn-nuevo" 
        onClick={() => setIsCreating(true)}
        disabled={isCreating || editingUser}
      >
        + Nuevo Usuario
      </button>

      {(isCreating || editingUser) && (
        <form onSubmit={editingUser ? handleUpdate : handleCreate} className="user-form">
          <h3>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h3>
          
          <div className="form-section">
            <h4>Datos Personales</h4>
            <input
              type="text"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Apellido"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              required
            />
          </div>

          <div className="form-section">
            <h4>Preferencias</h4>
            
            <div className="preferencia-group">
              <label>Días:</label>
              <div className="checkbox-group">
                {dias.map(dia => (
                  <label key={dia._id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={preferencias.dias.includes(dia._id)}
                      onChange={() => handlePreferenciaToggle('dias', dia._id)}
                    />
                    {dia.nombre}
                  </label>
                ))}
              </div>
            </div>

            <div className="preferencia-group">
              <label>Horarios:</label>
              <div className="checkbox-group">
                {horarios.map(horario => (
                  <label key={horario._id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={preferencias.horarios.includes(horario._id)}
                      onChange={() => handlePreferenciaToggle('horarios', horario._id)}
                    />
                    {horario.hora}
                  </label>
                ))}
              </div>
            </div>

            <div className="preferencia-group">
              <label>Canchas:</label>
              <div className="checkbox-group">
                {canchas.map(cancha => (
                  <label key={cancha._id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={preferencias.canchas.includes(cancha._id)}
                      onChange={() => handlePreferenciaToggle('canchas', cancha._id)}
                    />
                    {cancha.nombre}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-save">Guardar</button>
            <button type="button" className="btn-cancel" onClick={resetForm}>Cancelar</button>
          </div>
        </form>
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.nombre}</td>
              <td>{user.apellido}</td>
              <td>
                <button className="btn-edit" onClick={() => startEdit(user)}>Editar</button>
                <button className="btn-viz" onClick={() => handleVisualizacion3D(user)}>Ver 3D</button>
                <button className="btn-delete" onClick={() => handleDelete(user._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showVisualizacion && selectedUserForViz && (
        <PreferenciasVisualizacion3D
          userId={selectedUserForViz._id}
          onClose={() => {
            setShowVisualizacion(false);
            setSelectedUserForViz(null);
          }}
        />
      )}
    </div>
  );
};

export default GestionarUsers;