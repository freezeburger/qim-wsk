import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveTheory } from './reactive.theory';

describe('ReactiveTheory', () => {
  let component: ReactiveTheory;
  let fixture: ComponentFixture<ReactiveTheory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveTheory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactiveTheory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
