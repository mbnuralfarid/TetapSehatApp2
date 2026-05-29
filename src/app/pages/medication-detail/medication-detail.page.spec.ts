import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicationDetailPage } from './medication-detail.page';

describe('MedicationDetailPage', () => {
  let component: MedicationDetailPage;
  let fixture: ComponentFixture<MedicationDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
