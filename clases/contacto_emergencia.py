class ContactoEmergencia:
    def __init__(self, id, nombre, telefono, correo):
        self.id = id
        self.nombre = nombre
        self.telefono = telefono
        self.correo = correo

    def recibirAlerta(self):
        print(f"Alerta recibida por {self.nombre} ({self.telefono})")
