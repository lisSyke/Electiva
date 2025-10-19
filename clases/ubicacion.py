from datetime import datetime

class Ubicacion:
    def __init__(self, latitud, longitud):
        self.latitud = latitud
        self.longitud = longitud
        self.timestamp = datetime.now()
