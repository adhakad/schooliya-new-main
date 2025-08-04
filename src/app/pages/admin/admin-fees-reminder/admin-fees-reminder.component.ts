import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { SchoolService } from 'src/app/services/school.service';
import { AcademicSessionService } from 'src/app/services/academic-session.service';
import { ClassService } from 'src/app/services/class.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-admin-fees-reminder',
  templateUrl: './admin-fees-reminder.component.html',
  styleUrls: ['./admin-fees-reminder.component.css']
})
export class AdminFeesReminderComponent implements OnInit {
  disabled = true;
  cls: number = 0;
  feesForm: FormGroup;
  showModal: boolean = false;
  showFeesStructureModal: boolean = false
  deleteMode: boolean = false;
  updateMode: boolean = false;
  deleteById: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;

  totalFees: number = 0;

  selectedFeesType: any[] = [];
  feesTypeMode: boolean = false;
  feesMode: boolean = false;
  clsFeesStructure: any;
  particularsAdmissionFees: any[] = [];
  singleFessStructure: any;
  feePerticulars: any[] = ['Registration', 'Tution', 'Books', 'Uniform', 'Examination', 'Sports', 'Library', 'Transport'];
  classInfo: any[] = [];
  stream: string = '';
  notApplicable: string = "stream";
  streamMainSubject: any[] = ['mathematics(science)', 'biology(science)', 'history(arts)', 'sociology(arts)', 'political science(arts)', 'accountancy(commerce)', 'economics(commerce)', 'agriculture', 'home science'];
  schoolInfo: any;
  loader: Boolean = true;
  adminId!: string;
  academicSession: string = '';
  allSession: any = [];
  selectedSession: string = '';
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private toastr: ToastrService, private academicSessionService: AcademicSessionService, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private classService: ClassService, private feesStructureService: FeesStructureService) {
    this.feesForm = this.fb.group({
      adminId: [''],
      session: [''],
      class: [''],
      stream: [''],
      admissionFees: ['', Validators.required],
      type: this.fb.group({
        feesType: this.fb.array([], [Validators.required]),
      }),
    });
  }

  ngOnInit(): void {
    // this.getSchool();
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.getAcademicSession();
    this.getClass();
    // this.getFeesStructureByClass();
    this.loader = false;
  }
  // getSchool() {
  //   this.schoolService.getSchool(this.adminId).subscribe((res: any) => {
  //     if (res) {
  //       this.schoolInfo = res;
  //     }
  //   })
  // }
  getAcademicSession() {
    this.academicSessionService.getAcademicSession().subscribe((res: any) => {
      if (res) {
        this.selectedSession = res.academicSession;
        this.allSession = res.allSession;
        this.getFeesStructureBySession(this.adminId, this.selectedSession);
      }
    })
  }
  onChange(event: MatRadioChange) {
    this.selectedSession = event.value;
    this.getFeesStructureBySession(this.adminId, event.value);
  }
  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }


  filterSession(selectedSession: any) {
    this.errorCheck = true;
    this.errorMsg = '';
    this.selectedSession = selectedSession;
    this.getFeesStructureBySession(this.adminId, selectedSession);
  }
  chooseClass(cls: any) {
    this.errorCheck = true;
    this.errorMsg = '';
    this.cls = cls;
    if (cls !== 11 && cls !== 12) {
      this.stream = this.notApplicable;
      this.feesForm.get('class')?.setValue(cls);
      this.feesForm.get('stream')?.setValue("n/a");
    }
    if (cls == 11 || cls == 12) {
      this.feesForm.get('class')?.setValue(cls);
      if (this.stream == 'stream') {
        this.stream = '';
      }
    }
  }
  filterStream(stream: any) {
    this.errorCheck = true;
    this.errorMsg = '';
    this.stream = stream;
    if (stream && this.cls) {
      this.feesForm.get('stream')?.setValue(stream);
    }
  }


  getFeesStructureBySession(adminId: string, session: string) {
    let params = {
      adminId: adminId,
      session: session
    }
    this.feesStructureService.feesStructureBySession(params).subscribe((res: any) => {
      if (res) {
        this.errorMsg = '';
        this.clsFeesStructure = res;
      }
    }, err => {
      this.errorMsg = err.error;
    })
  }

  addFeesModel() {
    this.showModal = true;
    this.feesTypeMode = true;
  }
  openFeesStructureModal(singleFessStructure: any) {
    this.singleFessStructure = singleFessStructure;
    this.particularsAdmissionFees = [{ Admission: singleFessStructure.admissionFees }, ...singleFessStructure.feesType];
    this.showFeesStructureModal = true;
  }
  selectFeesStructure() {
    if (this.selectedSession == '') {
      this.errorCheck = true;
      this.errorMsg = 'Session is required';
      return;
    }
    if (this.cls == 0) {
      this.errorCheck = true;
      this.errorMsg = 'Class is required';
      return;
    }
    if (this.stream == '') {
      this.errorCheck = true;
      this.errorMsg = 'Stream is required';
      return;
    }
    this.feesTypeMode = false;
    this.feesMode = true;
    this.patch();
  }

  falseAllValue() {
    this.totalFees = 0;
    this.selectedFeesType = [];
    const controlOne = <FormArray>this.feesForm.get('type.feesType');
    controlOne.clear();
    this.feesTypeMode = false;
    this.feesMode = false;

  }

  closeModal() {
    this.falseAllValue();
    this.showModal = false;
    this.deleteMode = false;
    this.errorMsg = '';
    this.errorCheck = false
    this.particularsAdmissionFees = [];
    this.showFeesStructureModal = false;
    this.feesForm.reset();
  }
  deleteFeesStructureModel(id: String) {
    this.showModal = true;
    this.deleteMode = true;
    this.deleteById = id;
  }

  successDone(msg: any) {
    this.getFeesStructureBySession(this.adminId, this.selectedSession);
    this.closeModal();
    setTimeout(() => {
      this.toastr.success('', msg);
    }, 500)
  }


  feesType(option: any) {
    const index = this.selectedFeesType.indexOf(option);
    if (index > -1) {
      this.selectedFeesType.splice(index, 1);
    } else {
      this.selectedFeesType.push(option)
    }
  }

  patch() {
    const controlOne = <FormArray>this.feesForm.get('type.feesType');
    this.selectedFeesType.forEach((x: any) => {
      controlOne.push(this.patchFeesTypeValues(x))
    })
  }

  patchFeesTypeValues(selectedFeesType: any) {
    return this.fb.group({
      [selectedFeesType]: ['', Validators.required]
    })
  }

  feesStructureAddUpdate() {
    this.feesForm.value.adminId = this.adminId;
    this.feesForm.value.session = this.selectedSession;
    this.feesForm.value.totalFees = this.totalFees;
    let feesTypeObj = this.feesForm.value.type.feesType;
    let containsFeesTypeNull = feesTypeObj.some((item: any) => Object.values(item).includes(null));
    if (containsFeesTypeNull) {
      this.errorCheck = true;
      this.errorMsg = 'Please fill all fields';
    }
    if (!containsFeesTypeNull) {
      this.feesStructureService.addFeesStructure(this.feesForm.value).subscribe((res: any) => {
        if (res) {
          this.successDone(res);
        }
      }, err => {
        this.errorCheck = true;
        this.errorMsg = err.error;
      })
    }

  }
  feesStructureDelete(id: String) {
    this.feesStructureService.deleteFeesStructure(id).subscribe((res: any) => {
      if (res) {
        this.getFeesStructureBySession(this.adminId, this.selectedSession);
        this.successDone(res);
        this.deleteById = '';
      }
    }, err => {
      this.errorCheck = true;
      this.errorMsg = err.error;
    })
  }

}
