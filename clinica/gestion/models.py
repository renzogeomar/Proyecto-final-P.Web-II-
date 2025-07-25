from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Especialidad(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Medico(models.Model):
    nombres = models.CharField(max_length=100)
    correo = models.EmailField()
    especialidad = models.ForeignKey(Especialidad, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.nombres} - {self.especialidad.nombre}"

class Paciente(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    def __str__(self):
        return self.usuario.username

class Cita(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE)
    medico = models.ForeignKey(Medico, on_delete=models.CASCADE)
    fecha = models.DateField()
    hora = models.TimeField()
    estado = models.CharField(max_length=20, default='Pendiente')
    creada_en = models.DateTimeField(auto_now_add=True)  # Solo con auto_now_add=True

    def __str__(self):
        return f"Cita {self.paciente} / {self.medico} / {self.fecha} {self.hora}"
    
class Horario(models.Model):
    medico = models.ForeignKey('Medico', on_delete=models.CASCADE)
    fecha = models.DateField()
    hora = models.TimeField()
    disponible = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.medico.nombres} - {self.fecha} {self.hora}"
    
class Administrador(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    nombres = models.CharField(max_length=100, blank=True) 
    apellidos = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.nombres} {self.apellidos}"