import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicationService } from '../../services/medication.service';
import { HistoryService } from '../../services/history.service';
import { Medication } from '../../models/medication.model';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { MedicationLog } from '../../models/history.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-medication-detail',
  templateUrl: './medication-detail.page.html',
  styleUrls: ['./medication-detail.page.scss'],
  standalone: false
})
export class MedicationDetailPage implements OnInit, OnDestroy {
  medication: Medication | undefined;
  pendingTime: string | null = null;
  hasConfirmedForPendingTime = false;
  private pendingSub: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private medicationService: MedicationService,
    private historyService: HistoryService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() { }

  ngOnDestroy() {
    if (this.pendingSub) {
      this.pendingSub.unsubscribe();
    }
  }

  async ionViewWillEnter() {
    const id = this.route.snapshot.paramMap.get('id');
    const queryTime = this.route.snapshot.queryParamMap.get('time');

    if (id) {
      this.medication = await this.medicationService.getMedicationById(id);

      if (queryTime) {
        this.pendingTime = queryTime;
        this.checkConfirmationStatus(id, queryTime);
      } else {
        // If no time in query params, look for a pending one for this medication today
        this.pendingSub = this.historyService.pendingNotifications$.subscribe(pendingList => {
          const matched = pendingList.find(p => p.med.id === id);
          if (matched) {
            this.pendingTime = matched.time;
            this.hasConfirmedForPendingTime = false;
          } else {
            this.pendingTime = null;
          }
        });
      }
    }
  }

  private checkConfirmationStatus(id: string, time: string) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const existingLog = this.historyService.getLogByMedicationAndTime(id, todayStr, time);
    this.hasConfirmedForPendingTime = !!existingLog;
  }

  async confirmMedication(status: 'TAKEN' | 'SKIPPED') {
    if (!this.medication || !this.pendingTime) return;

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const log: MedicationLog = {
      id: Date.now().toString(),
      medicationId: this.medication.id,
      medicationName: this.medication.name,
      dosage: this.medication.dosage,
      date: todayStr,
      time: this.pendingTime,
      status: status,
      loggedAt: now.toISOString()
    };

    await this.historyService.addLog(log);
    this.hasConfirmedForPendingTime = true;

    const toast = await this.toastCtrl.create({
      message: status === 'TAKEN' ? 'Bagus! Obat telah diminum.' : 'Jadwal obat dilewati.',
      duration: 2000,
      color: status === 'TAKEN' ? 'success' : 'warning'
    });
    await toast.present();

    // Refresh pending time detection
    if (!status) {
      this.pendingTime = null;
    }
  }

  editMedication() {
    if (this.medication) {
      this.router.navigate(['/add-medication', this.medication.id]);
    }
  }

  async confirmDelete() {
    const alert = await this.alertCtrl.create({
      header: 'Hapus Jadwal',
      message: 'Apakah Anda yakin ingin menghapus jadwal obat ini?',
      buttons: [
        {
          text: 'Batal',
          role: 'cancel'
        },
        {
          text: 'Hapus',
          role: 'destructive',
          handler: () => {
            this.deleteMedication();
          }
        }
      ]
    });
    await alert.present();
  }

  async deleteMedication() {
    if (this.medication?.id) {
      await this.medicationService.deleteMedication(this.medication.id);
      this.navCtrl.navigateBack('/tabs/home');
    }
  }

  formatDate(isoString: string) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
