import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAdminEspecialidades } from './panel-admin-especialidades';

describe('PanelAdminEspecialidades', () => {
  let component: PanelAdminEspecialidades;
  let fixture: ComponentFixture<PanelAdminEspecialidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdminEspecialidades]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdminEspecialidades);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
