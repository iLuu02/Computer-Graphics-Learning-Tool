import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrafoComponent } from './grafo.component';

describe('GrafoComponent', () => {
  let component: GrafoComponent;
  let fixture: ComponentFixture<GrafoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GrafoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GrafoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
