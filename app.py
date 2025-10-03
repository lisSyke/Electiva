from db import cedulas

# Función para registrar una cédula femenina
def registrar_cedula(numero_cedula):
    # Validar si ya existe
    if cedulas.find_one({"cedula": numero_cedula}):
        print("Esa cédula ya está registrada.")
        return

    # Regla simple: último dígito par → femenina
    if int(numero_cedula[-1]) % 2 == 0:
        cedulas.insert_one({"cedula": numero_cedula, "genero": "F"})
        print(" Cédula registrada como Femenina")
    else:
        print("La cédula no corresponde a género femenino")

# Probar registros
registrar_cedula("1023456782")  # 
registrar_cedula("1023456783")  # 
registrar_cedula("1023456782")  # ya existe
