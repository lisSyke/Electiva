from db import cedulas
from clases.usuaria import Usuaria

# --- CREATE ---
def crear_usuaria(cedula, nombre, apellido1, correo):
    existente = cedulas.find_one({"cedula": cedula})
    if existente:
        print(f"La cédula {cedula} ya está registrada.")
        return

    nueva = {
        "cedula": cedula,
        "nombre": nombre,
        "apellido1": apellido1,
        "correo": correo
    }

    cedulas.insert_one(nueva)
    print(f"Usuaria {nombre} {apellido1} registrada correctamente.")


# --- READ ---
def buscar_usuaria(cedula):
    usuaria = cedulas.find_one({"cedula": cedula})
    if usuaria:
        print(f"Usuaria encontrada: {usuaria['nombre']} {usuaria['apellido1']}")
        return Usuaria(
            usuaria["cedula"],
            usuaria["nombre"],
            usuaria["apellido1"],
            usuaria["correo"]
        )
    else:
        print(f"No se encontró la usuaria con cédula {cedula}.")
        return None


# --- UPDATE ---
def actualizar_usuaria(cedula, nuevos_datos):
    resultado = cedulas.update_one({"cedula": cedula}, {"$set": nuevos_datos})
    if resultado.modified_count > 0:
        print(f"Usuaria con cédula {cedula} actualizada correctamente.")
    else:
        print(f"No se encontró usuaria con cédula {cedula} o no hubo cambios.")


# --- DELETE ---
def eliminar_usuaria(cedula):
    resultado = cedulas.delete_one({"cedula": cedula})
    if resultado.deleted_count > 0:
        print(f"Usuaria con cédula {cedula} eliminada correctamente.")
    else:
        print(f"No se encontró usuaria con cédula {cedula}.")
