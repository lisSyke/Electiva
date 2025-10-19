from pymongo import MongoClient

uri = "mongodb+srv://Allison:1234aC%2A@cluster0.mtbam3x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(uri, tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    print("✅ Conectado correctamente a MongoDB Atlas")
except Exception as e:
    print("❌ Error:", e)
