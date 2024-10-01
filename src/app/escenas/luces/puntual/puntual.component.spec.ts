import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntualComponent } from './puntual.component';

describe('PuntualComponent', () => {
  let component: PuntualComponent;
  let fixture: ComponentFixture<PuntualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuntualComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PuntualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
