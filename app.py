from db import cedulas  # conexión a MongoDB

def registrar_cedula(cedula):
    # Buscar la cédula en la base de datos
    persona = cedulas.find_one({"cedula": cedula})

    if not persona: #En dado caso que la cédula no sea válida muestra un mensaje de error.
        print(f"La cédula {cedula} no está en la base de datos.") 
        return
        
    #Podría agregar un .lower para evitar errores
    if persona["sexo"] == "Femenino": #Comprobación de una cédula femenina
        print(f"{persona['nombre']} {persona['apellido1']} registrada exitosamente como usuaria, bienvenida.")  
    else: #En dado caso que se ingrese una cédula másculina
        print(f"La cédula {cedula} corresponde a un hombre ({persona['nombre']} {persona['apellido1']}). Registro denegado.") 
        #Quitar nombre y apellido del hombre que trató de ingresar, por privacidad.

# --- Ejemplo de uso ---
if __name__ == "__main__":
    registrar_cedula("SIM896233790")  # mujer
    registrar_cedula("SIM123456789")  # hombre
    registrar_cedula("SIM999999999")  # no existe
