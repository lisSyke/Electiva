from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
import unicodedata
from typing import Optional
import pandas as pd

# -------------------------
# Config FastAPI + CORS
# -------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# MongoDB
# -------------------------
MONGO_URI = "mongodb+srv://Allison:1234aC%2A@cluster0.mtbam3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["proyecto_panico"]
cedulas_col = db["cedulas"]

# -------------------------
# Carga CSV
# -------------------------
CSV_PATH = "sim_cedulas_femeninas.csv"
df = pd.read_csv(CSV_PATH, dtype=str, encoding="utf-8-sig").fillna("")
df.columns = [c.strip() for c in df.columns]

# Añadimos columnas normalizadas
def normalizar_texto(s: Optional[str]) -> str:
    """Convierte texto a minúsculas, sin tildes ni espacios sobrantes."""
    if not s:
        return ""
    s = str(s)
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.strip().casefold()

df["cedula_norm"] = df["cedula_simulada"].apply(normalizar_texto)
df["sexo_norm"] = df["sexo"].apply(normalizar_texto)

# -------------------------
# Helpers
# -------------------------
def limpiar_cadena(texto: Optional[str]) -> str:
    if not texto:
        return ""
    texto = str(texto).strip()
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    texto = texto.casefold()  # 👈 convierte todo a minúsculas uniformes
    texto = " ".join(texto.split())
    return texto.capitalize()


def normalizar_sexo(texto: str):
    t = normalizar_texto(texto)
    if t in ("f", "femenino", "female", "mujer", "woman"):
        return "F"
    if t in ("m", "masculino", "male", "hombre", "man"):
        return "M"
    return None

def limpiar_mongo(doc):
    """Convierte ObjectId a str y elimina campos None."""
    if not doc:
        return None
    doc = dict(doc)
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc

def normalizar_nombre_apellido(nombre: Optional[str]) -> str:
    """
    Normaliza nombres y apellidos:
    - Convierte a minúsculas
    - Elimina tildes
    - Quita dobles espacios
    - Devuelve cadena limpia para comparación
    """
    if not nombre:
        return ""
    nombre = unicodedata.normalize("NFKD", str(nombre))
    sin_tildes = "".join(c for c in nombre if not unicodedata.combining(c))
    return " ".join(sin_tildes.split()).casefold()


def buscar_en_csv(cedula: str):
    """Busca por cédula normalizada, ignorando tildes y mayúsculas."""
    ced_norm = normalizar_texto(cedula)
    fila = df[df["cedula_norm"] == ced_norm]
    if fila.empty:
        return None
    f = fila.iloc[0]
    return {
        "cedula": f.get("cedula_simulada"),
        "nombre": f.get("nombre"),
        "apellido1": f.get("apellido1"),
        "apellido2": f.get("apellido2"),
        "fecha_nacimiento": f.get("fecha_nacimiento"),
        "sexo_original": f.get("sexo"),
        "sexo": normalizar_sexo(f.get("sexo")),
        "ciudad": f.get("ciudad"),
        "correo": f.get("correo_simulado"),
    }

# -------------------------
# Modelos
# -------------------------
class RegistroModel(BaseModel):
    cedula: str
    nombre: str
    apellido1: str
    correo: str

class PanicoModel(BaseModel):
    cedula: str
    ubicacion: str

# -------------------------
# ENDPOINT: verificar cédula / login
# -------------------------
@app.get("/verificar-cedula/{cedula}")
def verificar_cedula(cedula: str):
    cedula_norm = normalizar_texto(cedula)

    # Buscar en Mongo (comparación normalizada)
    usuaria_mongo = cedulas_col.find_one({"cedula_norm": cedula_norm})
    if usuaria_mongo:
        usuaria_limpia = limpiar_mongo(usuaria_mongo)
        sexo_mongo = normalizar_sexo(usuaria_mongo.get("sexo"))
        return {
            "ok": True,
            "existe": True,
            "es_mujer": True if sexo_mongo == "F" else False,
            "mensaje":"Login exitoso. Bienvenida.",
            "fuente": "mongo",
            "usuaria": usuaria_limpia
        }

    # Buscar en CSV
    usuaria_csv = buscar_en_csv(cedula)
    if not usuaria_csv:
        return {"existe": False, "es_mujer": None, "mensaje": "Cédula no encontrada"}

    sexo = usuaria_csv.get("sexo")
    if sexo == "F":
        return {
            "ok":True,
            "existe": False,
            "es_mujer": True,
            "fuente": "csv",
            "usuaria_csv": usuaria_csv,
            "mensaje": "Cédula encontrada y corresponde a una mujer"
        }
    elif sexo == "M":
        return {
            "ok":False,
            "existe": False,
            "es_mujer": False,
            "fuente": "csv",
            "usuaria_csv": usuaria_csv,
            "mensaje": "Cédula corresponde a un hombre. Registro denegado."
        }
    else:
        return {
            "existe": False,
            "es_mujer": None,
            "fuente": "csv",
            "usuaria_csv": usuaria_csv,
            "mensaje": "Cédula encontrada pero sexo no definido"
        }

# -------------------------
# ENDPOINT: registrar
# -------------------------
@app.post("/registrar")
def registrar(model: RegistroModel):
    cedula = model.cedula.strip()
    cedula_norm = normalizar_texto(cedula)

    # Verificar si ya existe (comparando normalizado)
    if cedulas_col.find_one({"cedula_norm": cedula_norm}):
        return {"ok": False, "mensaje": "La usuaria ya está registrada."}

    usuaria_csv = buscar_en_csv(cedula)
    if not usuaria_csv:
        return {"ok": False, "mensaje": "Cédula no encontrada en CSV."}

    if usuaria_csv.get("sexo") != "F":
        return {"ok": False, "mensaje": "La cédula corresponde a un hombre. Registro denegado."}

    nueva = {
        "cedula": cedula,
        "cedula_norm": cedula_norm,  # 👈 se guarda el campo normalizado
        "nombre": limpiar_cadena(usuaria_csv.get("nombre") or model.nombre),
        "apellido1": limpiar_cadena(usuaria_csv.get("apellido1") or model.apellido1),
        "correo": (usuaria_csv.get("correo") or model.correo or "").strip().lower(),
        "sexo": "F",
        "alertas": []
    }
            # Insertar en Mongo
    result = cedulas_col.insert_one(nueva)

        # Agregar el ID como string para devolverlo sin error
    nueva["_id"] = str(result.inserted_id)

    return {
            "ok": True,
            "mensaje": "Usuaria registrada correctamente",
            "usuaria": nueva
    }

    
# -------------------------
# ENDPOINT: botón de pánico
# -------------------------
@app.post("/boton-panico")
def boton_panico(model: PanicoModel):
    cedula_norm = normalizar_texto(model.cedula)
    usuaria = cedulas_col.find_one({"cedula_norm": cedula_norm})
    if not usuaria:
        return {"ok": False, "mensaje": "Usuaria no encontrada. Regístrate primero."}

    alerta = {
        "id": len(usuaria.get("alertas", [])) + 1,
        "ubicacion": model.ubicacion,
        "fechaHora": datetime.utcnow().isoformat(),
        "estado": "Pendiente"
    }

    cedulas_col.update_one({"cedula_norm": cedula_norm}, {"$push": {"alertas": alerta}})
    return {"ok": True, "mensaje": "Alerta registrada exitosamente", "alerta": alerta}

