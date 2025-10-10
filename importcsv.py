import csv
from db import cedulas   # conexión y colección desde db.py

CSV_FILE = "sim_cedulas_femeninas.csv" #Variable que se refiere a al documento csv con las cédulas

def importar_csv(): #Función para importar el csv
    with open(CSV_FILE, newline='', encoding='utf-8-sig') as f: 
        # 'newline=""' evita errores con saltos de línea
        # 'encoding="utf-8-sig"' asegura leer bien acentos, eñes y elimina el BOM
        reader = csv.DictReader(f)  # Crea un lector de CSV que devuelve cada fila como un diccionario
        documentos = []  # Lista vacía donde se almacenarán los documentos (filas) a insertar en la base de datos

        for row in reader:  # Recorre cada fila del archivo CSV
            documentos.append({ # Toma valores específicos de las columnas del CSV
                "cedula": row["cedula_simulada"],
                "nombre": row["nombre"],
                "apellido1": row["apellido1"],
                "apellido2": row["apellido2"],
                "fecha_nacimiento": row["fecha_nacimiento"],
                "sexo": row["sexo"],
                "ciudad": row["ciudad"],
                "correo": row["correo_simulado"]
            })
            
        # Si la lista 'documentos' no está vacía (es decir, si se leyó algo)
        if documentos:  # Inserta todos los documentos en la colección 'cedulas' de MongoDB Atlas
            cedulas.insert_many(documentos)
            print(f"Se insertaron {len(documentos)} registros en MongoDB Atlas.")

if __name__ == "__main__":
    importar_csv() 

