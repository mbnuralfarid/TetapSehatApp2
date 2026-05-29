import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MedicationService } from '../../services/medication.service';
import { Medication } from '../../models/medication.model';
import { NavController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-add-medication',
  templateUrl: './add-medication.page.html',
  styleUrls: ['./add-medication.page.scss'],
  standalone: false
})
export class AddMedicationPage implements OnInit {
  medicationForm: FormGroup;
  medicationId: string | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private medicationService: MedicationService,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {
    this.medicationForm = this.fb.group({
      name: ['', Validators.required],
      dosage: [''],
      startDate: [new Date().toISOString(), Validators.required],
      endDate: [new Date().toISOString(), Validators.required],
      times: this.fb.array([
        this.createTimeControl()
      ])
    });
  }

  get times() {
    return this.medicationForm.get('times') as FormArray;
  }

  createTimeControl(time?: string) {
    if (!time) {
      const now = new Date();
      time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    return this.fb.control(time, Validators.required);
  }

  addTime() {
    this.times.push(this.createTimeControl());
  }

  removeTime(index: number) {
    if (this.times.length > 1) {
      this.times.removeAt(index);
    }
  }

  async ngOnInit() {
    this.medicationId = this.route.snapshot.paramMap.get('id');
    if (this.medicationId) {
      this.isEditMode = true;
      const med = await this.medicationService.getMedicationById(this.medicationId);
      if (med) {
        this.medicationForm.patchValue({
          name: med.name,
          dosage: med.dosage,
          startDate: med.startDate,
          endDate: med.endDate
        });

        while (this.times.length) {
          this.times.removeAt(0);
        }

        med.times.forEach(t => {
          this.times.push(this.createTimeControl(t));
        });
      }
    }
  }

  async save() {
    if (this.medicationForm.valid) {
      const formValue = this.medicationForm.value;
      const timeValues = formValue.times.map((t: string) => {
        if (t.includes('T')) {
          const date = new Date(t);
          return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        return t;
      });

      const medication: Medication = {
        id: this.medicationId || Date.now().toString(),
        name: formValue.name,
        dosage: formValue.dosage,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        times: timeValues
      };

      await this.medicationService.addOrUpdateMedication(medication);

      const toast = await this.toastCtrl.create({
        message: 'Jadwal obat berhasil disimpan',
        duration: 2000,
        color: 'success'
      });
      await toast.present();

      this.navCtrl.navigateBack('/tabs/home');
    }
  }
}
