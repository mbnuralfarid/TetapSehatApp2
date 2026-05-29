import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Medication } from '../models/medication.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    constructor() { }

    async requestPermissions() {
        try {
            const { display } = await LocalNotifications.requestPermissions();
            return display === 'granted';
        } catch (e) {
            // In web, might throw error if unsupported
            return false;
        }
    }

    async scheduleMedicationNotification(med: Medication) {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return;

        // Remove old notifications for this medication
        await this.cancelMedicationNotification(med.id);

        const notifications = [];
        // Ensure ID fits in int32 for capacitor local notifications
        const idBase = parseInt(med.id.slice(-5)) || Math.floor(Math.random() * 100000);

        let count = 0;
        for (const time of med.times) {
            const [hours, minutes] = time.split(':').map(Number);

            notifications.push({
                title: 'Saatnya Minum Obat!',
                body: `Waktunya minum ${med.name}`,
                id: idBase + count,
                schedule: {
                    on: { hour: hours, minute: minutes },
                    allowWhileIdle: true,
                },
                extra: {
                    medicationId: med.id,
                    time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
                }
            });
            count++;
        }

        if (notifications.length > 0) {
            await LocalNotifications.schedule({ notifications });
        }
    }

    async cancelMedicationNotification(medId: string) {
        try {
            const pending = await LocalNotifications.getPending();
            const toCancel = pending.notifications.filter(n => n.extra?.medicationId === medId);
            if (toCancel.length > 0) {
                await LocalNotifications.cancel({ notifications: toCancel });
            }
        } catch (e) {
            console.warn("Could not cancel notifications", e);
        }
    }
}
