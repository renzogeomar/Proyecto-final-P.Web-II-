from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.urls import reverse
from rest_framework.response import Response
from .models import Especialidad, Medico
from .serializers import EspecialidadSerializer, MedicoSerializer
from rest_framework import viewsets
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Paciente, Medico, Cita , Horario, Administrador
from .serializers import PacienteAdminSerializer, HorarioSerializer
from django.db.models import Q
from .models import Medico, Especialidad
from .serializers import MedicoSerializer
from .serializers import EspecialidadConMedicosSerializer
from .serializers import CitaAdminSerializer
from .serializers import CitaSerializer

# Create your views here.
def angular_app(request):
    return render(request, 'index.html')

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password or not email:
        return Response({'error': 'Todos los campos son obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'El usuario ya existe'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)

    # Crear perfil paciente
    Paciente.objects.create(usuario=user)

    # 🔁 Generar URL completa a la vista de login
    login_url = request.build_absolute_uri(reverse('api_login'))

    # ✅ Envío de correo de confirmación
    try:
        send_mail(
            subject='Registro exitoso en Citas Médicas',
            message=f'Hola {username}, tu registro fue completado exitosamente.',
            from_email='notificaciones@citasmedicas.com',  # Usa el mismo que pusiste en settings.py
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        return Response({'error': f'Usuario creado, pero hubo un error al enviar el correo: {str(e)}'}, status=201)

    return Response({'message': 'Usuario creado correctamente'}, status=status.HTTP_201_CREATED)
# --- LISTA PÚBLICA ---
@api_view(['GET'])
def listar_especialidades(request):
    especialidades = Especialidad.objects.all()
    serializer = EspecialidadSerializer(especialidades, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def medicos_por_especialidad(request):
    especialidad_id = request.GET.get('especialidad')
    medicos = Medico.objects.filter(especialidad_id=especialidad_id)
    serializer = MedicoSerializer(medicos, many=True)
    return Response(serializer.data)

class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer

@api_view(['GET'])
def listar_especialidades(request):
    especialidades = Especialidad.objects.all()
    serializer = EspecialidadSerializer(especialidades, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def crear_especialidad(request):
    serializer = EspecialidadSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated, IsAdminUser])
def editar_especialidad(request, pk):
    try:
        esp = Especialidad.objects.get(pk=pk)
    except Especialidad.DoesNotExist:
        return Response({'error': 'No existe.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = EspecialidadSerializer(esp, data=request.data, partial=True)  # partial soporta PATCH
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def eliminar_especialidad(request, pk):
    try:
        especialidad = Especialidad.objects.get(pk=pk)
        especialidad.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Especialidad.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def especialidades_con_medicos(request):
    especialidades = Especialidad.objects.all()
    serializer = EspecialidadConMedicosSerializer(especialidades, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def medicos_por_especialidad(request):
    especialidad_id = request.GET.get('especialidad')
    medicos = Medico.objects.filter(especialidad_id=especialidad_id)
    data = [{"id": m.id, "nombres": m.nombres, "correo": m.correo} for m in medicos]
    return Response(data)

@api_view(['GET'])
def horarios_por_medico(request):
    medico_id = request.GET.get('medico')
    if not medico_id:
        return Response([], status=200)

    horarios = Horario.objects.filter(medico_id=medico_id, disponible=True).order_by('fecha', 'hora')
    data = [
        {
            "id": h.id,
            "fecha": h.fecha.isoformat(),  # YYYY-MM-DD
            "hora": h.hora.strftime('%H:%M')  # formato corto
        }
        for h in horarios
    ]
    return Response(data)

@api_view(['GET'])
def especialidades_con_medicos(request):
    especialidades = Especialidad.objects.all()
    data = []
    for esp in especialidades:
        medicos = Medico.objects.filter(especialidad=esp)
        data.append({
            "id": esp.id,
            "nombre": esp.nombre,
            "medicos": MedicoSerializer(medicos, many=True).data
        })
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reservar_cita(request):
    user = request.user

    # Asegurarnos de que el usuario tenga perfil Paciente
    try:
        paciente = Paciente.objects.get(usuario=user)
    except Paciente.DoesNotExist:
        return Response({'error': 'Solo los pacientes pueden reservar citas.'},
                        status=status.HTTP_403_FORBIDDEN)

    medico_id = request.data.get('medico')
    fecha = request.data.get('fecha')
    hora = request.data.get('hora')

    if not (medico_id and fecha and hora):
        return Response({'error': 'Campos incompletos.'},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        medico = Medico.objects.get(pk=medico_id)
    except Medico.DoesNotExist:
        return Response({'error': 'Médico no encontrado.'},
                        status=status.HTTP_404_NOT_FOUND)

    # ¿Existe un horario marcado como disponible?
    horario = Horario.objects.filter(
        medico=medico,
        fecha=fecha,
        hora=hora,
        disponible=True
    ).first()

    if not horario:
        return Response({'error': 'Horario no disponible.'},
                        status=status.HTTP_400_BAD_REQUEST)

    # Crear cita
    cita = Cita.objects.create(
        paciente=paciente,
        medico=medico,
        fecha=fecha,
        hora=hora,
        estado='Pendiente'
    )

    # Marcar horario como ya usado
    horario.disponible = False
    horario.save()

    return Response({
        'message': 'Cita reservada con éxito.',
        'cita_id': cita.id,
        'fecha': fecha,
        'hora': hora,
        'medico': medico.nombres,
        'especialidad': medico.especialidad.nombre,
    }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def perfil_paciente(request):
    """Devuelve datos del paciente logueado (solo lectura)."""
    try:
        paciente = Paciente.objects.select_related('usuario').get(usuario=request.user)
    except Paciente.DoesNotExist:
        return Response({'error': 'No es paciente.'}, status=status.HTTP_403_FORBIDDEN)

    data = {
        'username': paciente.usuario.username,
        'email': paciente.usuario.email,
        'first_name': paciente.usuario.first_name,
        'last_name': paciente.usuario.last_name,
        'telefono': paciente.telefono,
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def citas_paciente(request):
    paciente = Paciente.objects.get(usuario=request.user)
    citas = Cita.objects.filter(paciente=paciente).order_by('-fecha', '-hora')
    serializer = CitaSerializer(citas, many=True)
    return Response(serializer.data)

def es_admin(user):
    return user.is_staff or hasattr(user, 'administrador')

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_pacientes_list_create(request):
    user = request.user
    if not es_admin(user):
        return Response({'error': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

    # LISTAR / BUSCAR
    if request.method == 'GET':
        q = request.GET.get('q', '').strip()
        pacientes = Paciente.objects.select_related('usuario').all()
        if q:
            pacientes = pacientes.filter(
                Q(usuario__username__icontains=q) |
                Q(usuario__first_name__icontains=q) |
                Q(usuario__last_name__icontains=q) |
                Q(telefono__icontains=q)
            )
        serializer = PacienteAdminSerializer(pacientes, many=True)
        return Response(serializer.data)

    # CREAR
    if request.method == 'POST':
        password = request.data.get('password')  # opcional
        serializer = PacienteAdminSerializer(data=request.data, context={'password': password})
        if serializer.is_valid():
            paciente = serializer.save()
            return Response(PacienteAdminSerializer(paciente).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_paciente_detail(request, pk):
    user = request.user
    if not es_admin(user):
        return Response({'error': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        paciente = Paciente.objects.select_related('usuario').get(pk=pk)
    except Paciente.DoesNotExist:
        return Response({'error': 'Paciente no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PacienteAdminSerializer(paciente)
        return Response(serializer.data)

    if request.method == 'PATCH':
        serializer = PacienteAdminSerializer(paciente, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(PacienteAdminSerializer(paciente).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    if request.method == 'DELETE':
        # eliminar también el User
        paciente.usuario.delete()  # cascada borra paciente
        return Response(status=status.HTTP_204_NO_CONTENT)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def obtener_rol(request):
    user = request.user

    # ¿Administrador?
    if user.is_staff or Administrador.objects.filter(usuario=user).exists():
        return Response({'rol': 'Administrador'})

    # ¿Paciente?
    if Paciente.objects.filter(usuario=user).exists():
        return Response({'rol': 'Paciente'})

    # Ninguna coincidencia
    return Response({'rol': 'Desconocido'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_medicos(request):
    """
    GET: lista con búsqueda por ?q=
    POST: crear médico {nombres, correo, especialidad}
    """
    if request.method == 'GET':
        q = request.GET.get('q', '').strip()
        medicos = Medico.objects.all()
        if q:
            medicos = medicos.filter(nombres__icontains=q) | medicos.filter(correo__icontains=q)
        serializer = MedicoSerializer(medicos, many=True)
        return Response(serializer.data)

    # POST
    nombres = request.data.get('nombres')
    correo = request.data.get('correo')
    especialidad_id = request.data.get('especialidad')

    if not nombres or not correo or not especialidad_id:
        return Response({'error': 'Todos los campos son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        esp = Especialidad.objects.get(pk=especialidad_id)
    except Especialidad.DoesNotExist:
        return Response({'error': 'Especialidad no válida.'}, status=status.HTTP_400_BAD_REQUEST)

    medico = Medico.objects.create(nombres=nombres, correo=correo, especialidad=esp)
    serializer = MedicoSerializer(medico)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_medico_detalle(request, pk):
    """
    GET: detalle
    PUT: actualizar
    DELETE: eliminar
    """
    try:
        medico = Medico.objects.get(pk=pk)
    except Medico.DoesNotExist:
        return Response({'error': 'Médico no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = MedicoSerializer(medico)
        return Response(serializer.data)

    if request.method == 'PUT':
        nombres = request.data.get('nombres', medico.nombres)
        correo = request.data.get('correo', medico.correo)
        especialidad_id = request.data.get('especialidad', medico.especialidad_id)

        try:
            esp = Especialidad.objects.get(pk=especialidad_id)
        except Especialidad.DoesNotExist:
            return Response({'error': 'Especialidad no válida.'}, status=status.HTTP_400_BAD_REQUEST)

        medico.nombres = nombres
        medico.correo = correo
        medico.especialidad = esp
        medico.save()

        serializer = MedicoSerializer(medico)
        return Response(serializer.data)

    # DELETE
    medico.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_medico_horarios(request, medico_id):
    """
    GET: Lista horarios de un médico.
    POST: Crea horario para el médico.
          body: {fecha: 'YYYY-MM-DD', hora: 'HH:MM', disponible?: bool}
    """
    try:
        medico = Medico.objects.get(pk=medico_id)
    except Medico.DoesNotExist:
        return Response({'error': 'Médico no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        qs = Horario.objects.filter(medico=medico).order_by('fecha', 'hora')
        ser = HorarioSerializer(qs, many=True)
        return Response(ser.data)

    # POST
    data = request.data.copy()
    data['medico'] = medico.id
    ser = HorarioSerializer(data=data)
    if ser.is_valid():
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_horario_detalle(request, pk):
    """
    PUT: Actualiza un horario existente.
    DELETE: Elimina horario.
    """
    try:
        hor = Horario.objects.get(pk=pk)
    except Horario.DoesNotExist:
        return Response({'error': 'Horario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        # Permitimos actualización parcial
        data = request.data.copy()
        if 'medico' not in data:
            data['medico'] = hor.medico_id
        ser = HorarioSerializer(hor, data=data, partial=True)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    hor.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------------------------------------------------------
# ADMIN - LIST / CREATE Citas
# ------------------------------------------------------------------
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_citas_list_create(request):
    # Revisa privilegio admin (usa tu modelo Administrador o is_staff)
    if not request.user.is_staff:
        return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        qs = Cita.objects.select_related(
            'paciente__usuario', 'medico__especialidad'
        ).all()

        q = request.GET.get('q')
        if q:
            qs = qs.filter(
                Q(paciente__usuario__username__icontains=q) |
                Q(paciente__usuario__first_name__icontains=q) |
                Q(paciente__usuario__last_name__icontains=q) |
                Q(medico__nombres__icontains=q) |
                Q(medico__especialidad__nombre__icontains=q) |
                Q(estado__icontains=q)
            )

        ser = CitaAdminSerializer(qs, many=True)
        return Response(ser.data)

    # POST crear
    ser = CitaAdminSerializer(data=request.data)
    if ser.is_valid():
        ser.save()
        return Response(ser.data, status=status.HTTP_201_CREATED)
    return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)


# ------------------------------------------------------------------
# ADMIN - DETAIL / UPDATE / DELETE Cita
# ------------------------------------------------------------------
@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_cita_detail(request, pk):
    if not request.user.is_staff:
        return Response({'detail': 'No autorizado.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        cita = Cita.objects.select_related(
            'paciente__usuario', 'medico__especialidad'
        ).get(pk=pk)
    except Cita.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        ser = CitaAdminSerializer(cita)
        return Response(ser.data)

    if request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        ser = CitaAdminSerializer(cita, data=request.data, partial=partial)
        if ser.is_valid():
            ser.save()
            return Response(ser.data)
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE
    cita.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)