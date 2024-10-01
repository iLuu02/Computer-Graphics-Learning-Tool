import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DireccionalComponent } from './direccional.component';

describe('DireccionalComponent', () => {
  let component: DireccionalComponent;
  let fixture: ComponentFixture<DireccionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DireccionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DireccionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
