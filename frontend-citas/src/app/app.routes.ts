import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Nosotros } from './pages/nosotros/nosotros';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Especialidades } from './pages/especialidades/especialidades';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'nosotros', component: Nosotros },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'especialidades', component: Especialidades },
    // ✅ Agregar rutas para paneles
    { path: 'panel-paciente', loadComponent: () => import('./pages/panel-paciente/panel-paciente').then(m => m.PanelPaciente) },
    { path: 'perfil', loadComponent: () => import('./pages/perfil-paciente/perfil-paciente').then(m => m.PerfilPaciente) },
    { path: 'panel-admin', loadComponent: () => import('./pages/panel-admin/panel-admin').then(m => m.PanelAdmin) },
    { path: 'panel-admin-medicos', loadComponent: () => import('./pages/panel-admin-medicos/panel-admin-medicos').then(m => m.PanelAdminMedicos) },
    { 
        path: 'panel-admin-especialidades', 
        loadComponent: () => import('./pages/panel-admin-especialidades/panel-admin-especialidades')
          .then(m => m.PanelAdminEspecialidades) 
    },
    { path: 'panel-admin-citas',
        loadComponent: () => import('./pages/panel-admin-citas/panel-admin-citas')
          .then(m => m.PanelAdminCitas)
    },

];
