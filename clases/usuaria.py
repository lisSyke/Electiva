from clases.sistema_validacion import SistemaValidacion

class Usuaria:
    def __init__(self, cedula, nombre, apellido1, correo):
        self.cedula = cedula
        self.nombre = nombre
        self.apellido1 = apellido1
        self.correo = correo


    def registrarse(self):
        """Valida y registra a la usuaria"""
        persona = SistemaValidacion.validarCedula(self.cedula)
        if not persona:
            print(f"La cédula {self.cedula} no está en la base de datos.")
            return False

        if persona["sexo"].lower() == "femenino":
            print(f"{persona['nombre']} {persona['apellido1']} registrada exitosamente como usuaria.")
            return True
        else:
            print(f"La cédula {self.cedula} corresponde a un hombre ({persona['nombre']} {persona['apellido1']}). Registro denegado.")
            return False
