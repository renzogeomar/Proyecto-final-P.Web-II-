import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAdminMedicos } from './panel-admin-medicos';

describe('PanelAdminMedicos', () => {
  let component: PanelAdminMedicos;
  let fixture: ComponentFixture<PanelAdminMedicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdminMedicos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdminMedicos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
