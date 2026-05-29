import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private router: Router) {
    this.initializeApp();
  }

  initializeApp() {
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      const extra = notification.notification.extra;
      if (extra && extra.medicationId && extra.time) {
        // user clicked the notification, go to detail page and pass the scheduled time
        this.router.navigate(['/medication-detail', extra.medicationId], {
          queryParams: { time: extra.time }
        });
      } else if (extra && extra.medicationId) {
        this.router.navigate(['/medication-detail', extra.medicationId]);
      }
    });
  }
}
