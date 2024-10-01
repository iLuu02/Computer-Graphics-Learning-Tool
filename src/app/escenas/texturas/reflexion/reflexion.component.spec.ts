import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReflexionComponent } from './reflexion.component';

describe('ReflexionComponent', () => {
  let component: ReflexionComponent;
  let fixture: ComponentFixture<ReflexionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReflexionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReflexionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
