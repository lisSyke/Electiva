import csv
from db import cedulas   # conexión y colección desde db.py

CSV_FILE = "sim_cedulas_femeninas.csv"

def importar_csv():
    with open(CSV_FILE, newline='', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        documentos = []

        for row in reader:
            documentos.append({
                "cedula": row["cedula_simulada"],
                "nombre": row["nombre"],
                "apellido1": row["apellido1"],
                "apellido2": row["apellido2"],
                "fecha_nacimiento": row["fecha_nacimiento"],
                "sexo": row["sexo"],
                "ciudad": row["ciudad"],
                "correo": row["correo_simulado"]
            })

        if documentos:
            cedulas.insert_many(documentos)
            print(f"✅ Se insertaron {len(documentos)} registros en MongoDB Atlas.")

if __name__ == "__main__":
    importar_csv()

