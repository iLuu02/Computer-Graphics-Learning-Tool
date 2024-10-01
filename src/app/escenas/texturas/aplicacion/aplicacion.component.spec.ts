import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AplicacionComponent } from './aplicacion.component';

describe('AplicacionComponent', () => {
  let component: AplicacionComponent;
  let fixture: ComponentFixture<AplicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AplicacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AplicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
