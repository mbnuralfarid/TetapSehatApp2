import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Medication } from '../models/medication.model';
import { NotificationService } from './notification.service';
import { HistoryService } from './history.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MedicationService {
    private medications = new BehaviorSubject<Medication[]>([]);
    public medications$ = this.medications.asObservable();
    private readonly STORAGE_KEY = 'medications_data';

    constructor(
        private storage: StorageService,
        private notificationService: NotificationService,
        private historyService: HistoryService
    ) {
        this.loadMedications();
        this.medications$.subscribe(meds => {
            this.historyService.setMedications(meds);
        });
    }

    public async loadMedications() {
        const data = await this.storage.get(this.STORAGE_KEY) || [];
        this.medications.next(data);
    }

    public getMedications(): Medication[] {
        return this.medications.getValue();
    }

    public async getMedicationById(id: string): Promise<Medication | undefined> {
        const meds = this.getMedications();
        return meds.find(m => m.id === id);
    }

    public async addOrUpdateMedication(med: Medication) {
        const meds = [...this.getMedications()];
        const index = meds.findIndex(m => m.id === med.id);

        if (index > -1) {
            meds[index] = med;
        } else {
            meds.push(med);
        }

        this.medications.next(meds);
        await this.storage.set(this.STORAGE_KEY, meds);
        await this.notificationService.scheduleMedicationNotification(med);
    }

    public async deleteMedication(id: string) {
        let meds = [...this.getMedications()];
        meds = meds.filter(m => m.id !== id);

        this.medications.next(meds);
        await this.storage.set(this.STORAGE_KEY, meds);
        await this.notificationService.cancelMedicationNotification(id);
    }
}
