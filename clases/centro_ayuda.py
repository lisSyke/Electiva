class CentroAyuda:
    def __init__(self, id, titulo, descripcion, enlace):
        self.id = id
        self.titulo = titulo
        self.descripcion = descripcion
        self.enlace = enlace

    def consultar(self):
        print(f"Centro de ayuda: {self.titulo}\nDescripción: {self.descripcion}\nEnlace: {self.enlace}")
