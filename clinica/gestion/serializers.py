from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Especialidad, Medico
from .models import Cita
from .models import Paciente
from .models import Horario

class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = '__all__'

class MedicoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medico
        fields = ['id', 'nombres', 'correo', 'especialidad']

class MedicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medico
        fields = '__all__'

class EspecialidadConMedicosSerializer(serializers.ModelSerializer):
    medicos = serializers.SerializerMethodField()

    class Meta:
        model = Especialidad
        fields = ['id', 'nombre', 'medicos']

    def get_medicos(self, obj):
        medicos = Medico.objects.filter(especialidad=obj)
        return MedicoSimpleSerializer(medicos, many=True).data

class CitaSerializer(serializers.ModelSerializer):
    medico = serializers.CharField(source='medico.nombres', read_only=True)
    especialidad = serializers.CharField(source='medico.especialidad.nombre', read_only=True)

    class Meta:
        model = Cita
        fields = ['id', 'fecha', 'hora', 'estado', 'medico', 'especialidad']

class PacienteAdminSerializer(serializers.ModelSerializer):
    # Campos del User relacionado
    username = serializers.CharField(source='usuario.username')
    email = serializers.EmailField(source='usuario.email', required=False, allow_blank=True)
    first_name = serializers.CharField(source='usuario.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='usuario.last_name', required=False, allow_blank=True)

    class Meta:
        model = Paciente
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'telefono']

    def create(self, validated_data):
        user_data = validated_data.pop('usuario')
        username = user_data.get('username')
        email = user_data.get('email', '')
        first_name = user_data.get('first_name', '')
        last_name = user_data.get('last_name', '')

        # Password: si viene en context o validated_data extra
        password = self.context.get('password', None)
        if not password:
            password = User.objects.make_random_password()

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        paciente = Paciente.objects.create(usuario=user, **validated_data)
        return paciente

    def update(self, instance, validated_data):
        user_data = validated_data.pop('usuario', {})
        usuario = instance.usuario

        # Actualizar campos del User si vienen
        for src_field, user_field in [
            ('username', 'username'),
            ('email', 'email'),
            ('first_name', 'first_name'),
            ('last_name', 'last_name'),
        ]:
            if src_field in user_data:
                setattr(usuario, user_field, user_data[src_field])

        usuario.save()

        # actualizar Paciente
        telefono = validated_data.get('telefono', None)
        if telefono is not None:
            instance.telefono = telefono
            instance.save()

        return instance
    
class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'   # id, medico, fecha, hora, disponible

class CitaAdminSerializer(serializers.ModelSerializer):
    # Datos enriquecidos de solo lectura
    paciente_username = serializers.CharField(source='paciente.usuario.username', read_only=True)
    paciente_nombre = serializers.SerializerMethodField()
    medico_nombre = serializers.CharField(source='medico.nombres', read_only=True)
    especialidad_nombre = serializers.CharField(source='medico.especialidad.nombre', read_only=True)

    class Meta:
        model = Cita
        fields = [
            'id',
            'paciente',              # FK id (editable)
            'paciente_username',     # readonly
            'paciente_nombre',       # readonly
            'medico',                # FK id (editable)
            'medico_nombre',         # readonly
            'especialidad_nombre',   # readonly
            'fecha',
            'hora',
            'estado',
        ]

    def get_paciente_nombre(self, obj):
        first = obj.paciente.usuario.first_name or ''
        last = obj.paciente.usuario.last_name or ''
        full = f'{first} {last}'.strip()
        return full or obj.paciente.usuario.username