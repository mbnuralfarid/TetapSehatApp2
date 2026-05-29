import { Component, OnInit } from '@angular/core';
import { MedicationService } from '../services/medication.service';
import { HistoryService } from '../services/history.service';
import { Medication } from '../models/medication.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  todayMedications: { med: Medication, time: string }[] = [];
  pendingNotifications: { med: Medication, time: string }[] = [];

  constructor(
    private medicationService: MedicationService,
    private historyService: HistoryService
  ) { }

  ngOnInit() {
    this.medicationService.medications$.subscribe(meds => {
      this.filterTodayMedications(meds);
    });

    this.historyService.pendingNotifications$.subscribe(pending => {
      this.pendingNotifications = pending;
    });
  }

  filterTodayMedications(meds: Medication[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    this.todayMedications = [];

    for (const med of meds) {
      const start = new Date(med.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(med.endDate);
      end.setHours(23, 59, 59, 999);

      if (today >= start && today <= end) {
        for (const time of med.times) {
          this.todayMedications.push({ med, time });
        }
      }
    }

    // Sort by time
    this.todayMedications.sort((a, b) => a.time.localeCompare(b.time));
  }
}
