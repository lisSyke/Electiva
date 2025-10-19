import csv
from db import cedulas

class SistemaValidacion:
    CSV_FILE = "sim_cedulas_femeninas.csv"

    @staticmethod
    def validarCedula(cedula: str):
        """Verifica si la cédula existe en MongoDB o CSV y retorna sus datos"""
        # 1️⃣ Primero intenta buscar en MongoDB
        try:
            persona = cedulas.find_one({"cedula": cedula})
            if persona:
                return {
                    "nombre": persona.get("nombre"),
                    "apellido1": persona.get("apellido1"),
                    "sexo": persona.get("sexo")
                }
        except Exception as e:
            print("Advertencia: No se pudo conectar a MongoDB. Se usará el CSV local.")
            print("Detalle:", e)

        # 2️⃣ Si Mongo falla, busca en CSV
        try:
            with open(SistemaValidacion.CSV_FILE, newline='', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get("cedula_simulada") == cedula:
                        return {
                            "nombre": row["nombre"],
                            "apellido1": row["apellido1"],
                            "sexo": row["sexo"]
                        }
        except FileNotFoundError:
            print("Error: no se encontró el archivo CSV.")
        return None

    @staticmethod
    def validarGenero(cedula: str):
        """Devuelve True si la cédula es femenina"""
        persona = SistemaValidacion.validarCedula(cedula)
        if not persona:
            return None
        return persona["sexo"].lower() == "femenino"

