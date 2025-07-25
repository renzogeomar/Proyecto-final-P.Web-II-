from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import register_user
from .views import reservar_cita
from .views import perfil_paciente, citas_paciente
from .views import admin_pacientes_list_create, admin_paciente_detail
from .views import obtener_rol
from .views import admin_medicos, admin_medico_detalle
from .views import admin_medico_horarios, admin_horario_detalle, especialidades_con_medicos, admin_citas_list_create, admin_cita_detail

from .views import (
    listar_especialidades,
    crear_especialidad,
    editar_especialidad,
    eliminar_especialidad,
    medicos_por_especialidad,
    horarios_por_medico
)

urlpatterns = [
    path('especialidades/', listar_especialidades),           # GET
    path('especialidades/crear/', crear_especialidad),        # POST
    path('especialidades/<int:pk>/editar/', editar_especialidad),  # PUT/PATCH
    path('especialidades/<int:pk>/eliminar/', eliminar_especialidad),  # DELETE
    path('medicos/', medicos_por_especialidad),
    path('horarios/', horarios_por_medico),
    path('register/', register_user, name='api_register'),
    path('login/', TokenObtainPairView.as_view(), name='api_login'),
    path('citas/reservar/', reservar_cita),
    path('paciente/perfil/', perfil_paciente, name='api_perfil_paciente'),
    path('paciente/citas/', citas_paciente, name='api_citas_paciente'),
    path('admin/pacientes/', admin_pacientes_list_create, name='api_admin_pacientes'),
    path('admin/pacientes/<int:pk>/', admin_paciente_detail, name='api_admin_paciente_detalle'),
    path('rol/', obtener_rol, name='api_rol'),
    path('admin/medicos/', admin_medicos, name='admin_medicos'),
    path('admin/medicos/<int:pk>/', admin_medico_detalle, name='admin_medico_detalle'),
    # Admin horarios por médico
    path('admin/medicos/<int:medico_id>/horarios/', admin_medico_horarios, name='admin_medico_horarios'),
    # Admin horario individual
    path('admin/horarios/<int:pk>/', admin_horario_detalle, name='admin_horario_detalle'),
    path('especialidades-con-medicos/', especialidades_con_medicos, name='especialidades_con_medicos'),
    # --- ADMIN CITAS ---
    path('admin/citas/', admin_citas_list_create, name='admin_citas'),
    path('admin/citas/<int:pk>/', admin_cita_detail, name='admin_cita_detalle'),
]