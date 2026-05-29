import { Component, OnInit } from '@angular/core';
import { HistoryService } from '../../services/history.service';
import { MedicationLog } from '../../models/history.model';
import { Medication } from '../../models/medication.model';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: false
})
export class HistoryPage implements OnInit {
  logs: MedicationLog[] = [];
  pendingNotifications: { med: Medication, time: string }[] = [];

  constructor(private historyService: HistoryService) { }

  ngOnInit() {
    this.historyService.logs$.subscribe(data => {
      // Sort logs by newest first
      this.logs = [...data].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
    });

    this.historyService.pendingNotifications$.subscribe(pending => {
      this.pendingNotifications = pending;
    });
  }

  formatDate(isoString: string) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
