from dbclient import db_client
from bson import ObjectId

def seed_dias():
    """Verifica si existe la colección 'dias' y la crea con datos iniciales si no existe."""
    
    # Verificar si la colección 'dias' existe
    if 'dias' not in db_client.list_collection_names():
        print("La colección 'dias' no existe. Creando...")
        
        dias_data = [
            {
                "_id": ObjectId("6807b64a21cf1dfd9fe985e5"),
                "nombre": "Lunes"
            },
            {
                "_id": ObjectId("6807c38dde2a87785f28c3c3"),
                "nombre": "Martes"
            },
            {
                "_id": ObjectId("6807c396de2a87785f28c3c4"),
                "nombre": "Miércoles"
            },
            {
                "_id": ObjectId("6807c39ede2a87785f28c3c5"),
                "nombre": "Jueves"
            },
            {
                "_id": ObjectId("6807c3a6de2a87785f28c3c6"),
                "nombre": "Viernes"
            },
            {
                "_id": ObjectId("6807c3acde2a87785f28c3c7"),
                "nombre": "Sábado"
            },
            {
                "_id": ObjectId("6807c3b3de2a87785f28c3c8"),
                "nombre": "Domingo"
            }
        ]
        
        # Insertar los datos
        result = db_client.dias.insert_many(dias_data)
        print(f"Colección 'dias' creada exitosamente con {len(result.inserted_ids)} documentos.")
    else:
        print("La colección 'dias' ya existe.")

def seed_horarios():
    """Verifica si existe la colección 'horarios' y la crea con datos iniciales si no existe."""
    
    # Verificar si la colección 'horarios' existe
    if 'horarios' not in db_client.list_collection_names():
        print("La colección 'horarios' no existe. Creando...")
        
        horarios_data = [
            {
                "_id": ObjectId("67fafc6c10930e8247b5cc25"),
                "hora": "09:00-10:30"
            },
            {
                "_id": ObjectId("67fafc9c10930e8247b5cc26"),
                "hora": "10:30-12:00"
            },
            {
                "_id": ObjectId("67fafca910930e8247b5cc27"),
                "hora": "12:00-13:30"
            },
            {
                "_id": ObjectId("67fafcb310930e8247b5cc28"),
                "hora": "13:30-15:00"
            },
            {
                "_id": ObjectId("67fafcbd10930e8247b5cc29"),
                "hora": "15:00-16:30"
            },
            {
                "_id": ObjectId("67fafcc810930e8247b5cc2a"),
                "hora": "16:30-18:00"
            },
            {
                "_id": ObjectId("67fafcd410930e8247b5cc2b"),
                "hora": "18:00-19:30"
            },
            {
                "_id": ObjectId("67fafcdf10930e8247b5cc2c"),
                "hora": "19:30-21:00"
            },
            {
                "_id": ObjectId("67fafce910930e8247b5cc2d"),
                "hora": "21:00-22:30"
            }
        ]
        
        # Insertar los datos
        result = db_client.horarios.insert_many(horarios_data)
        print(f"Colección 'horarios' creada exitosamente con {len(result.inserted_ids)} documentos.")
    else:
        print("La colección 'horarios' ya existe.")

def seed_canchas():
    """Verifica si existe la colección 'canchas' y la crea con datos iniciales si no existe."""
    
    # Verificar si la colección 'canchas' existe
    if 'canchas' not in db_client.list_collection_names():
        print("La colección 'canchas' no existe. Creando...")
        
        canchas_data = [
            {
                "_id": ObjectId("67faeefa10930e8247b5cc0d"),
                "nombre": "Blindex A"
            },
            {
                "_id": ObjectId("67faef4510930e8247b5cc0e"),
                "nombre": "Blindex B"
            },
            {
                "_id": ObjectId("67faef5710930e8247b5cc0f"),
                "nombre": "Blindex C"
            },
            {
                "_id": ObjectId("67faef6810930e8247b5cc10"),
                "nombre": "Cemento Techada"
            },
            {
                "_id": ObjectId("67faef7810930e8247b5cc11"),
                "nombre": "Cemento Sin Techar"
            }
        ]
        
        # Insertar los datos
        result = db_client.canchas.insert_many(canchas_data)
        print(f"Colección 'canchas' creada exitosamente con {len(result.inserted_ids)} documentos.")
    else:
        print("La colección 'canchas' ya existe.")

def seed_all():
    """Ejecuta todos los seeders."""
    seed_dias()
    seed_horarios()
    seed_canchas()

if __name__ == '__main__':
    seed_all()