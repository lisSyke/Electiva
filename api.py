# ================================================
#                IMPORTS
# ================================================
from fastapi import FastAPI #Importa la clase FastAPI, que permite crear tu aplicación web / API.
from fastapi.middleware.cors import CORSMiddleware #permitir que la API sea consumida desde otros dominios
from pydantic import BaseModel #Permite definir modelos de datos (esquemas)
from datetime import datetime # Permite trabajar con fechas y horas (generar timestamps, registrar creación, etc.).
from pymongo import MongoClient # Permite conectarte a una base de datos MongoDB desde Python.
from bson import ObjectId # Convertir IDs en cadenas (str(ObjectId))
import unicodedata #Normalizar texto
from typing import Optional #Permite declarar atributos opcionales
import pandas as pd #una librería para manipular datos en tablas


# ================================================
#        CONFIGURACIÓN DE FASTAPI + CORS
# ================================================
# Se crea la app de FastAPI
app = FastAPI()

# Se activa CORS para permitir que cualquier app móvil o navegador
# pueda conectarse al backend sin restricciones.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Permite accesos desde cualquier origen
    allow_credentials=True,
    allow_methods=["*"],       # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],
)


# ================================================
#                CONEXIÓN A MONGODB
# ================================================
MONGO_URI = "mongodb+srv://Allison:1234aC%2A@cluster0.mtbam3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# Cliente de MongoDB
client = MongoClient(MONGO_URI)

# Base de datos y colección donde se guardan las usuarias
db = client["proyecto_panico"]
cedulas_col = db["cedulas"]


# ================================================
#            CARGA Y PROCESO DEL CSV
# ================================================
# Archivo que simula datos reales de cedulas femeninas
CSV_PATH = "sim_cedulas_femeninas.csv"

# Carga el CSV como strings, reemplaza NaN con "" para prevenir errores
df = pd.read_csv(CSV_PATH, dtype=str, encoding="utf-8-sig").fillna("")

# Limpia encabezados del CSV por si vienen con espacios o BOM
df.columns = [c.strip() for c in df.columns]


# ================================================
#     FUNCIONES DE NORMALIZACIÓN DE TEXTO
# ================================================
def normalizar_texto(s: Optional[str]) -> str:
    """
    Convierte texto a un formato estándar:
    - sin tildes
    - sin mayúsculas
    - sin espacios innecesarios
    Esto permite comparar datos aunque el usuario escriba diferente.
    """
    if not s:
        return ""
    s = str(s)
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.strip().casefold()


# Se agregan columnas normalizadas al CSV para comparar más fácil
df["cedula_norm"] = df["cedula_simulada"].apply(normalizar_texto)
df["sexo_norm"]   = df["sexo"].apply(normalizar_texto)


def limpiar_cadena(texto: Optional[str]) -> str:
    """
    Limpia cadenas para guardarlas:
    - quita tildes
    - convierte a minúsculas
    - deja solo una mayúscula inicial
    """
    if not texto:
        return ""
    texto = str(texto).strip()
    texto = unicodedata.normalize("NFKD", texto)
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    texto = texto.casefold()
    texto = " ".join(texto.split())
    return texto.capitalize()


def normalizar_sexo(texto: str):
    """Devuelve 'F' o 'M', o None si no se identifica el sexo."""
    t = normalizar_texto(texto)
    if t in ("f", "femenino", "female", "mujer", "woman"):
        return "F"
    if t in ("m", "masculino", "male", "hombre", "man"):
        return "M"
    return None


def limpiar_mongo(doc):
    """
    Toma un documento de MongoDB y transforma su ObjectId en string
    para evitar errores al responder JSON.
    """
    if not doc:
        return None
    doc = dict(doc)
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc


def normalizar_nombre_apellido(nombre: Optional[str]) -> str:
    """
    Normaliza nombres y apellidos para comparar:
    - sin tildes
    - en minúsculas
    """
    if not nombre:
        return ""
    nombre = unicodedata.normalize("NFKD", str(nombre))
    sin_tildes = "".join(c for c in nombre if not unicodedata.combining(c))
    return " ".join(sin_tildes.split()).casefold()


def buscar_en_csv(cedula: str):
    """
    Busca una cédula dentro del CSV, usando la columna normalizada.
    """
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


