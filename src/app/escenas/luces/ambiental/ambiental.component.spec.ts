import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbientalComponent } from './ambiental.component';

describe('AmbientalComponent', () => {
  let component: AmbientalComponent;
  let fixture: ComponentFixture<AmbientalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AmbientalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AmbientalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
