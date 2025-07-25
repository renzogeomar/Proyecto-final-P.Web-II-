from django import forms
from django.contrib.auth.models import User
from .models import Administrador
    
class AdministradorForm(forms.ModelForm):
    username = forms.CharField(label="Usuario")
    email = forms.EmailField(label="Correo", required=False)
    password = forms.CharField(
        widget=forms.PasswordInput,
        label="Contraseña",
        required=False,
        help_text="Dejar en blanco al editar si no deseas cambiar la contraseña."
    )

    class Meta:
        model = Administrador
        # Solo los campos que existen en el MODELO
        fields = ['nombres', 'apellidos', 'telefono']