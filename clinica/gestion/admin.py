from django.contrib import admin
from .models import Especialidad, Medico, Paciente, Cita ,Horario, Administrador
from .models import Administrador
from .forms import AdministradorForm
from django.contrib.auth.models import User

admin.site.register(Especialidad)
admin.site.register(Medico)
admin.site.register(Paciente)
admin.site.register(Cita)
admin.site.register(Horario)

@admin.register(Administrador)
class AdministradorAdmin(admin.ModelAdmin):
    form = AdministradorForm
    list_display = ('nombres', 'apellidos', 'telefono', 'get_username', 'get_email')
    search_fields = ('nombres', 'apellidos', 'telefono', 'usuario__username', 'usuario__email')

    def get_username(self, obj):
        return obj.usuario.username
    get_username.short_description = "Usuario"

    def get_email(self, obj):
        return obj.usuario.email
    get_email.short_description = "Correo"

    def get_form(self, request, obj=None, **kwargs):
        """
        Rellena los campos extra (username/email) con el User al editar.
        """
        form = super().get_form(request, obj, **kwargs)
        if obj:  # edición
            form.base_fields['username'].initial = obj.usuario.username
            form.base_fields['email'].initial = obj.usuario.email
            # password queda vacío a propósito (solo si quieres cambiarla)
        return form

    def save_model(self, request, obj, form, change):
        """
        Crea o actualiza el User relacionado y luego guarda Administrador.
        """
        username = form.cleaned_data.get('username')
        email = form.cleaned_data.get('email')
        password = form.cleaned_data.get('password')  # puede venir vacío al editar

        if not change:
            # crear user nuevo
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password or User.objects.make_random_password(),
                first_name=form.cleaned_data['nombres'],
                last_name=form.cleaned_data['apellidos'],
            )
            user.is_staff = True
            user.save()
            obj.usuario = user
        else:
            # actualizar el user existente
            user = obj.usuario
            user.username = username
            user.email = email
            user.first_name = form.cleaned_data['nombres']
            user.last_name = form.cleaned_data['apellidos']
            if password:  # cambia sólo si ingresaste algo
                user.set_password(password)
            user.save()

        super().save_model(request, obj, form, change)