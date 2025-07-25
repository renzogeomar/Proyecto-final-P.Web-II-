import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelAdminCitas } from './panel-admin-citas';

describe('PanelAdminCitas', () => {
  let component: PanelAdminCitas;
  let fixture: ComponentFixture<PanelAdminCitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelAdminCitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelAdminCitas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