# ================================================
#           MODELOS DE ENTRADA (Pydantic)
# ================================================
class RegistroModel(BaseModel):
    cedula: str
    nombre: str
    apellido1: str
    correo: str


class PanicoModel(BaseModel):
    cedula: str
    ubicacion: str


# ================================================
#         ENDPOINT: VERIFICAR CÉDULA / LOGIN
# ================================================
@app.get("/verificar-cedula/{cedula}")
def verificar_cedula(cedula: str):
    """
    Verifica si la cédula:
    - Existe en Mongo (usuario registrada)
    - Existe en CSV (puede registrarse)
    - No existe (error)
    """
    cedula_norm = normalizar_texto(cedula)

    # Buscar primero en Mongo
    usuaria_mongo = cedulas_col.find_one({"cedula_norm": cedula_norm})

    if usuaria_mongo:
        usuaria_limpia = limpiar_mongo(usuaria_mongo)
        sexo_mongo = normalizar_sexo(usuaria_mongo.get("sexo"))

        return {
            "ok": True,
            "existe": True,
            "es_mujer": True if sexo_mongo == "F" else False,
            "mensaje": "Login exitoso. Bienvenida.",
            "fuente": "mongo",
            "usuaria": usuaria_limpia
        }

    # Si no está en Mongo, buscar en CSV
    usuaria_csv = buscar_en_csv(cedula)

    if not usuaria_csv:
        return {
            "existe": False,
            "es_mujer": None,
            "mensaje": "Cédula no encontrada"
        }

    sexo = usuaria_csv.get("sexo")

    if sexo == "F":
        return {
            "ok": True,
            "existe": False,
            "es_mujer": True,
            "fuente": "csv",
            "usuaria_csv": usuaria_csv,
            "mensaje": "Cédula encontrada y corresponde a una mujer"
        }

    if sexo == "M":
        return {
            "ok": False,
            "existe": False,
            "es_mujer": False,
            "mensaje": "Cédula corresponde a un hombre. Registro denegado.",
            "fuente": "csv"
        }

    return {
        "existe": False,
        "es_mujer": None,
        "mensaje": "Cédula encontrada pero sexo no definido"
    }


# ================================================
#           ENDPOINT: REGISTRAR USUARIA
# ================================================
@app.post("/registrar")
def registrar(model: RegistroModel):
    """
    Registra una nueva usuaria SI:
    - No existe en Mongo
    - Sí existe en el CSV
    - Es mujer
    """
    cedula = model.cedula.strip()
    cedula_norm = normalizar_texto(cedula)

    # Verificar si ya está registrada
    if cedulas_col.find_one({"cedula_norm": cedula_norm}):
        return {"ok": False, "mensaje": "La usuaria ya está registrada."}

    # Validación contra CSV
    usuaria_csv = buscar_en_csv(cedula)

    if not usuaria_csv:
        return {"ok": False, "mensaje": "Cédula no encontrada en CSV."}

    if usuaria_csv.get("sexo") != "F":
        return {"ok": False, "mensaje": "La cédula corresponde a un hombre. Registro denegado."}

    # Construcción del documento a guardar
    nueva = {
        "cedula": cedula,
        "cedula_norm": cedula_norm,
        "nombre": limpiar_cadena(usuaria_csv.get("nombre") or model.nombre),
        "apellido1": limpiar_cadena(usuaria_csv.get("apellido1") or model.apellido1),
        "correo": (usuaria_csv.get("correo") or model.correo).strip().lower(),
        "sexo": "F",
        "alertas": []
    }

    # Insertar en Mongo
    result = cedulas_col.insert_one(nueva)

    # Adjuntar ID para el frontend
    nueva["_id"] = str(result.inserted_id)

    return {
        "ok": True,
        "mensaje": "Usuaria registrada correctamente",
        "usuaria": nueva
    }


# ================================================
#         ENDPOINT: BOTÓN DE PÁNICO
# ================================================
@app.post("/boton-panico")
def boton_panico(model: PanicoModel):
    """
    Registra una alerta de emergencia dentro del historial de la usuaria.
    """
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

    cedulas_col.update_one(
        {"cedula_norm": cedula_norm},
        {"$push": {"alertas": alerta}}
    )

    return {
        "ok": True,
        "mensaje": "Alerta registrada exitosamente",
        "alerta": alerta
    }

