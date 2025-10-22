from flask import Blueprint, request, jsonify
from dbclient import db_client
from bson import ObjectId

users_bp = Blueprint('users', __name__)

@users_bp.route('/users', methods=['GET'])
def get_users():
    """Obtiene todos los usuarios"""
    try:
        users = list(db_client['users'].find())
        for user in users:
            user['_id'] = str(user['_id'])
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Obtiene un usuario por ID"""
    try:
        if not ObjectId.is_valid(user_id):
            return jsonify({"error": "ID de usuario no válido"}), 400
        
        user = db_client['users'].find_one({"_id": ObjectId(user_id)})
        
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/users', methods=['POST'])
def create_user():
    """Crea un nuevo usuario"""
    try:
        data = request.get_json()
        
        if not data.get('nombre') or not data.get('apellido'):
            return jsonify({"error": "Nombre y apellido son requeridos"}), 400
        
        user = {
            "nombre": data['nombre'],
            "apellido": data['apellido']
        }
        
        result = db_client['users'].insert_one(user)
        user['_id'] = str(result.inserted_id)
        
        return jsonify(user), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Actualiza un usuario existente"""
    try:
        data = request.get_json()
        
        if not data.get('nombre') or not data.get('apellido'):
            return jsonify({"error": "Nombre y apellido son requeridos"}), 400
        
        update_data = {
            "nombre": data['nombre'],
            "apellido": data['apellido']
        }
        
        result = db_client['users'].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        return jsonify({"message": "Usuario actualizado exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@users_bp.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Elimina un usuario"""
    try:
        result = db_client['users'].delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        return jsonify({"message": "Usuario eliminado exitosamente"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500