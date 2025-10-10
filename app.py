from db import cedulas  # conexión a MongoDB

def registrar_cedula(cedula):
    # Buscar la cédula en la base de datos
    persona = cedulas.find_one({"cedula": cedula})

    if not persona:
        print(f"La cédula {cedula} no está en la base de datos.")
        return

    if persona["sexo"] == "Femenino":
        print(f"{persona['nombre']} {persona['apellido1']} registrada exitosamente como usuaria.")
    else:
        print(f"La cédula {cedula} corresponde a un hombre ({persona['nombre']} {persona['apellido1']}). Registro denegado.")

# --- Ejemplo de uso ---
if __name__ == "__main__":
    registrar_cedula("SIM896233790")  # mujer
    registrar_cedula("SIM123456789")  # hombre
    registrar_cedula("SIM999999999")  # no existe
