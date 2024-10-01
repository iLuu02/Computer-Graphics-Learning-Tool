import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransformacionesComponent } from './transformaciones.component';

describe('TransformacionesComponent', () => {
  let component: TransformacionesComponent;
  let fixture: ComponentFixture<TransformacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransformacionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransformacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
