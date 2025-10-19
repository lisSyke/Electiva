from datetime import datetime

class Alerta:
    def __init__(self, id, estado="Pendiente"):
        self.id = id
        self.fechaHora = datetime.now()
        self.estado = estado
        self.ubicacion = None

    def enviarSMS(self):
        print(f"Enviando SMS de alerta #{self.id}...")

    def enviarCorreo(self):
        print(f"Enviando correo electrónico de alerta #{self.id}...")
