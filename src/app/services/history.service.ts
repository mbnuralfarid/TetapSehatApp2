import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { MedicationLog } from '../models/history.model';
import { Medication } from '../models/medication.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private logs = new BehaviorSubject<MedicationLog[]>([]);
    public logs$ = this.logs.asObservable();
    private pendingNotifications = new BehaviorSubject<{ med: Medication, time: string }[]>([]);
    public pendingNotifications$ = this.pendingNotifications.asObservable();
    private readonly STORAGE_KEY = 'medication_history';

    constructor(private storage: StorageService) {
        this.loadLogs();
        // Cek berkala tiap 30 detik untuk update navbar icon
        setInterval(() => this.recalculatePending(), 30000);
    }

    private currentMeds: Medication[] = [];

    public setMedications(meds: Medication[]) {
        this.currentMeds = meds;
        this.recalculatePending();
    }

    public async loadLogs() {
        const data = await this.storage.get(this.STORAGE_KEY) || [];
        this.logs.next(data);
    }

    public getLogs(): MedicationLog[] {
        return this.logs.getValue();
    }

    public getLogByMedicationAndTime(medicationId: string, date: string, time: string): MedicationLog | undefined {
        // Finds if there's already a log for a specific medication on a specific date at a specific time
        return this.getLogs().find(log =>
            log.medicationId === medicationId &&
            log.date === date &&
            log.time === time
        );
    }

    public async addLog(log: MedicationLog) {
        const logs = [...this.getLogs(), log];
        this.logs.next(logs);
        await this.storage.set(this.STORAGE_KEY, logs);
        this.recalculatePending();
    }

    public recalculatePending() {
        if (!this.currentMeds || this.currentMeds.length === 0) {
            this.pendingNotifications.next([]);
            return;
        }

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const todayMedications: { med: Medication, time: string }[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const med of this.currentMeds) {
            const start = new Date(med.startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(med.endDate);
            end.setHours(23, 59, 59, 999);

            if (today >= start && today <= end) {
                for (const time of med.times) {
                    todayMedications.push({ med, time });
                }
            }
        }

        const pending = todayMedications.filter(item => {
            const existingLog = this.getLogByMedicationAndTime(item.med.id, todayStr, item.time);
            if (existingLog) return false;

            const [h, m] = item.time.split(':').map(Number);
            return h < currentHour || (h === currentHour && m <= currentMinute);
        });

        // Urutkan berdasarkan waktu
        pending.sort((a, b) => a.time.localeCompare(b.time));
        this.pendingNotifications.next(pending);
    }
}
