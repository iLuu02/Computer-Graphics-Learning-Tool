import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MallasComponent } from './mallas.component';

describe('MallasComponent', () => {
  let component: MallasComponent;
  let fixture: ComponentFixture<MallasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MallasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MallasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
