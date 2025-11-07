from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from pymongo import MongoClient
import pandas as pd

# ---------------------------------------------------------
# CONFIG FASTAPI
# ---------------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambia luego por tu IP si quieres
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# CONEXIÓN A MONGO ATLAS
# ---------------------------------------------------------
MONGO_URI = "mongodb+srv://Allison:1234aC%2A@cluster0.mtbam3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["proyecto_panico"]
cedulas = db["cedulas"]

# ---------------------------------------------------------
# CARGAR CSV SOLO UNA VEZ (Optimizado)
# ---------------------------------------------------------
CSV_PATH = "sim_cedulas_femeninas.csv"

df_cedulas = pd.read_csv(CSV_PATH, dtype=str)

# ---------------------------------------------------------
# Función: Buscar en CSV
# ---------------------------------------------------------
def buscar_en_csv(cedula: str):
    fila = df_cedulas[df_cedulas["cedula_simulada"] == cedula]

    if fila.empty:
        return None

    fila = fila.iloc[0]

    usuaria = {
        "cedula": fila["cedula_simulada"],
        "nombre": fila["nombre"],
        "apellido1": fila["apellido1"],
        "apellido2": fila.get("apellido2"),
        "fecha_nacimiento": fila.get("fecha_nacimiento"),
        "sexo": fila["sexo"],
        "ciudad": fila.get("ciudad"),
        "correo": fila.get("correo_simulado"),
        "alertas": [],
    }

    return usuaria

# ---------------------------------------------------------
# Función: Limpiar ObjectId de Mongo (Evita errores 500)
# ---------------------------------------------------------
def limpiar_mongo(doc):
    if not doc:
        return None

    doc = dict(doc)
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ---------------------------------------------------------
# MODELOS Pydantic
# ---------------------------------------------------------
class RegistroModel(BaseModel):
    cedula: str
    nombre: str
    apellido1: str
    correo: str

class PanicoModel(BaseModel):
    cedula: str
    ubicacion: str

# ---------------------------------------------------------
# ENDPOINT 1: VERIFICAR CÉDULA
# ---------------------------------------------------------
@app.get("/verificar-cedula/{cedula}")
def verificar_cedula(cedula: str):

    # 1. Buscar en MongoDB
    usuaria = cedulas.find_one({"cedula": cedula})
    if usuaria:
        return {
            "ok": True,
            "mensaje": "Cédula ya registrada",
            "usuaria": limpiar_mongo(usuaria)
        }

    # 2. Buscar en CSV
    usuaria_csv = buscar_en_csv(cedula)

    if not usuaria_csv:
        return {"ok": False, "mensaje": "Cédula no encontrada en el CSV"}

    # 3. Validar género
    if usuaria_csv["sexo"] != "Femenino":
        return {"ok": False, "mensaje": "La cédula corresponde a un hombre. No se registra."}

    # 4. Registrar automáticamente
    cedulas.insert_one(usuaria_csv)

    return {
        "ok": True,
        "mensaje": "Usuaria registrada automáticamente desde CSV",
        "usuaria": usuaria_csv,
    }

# ---------------------------------------------------------
# ENDPOINT 2: Registrar usuaria manualmente
# ---------------------------------------------------------
@app.post("/registrar")
def registrar(model: RegistroModel):
    existente = cedulas.find_one({"cedula": model.cedula})
    if existente:
        return {"ok": False, "mensaje": "La usuaria ya está registrada."}

    nueva = {
        "cedula": model.cedula,
        "nombre": model.nombre,
        "apellido1": model.apellido1,
        "correo": model.correo,
        "alertas": []
    }

    cedulas.insert_one(nueva)

    return {"ok": True, "mensaje": "Usuaria registrada correctamente."}

# ---------------------------------------------------------
# ENDPOINT 3: Botón de pánico
# ---------------------------------------------------------
@app.post("/boton-panico")
def boton_panico(model: PanicoModel):

    usuaria = cedulas.find_one({"cedula": model.cedula})

    if not usuaria:
        return {"ok": False, "mensaje": "La usuaria no existe en el sistema."}

    alerta = {
        "id": len(usuaria.get("alertas", [])) + 1,
        "ubicacion": model.ubicacion,
        "fechaHora": datetime.now().isoformat(),
        "estado": "Pendiente"
    }

    cedulas.update_one(
        {"cedula": model.cedula},
        {"$push": {"alertas": alerta}}
    )

    return {
        "ok": True,
        "mensaje": "Alerta registrada",
        "alerta": alerta
    }
