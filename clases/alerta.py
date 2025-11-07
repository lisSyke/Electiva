from datetime import datetime
from db import cedulas, db

class AlertaPanico:
    def __init__(self, cedula, ubicacion, metodo="manual"):
        """
        cedula: cédula de la usuaria que activa
        ubicacion: texto o URL de la ubicación
        metodo: 'boton', 'sensor', etc.
        """
        self.cedula = cedula
        self.ubicacion = ubicacion
        self.metodo = metodo
        self.fechaHora = datetime.now()
        self.estado = "Pendiente"

        # Generar id automático
        ultima = db.alertas.find_one(sort=[("_id", -1)])
        self.id = ultima["id"] + 1 if ultima and "id" in ultima else 1

    def registrar(self):
        """Guarda la alerta en MongoDB y la asocia a la usuaria"""
        usuaria = cedulas.find_one({"cedula": self.cedula})
        if not usuaria:
            print(f"No se encontró la usuaria con cédula {self.cedula}.")
            return {"ok": False, "error": "Usuaria no encontrada"}

        alerta_doc = {
            "id": self.id,
            "fechaHora": self.fechaHora,
            "estado": self.estado,
            "ubicacion": self.ubicacion,
            "metodo": self.metodo
        }

        # Guardar en el documento de la usuaria
        cedulas.update_one({"cedula": self.cedula}, {"$push": {"alertas": alerta_doc}})

        # Guardar también en una colección global de alertas
        db.alertas.insert_one({"cedula": self.cedula, **alerta_doc})

        print(f"✅ Alerta #{self.id} registrada para {usuaria['nombre']} en {self.ubicacion}")
        return {"ok": True, "alerta": alerta_doc, "usuaria_nombre": usuaria.get("nombre")}


