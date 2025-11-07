import time
import pandas as pd
from clases.crud import crear_usuaria
from clases.alerta import AlertaPanico
from db import cedulas

# -----------------------
# Función auxiliar
# -----------------------
def es_mujer(sexo: str) -> bool:
    """
    Verifica si el valor del campo 'sexo' corresponde a mujer.

    Parámetros:
        sexo (str): Valor del campo 'sexo' de la usuaria.

    Retorna:
        bool: True si el sexo es "Femenino", "Mujer" o "F"; False en caso contrario.

    Nota:
        Ignora mayúsculas, minúsculas y espacios adicionales.
    """
    return sexo.strip().capitalize() in ["Femenino", "Mujer", "F"]

# -----------------------
# Función principal
# -----------------------
def verificar_o_registrar_usuaria(cedula: str):
    """
    Verifica si una cédula pertenece a una mujer y registra la usuaria
    en la base de datos si no existe previamente.

    Flujo:
        1. Busca la cédula en la colección 'cedulas'.
        2. Si existe y corresponde a una mujer, permite el registro.
        3. Si no existe, busca la cédula en el CSV 'sim_cedulas_femeninas.csv'.
        4. Si se encuentra y es mujer, crea el registro de la usuaria.
        5. Retorna la información de la usuaria registrada o None si no se puede registrar.

    Parámetros:
        cedula (str): Cédula de la usuaria a verificar o registrar.

    Retorna:
        dict | None: Diccionario con la información de la usuaria registrada,
                     o None si la cédula no corresponde a mujer o no existe.
    """
    # Buscar cédula en la base de datos
    persona = cedulas.find_one({"cedula": cedula})

    if persona:
        # Verificar si la persona es mujer
        if not es_mujer(persona.get("sexo", "")):
            print(f"{persona.get('nombre', 'Usuario')} no es mujer. Registro denegado.")
            return None

        print(f"{persona.get('nombre')} es mujer. Registro permitido.")
        return persona

    # Si no se encuentra en la base, buscar en CSV
    print(f"No se encontró la cédula {cedula} en la colección. Buscando en CSV...")

    try:
        # Cargar CSV con cédulas simuladas femeninas
        df = pd.read_csv("sim_cedulas_femeninas.csv", encoding="utf-8")
        df.columns = [col.replace("\ufeff", "") for col in df.columns]  # Limpia BOM si existe
        registros = df[df["cedula_simulada"] == cedula].to_dict("records")
    except FileNotFoundError:
        print("No se encontró el archivo 'sim_cedulas_femeninas.csv'.")
        return None

    if not registros:
        print("La cédula no aparece en el archivo CSV.")
        return None

    registro = registros[0]
    sexo = registro.get("sexo", "")

    # Verificar si la cédula corresponde a mujer
    if not es_mujer(sexo):
        print(f"{registro.get('nombre', 'Usuario')} no es mujer. No se registrará.")
        return None

    # Crear usuaria en la base de datos
    crear_usuaria(
        registro["cedula_simulada"],
        registro["nombre"],
        registro["apellido1"],
        registro["correo_simulado"]
    )
    print(f"Usuaria {registro['nombre']} registrada correctamente.")
    return registro

# -----------------------
# Programa principal
# -----------------------
if __name__ == "__main__":
    print("Iniciando prueba completa del sistema...\n")

    # Cédula a verificar o registrar
    cedula = "SIM685126461"

    inicio = time.perf_counter()

    # Ejecutar la verificación y registro
    usuaria = verificar_o_registrar_usuaria(cedula)

    if usuaria:
        # Activar alerta de pánico si la usuaria fue registrada o encontrada
        print("\nActivando botón de pánico...")
        alerta = AlertaPanico(
            cedula=cedula,
            ubicacion="https://maps.google.com/?q=4.60971,-74.08175",
            metodo="boton"
        )
        resultado = alerta.registrar()
        print("\nResultado de la alerta:")
        print(resultado)
    else:
        print("\nNo se pudo registrar ni generar alerta para esta cédula.")

    fin = time.perf_counter()
    print(f"\nTiempo total de ejecución: {fin - inicio:.4f} segundos")



