from flask import Blueprint, request, jsonify
from dbclient import db_client
from bson import ObjectId
from datetime import datetime

reservas_bp = Blueprint('reservas', __name__)

@reservas_bp.route('/reservas', methods=['GET'])
def get_reservas():
    """Obtiene todas las reservas"""
    try:
        reservas = list(db_client['reservas'].find())
        for reserva in reservas:
            reserva['_id'] = str(reserva['_id'])
            reserva['dia_id'] = str(reserva['dia_id'])
            reserva['horario_id'] = str(reserva['horario_id'])
            reserva['cancha_id'] = str(reserva['cancha_id'])
            reserva['usuarios'] = [str(u) for u in reserva.get('usuarios', [])]
        return jsonify(reservas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reservas_bp.route('/reservas/<dia_id>', methods=['GET'])
def get_reservas_por_dia(dia_id):
    """Obtiene las reservas de un día específico"""
    try:
        reservas = list(db_client['reservas'].find({"dia_id": ObjectId(dia_id)}))
        for reserva in reservas:
            reserva['_id'] = str(reserva['_id'])
            reserva['dia_id'] = str(reserva['dia_id'])
            reserva['horario_id'] = str(reserva['horario_id'])
            reserva['cancha_id'] = str(reserva['cancha_id'])
            reserva['usuarios'] = [str(u) for u in reserva.get('usuarios', [])]
        return jsonify(reservas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reservas_bp.route('/reservas', methods=['POST'])
def create_reserva():
    """Crea una nueva reserva o agrega un usuario a una existente."""
    try:
        data = request.get_json()
        
        if not all(k in data for k in ['dia_id', 'horario_id', 'cancha_id', 'usuarios']):
            return jsonify({"error": "Faltan campos requeridos"}), 400
        
        if not data['usuarios']:
            return jsonify({"error": "Se requiere al menos un usuario"}), 400

        usuario_id = ObjectId(data['usuarios'][0])
        
        # Filtro para encontrar la reserva
        query = {
            "dia_id": ObjectId(data['dia_id']),
            "horario_id": ObjectId(data['horario_id']),
            "cancha_id": ObjectId(data['cancha_id'])
        }
        
        # Datos para la actualización o inserción
        update = {
            "$addToSet": {"usuarios": usuario_id}
        }
        
        # Usamos upsert=True para crear el documento si no existe
        result = db_client['reservas'].update_one(query, update, upsert=True)
        
        if result.upserted_id:
            message = "Reserva creada y usuario agregado exitosamente"
            status_code = 201
        elif result.modified_count > 0:
            message = "Usuario agregado a la reserva existente"
            status_code = 200
        else:
            message = "El usuario ya estaba en esta reserva"
            status_code = 200

        return jsonify({"message": message}), status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reservas_bp.route('/reservas/<reserva_id>/usuario', methods=['POST'])
def add_usuario_reserva(reserva_id):
    """Agrega un usuario a una reserva existente"""
    try:
        data = request.get_json()
        
        if not data.get('usuario_id'):
            return jsonify({"error": "usuario_id es requerido"}), 400
        
        reserva = db_client['reservas'].find_one({"_id": ObjectId(reserva_id)})
        if not reserva:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        usuario_id = ObjectId(data['usuario_id'])
        
        # Verificar si el usuario ya está en la reserva
        if usuario_id in reserva.get('usuarios', []):
            return jsonify({"error": "El usuario ya está en esta reserva"}), 400
        
        db_client['reservas'].update_one(
            {"_id": ObjectId(reserva_id)},
            {"$push": {"usuarios": usuario_id}}
        )
        
        return jsonify({"message": "Usuario agregado exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reservas_bp.route('/reservas/<reserva_id>/usuario/<usuario_id>', methods=['DELETE'])
def remove_usuario_reserva(reserva_id, usuario_id):
    """Elimina un usuario de una reserva"""
    try:
        db_client['reservas'].update_one(
            {"_id": ObjectId(reserva_id)},
            {"$pull": {"usuarios": ObjectId(usuario_id)}}
        )
        
        return jsonify({"message": "Usuario eliminado exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@reservas_bp.route('/reservas/<reserva_id>', methods=['DELETE'])
def delete_reserva(reserva_id):
    """Elimina una reserva"""
    try:
        result = db_client['reservas'].delete_one({"_id": ObjectId(reserva_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Reserva no encontrada"}), 404
        
        return jsonify({"message": "Reserva eliminada exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500