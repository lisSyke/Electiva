from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://Allison:1234aC%2A@cluster0.mtbam3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(uri, server_api=ServerApi('1'))

db = client["proyecto_electiva"]
cedulas = db["cedulas"]

try:
    client.admin.command('ping')
    print("✅ Conectado correctamente a MongoDB Atlas")
except Exception as e:
    print("❌ Error al conectar:", e)

#Conexión corregida

