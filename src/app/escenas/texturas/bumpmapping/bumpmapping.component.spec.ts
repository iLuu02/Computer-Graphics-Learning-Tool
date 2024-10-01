import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BumpmappingComponent } from './bumpmapping.component';

describe('BumpmappingComponent', () => {
  let component: BumpmappingComponent;
  let fixture: ComponentFixture<BumpmappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BumpmappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BumpmappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
