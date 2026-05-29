export interface MedicationLog {
    id: string;             // Unique ID for the log
    medicationId: string;   // ID of the medication
    medicationName: string; // Name of medication at that time
    dosage?: string;        // Dosage at that time
    date: string;           // Date the log relates to (e.g. YYYY-MM-DD or ISO String)
    time: string;           // Scheduled time, e.g. "08:00"
    status: 'TAKEN' | 'SKIPPED';
    loggedAt: string;       // Exact timestamp of when the action was taken
}
