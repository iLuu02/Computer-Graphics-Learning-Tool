import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscenalibreComponent } from './escenalibre.component';

describe('EscenalibreComponent', () => {
  let component: EscenalibreComponent;
  let fixture: ComponentFixture<EscenalibreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EscenalibreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EscenalibreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
