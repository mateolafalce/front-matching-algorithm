from flask import Blueprint, request, jsonify
from dbclient import db_client
from bson import ObjectId

# Se crea un blueprint para las preferencias de usuario
preferencias_bp = Blueprint('preferencias', __name__)

# Se crea un blueprint separado para los datos estáticos (días, horarios, canchas)
static_data_bp = Blueprint('static_data', __name__)

@static_data_bp.route('/dias', methods=['GET'])
def get_dias():
    """Obtiene todos los días disponibles"""
    try:
        dias = list(db_client['dias'].find())
        for dia in dias:
            dia['_id'] = str(dia['_id'])
        return jsonify(dias), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@static_data_bp.route('/horarios', methods=['GET'])
def get_horarios():
    """Obtiene todos los horarios disponibles"""
    try:
        horarios = list(db_client['horarios'].find())
        for horario in horarios:
            horario['_id'] = str(horario['_id'])
        return jsonify(horarios), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@static_data_bp.route('/canchas', methods=['GET'])
def get_canchas():
    """Obtiene todas las canchas disponibles"""
    try:
        canchas = list(db_client['canchas'].find())
        for cancha in canchas:
            cancha['_id'] = str(cancha['_id'])
        return jsonify(canchas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@preferencias_bp.route('/<usuario_id>', methods=['GET'])
def get_preferencias(usuario_id):
    """Obtiene las preferencias de un usuario"""
    try:
        if not ObjectId.is_valid(usuario_id):
            return jsonify({"error": "Formato de usuario_id inválido"}), 400
            
        preferencia = db_client['preferencias'].find_one({"usuario_id": ObjectId(usuario_id)})
        if preferencia:
            preferencia['_id'] = str(preferencia['_id'])
            preferencia['usuario_id'] = str(preferencia['usuario_id'])
            preferencia['dias'] = [str(dia) for dia in preferencia.get('dias', [])]
            preferencia['horarios'] = [str(horario) for horario in preferencia.get('horarios', [])]
            preferencia['canchas'] = [str(cancha) for cancha in preferencia.get('canchas', [])]
        return jsonify(preferencia), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@preferencias_bp.route('/all', methods=['GET'])
def get_all_preferencias():
    """Obtiene todas las preferencias de todos los usuarios"""
    try:
        preferencias = list(db_client['preferencias'].find())
        for p in preferencias:
            p['_id'] = str(p['_id'])
            p['usuario_id'] = str(p['usuario_id'])
            p['dias'] = [str(dia) for dia in p.get('dias', [])]
            p['horarios'] = [str(horario) for horario in p.get('horarios', [])]
            p['canchas'] = [str(cancha) for cancha in p.get('canchas', [])]
        return jsonify(preferencias), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@preferencias_bp.route('', methods=['POST'])
@preferencias_bp.route('/', methods=['POST'])
def create_preferencias():
    """Crea o actualiza las preferencias de un usuario"""
    try:
        data = request.get_json()
        
        if not data.get('usuario_id'):
            return jsonify({"error": "usuario_id es requerido"}), 400
        
        preferencia = {
            "usuario_id": ObjectId(data['usuario_id']),
            "dias": [ObjectId(dia) for dia in data.get('dias', [])],
            "horarios": [ObjectId(horario) for horario in data.get('horarios', [])],
            "canchas": [ObjectId(cancha) for cancha in data.get('canchas', [])]
        }
        
        existing = db_client['preferencias'].find_one({"usuario_id": ObjectId(data['usuario_id'])})
        
        if existing:
            db_client['preferencias'].update_one(
                {"usuario_id": ObjectId(data['usuario_id'])},
                {"$set": preferencia}
            )
            preferencia['_id'] = str(existing['_id'])
        else:
            result = db_client['preferencias'].insert_one(preferencia)
            preferencia['_id'] = str(result.inserted_id)
        
        preferencia['usuario_id'] = str(preferencia['usuario_id'])
        preferencia['dias'] = [str(dia) for dia in preferencia['dias']]
        preferencia['horarios'] = [str(horario) for horario in preferencia['horarios']]
        preferencia['canchas'] = [str(cancha) for cancha in preferencia['canchas']]
        
        return jsonify(preferencia), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500