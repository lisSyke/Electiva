from clases.crud import crear_usuaria, buscar_usuaria, actualizar_usuaria, eliminar_usuaria

if __name__ == "__main__":
    # Crear una usuaria
    crear_usuaria("SIM999000111", "Laura", "Gómez", "laura@example.com")

    # Buscar usuaria
    usuaria = buscar_usuaria("SIM999000111")

    # Actualizar usuaria
    if usuaria:
        actualizar_usuaria("SIM999000111", {"correo": "laura_nuevo@example.com"})

    # Eliminar usuaria
    eliminar_usuaria("SIM999000111")

#Nueva ejecución