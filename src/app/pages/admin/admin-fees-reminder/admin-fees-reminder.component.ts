import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ClassService } from 'src/app/services/class.service';
import { ReminderService } from 'src/app/services/reminder.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-admin-fees-reminder',
  templateUrl: './admin-fees-reminder.component.html',
  styleUrls: ['./admin-fees-reminder.component.css']
})
export class AdminFeesReminderComponent implements OnInit {
  @ViewChild('receipt') receipt!: ElementRef;
  public baseUrl = environment.API_URL;
  feeReminderForm: FormGroup;
  showModal: boolean = false;
  showAdmissionPrintModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  academicSession!: string;
  allSession: any = [];
  classInfo: any[] = [];
  studentInfo: any[] = [];
  recordLimit: number = 10;
  filters: any = {};
  number: number = 0;
  paginationValues: Subject<any> = new Subject();
  page: Number = 0;

  sessions: any;
  categorys: any;
  religions: any;
  qualifications: any;
  occupations: any;
  stream: string = '';
  mediums: any;
  // notApplicable: String = "stream";
  streamMainSubject: any[] = ['mathematics(science)', 'biology(science)', 'history(arts)', 'sociology(arts)', 'political science(arts)', 'accountancy(commerce)', 'economics(commerce)', 'agriculture', 'home science'];
  cls: number = 0;
  clsFeesStructure: any;
  schoolInfo: any;
  admissionrReceiptInfo: any;
  singleStudentInfo: any;
  receiptMode: boolean = false;
  studentFeesCollection: any;
  baseURL!: string;
  loader: Boolean = true;
  adminId!: String
  constructor(private fb: FormBuilder, private toastr: ToastrService, private adminAuthService: AdminAuthService, private classService: ClassService, private reminderService: ReminderService) {
    this.feeReminderForm = this.fb.group({
      _id: [''],
      adminId: [''],
      class: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      stream: ['', Validators.required],
      minPercentage: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      lastPaymentDays: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      lastReminderDays: ['', [Validators.required, Validators.pattern(/^\d+$/)]]

    })
  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.getClass();
    var currentURL = window.location.href;
    this.baseURL = new URL(currentURL).origin;
  }
  chooseClass(cls: any) {
    this.errorCheck = false;
    this.errorMsg = '';
    this.cls = 0;
    this.clsFeesStructure = {};
    this.cls = cls;
    if (cls < 11 && cls !== 0 || cls == 200 || cls == 201 || cls == 202) {
      this.feeReminderForm.get('stream')?.setValue("n/a");
      this.stream = '';
      this.stream = 'stream';
    }
  }
  chooseStream(stream: any) {
    this.stream = '';
    this.stream = stream;
  }

  closeModal() {
    this.showModal = false;
    this.stream = '';
    this.cls = 0;
    this.feeReminderForm.reset();
  }
  addStudentModel() {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = false;
    this.feeReminderForm.reset();
  }

  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }
  successDone(msg: any) {
    this.closeModal();
    setTimeout(() => {
      this.toastr.success('', msg);
    }, 500)
  }

  studentAddUpdate() {
    if (this.feeReminderForm.valid) {
      this.feeReminderForm.value.adminId = this.adminId;
      this.reminderService.addFeesReminder(this.feeReminderForm.value).subscribe((res: any) => {
        if (res) {
          this.successDone(res);
        }
      }, err => {
        this.errorCheck = true;
        this.errorMsg = err.error;
      })
    }
  }
}
