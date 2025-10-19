from datetime import datetime

class Testimonio:
    def __init__(self, id, contenido, anonimo=False):
        self.id = id
        self.contenido = contenido
        self.fecha = datetime.now()
        self.votosUtilidad = 0
        self.anonimo = anonimo

    def publicar(self):
        print(f"Testimonio {'anónimo' if self.anonimo else 'público'} publicado.")

    def marcarUtil(self):
        self.votosUtilidad += 1
        print(f"Testimonio #{self.id} marcado como útil ({self.votosUtilidad} votos).")
