import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { SchoolService } from 'src/app/services/school.service';
import { ClassService } from 'src/app/services/class.service';

@Component({
  selector: 'app-admin-student-fees-structure',
  templateUrl: './admin-student-fees-structure.component.html',
  styleUrls: ['./admin-student-fees-structure.component.css']
})
export class AdminStudentFeesStructureComponent implements OnInit {
  disabled = true;
  cls: number = 0;
  feesForm: FormGroup;
  showModal: boolean = false;
  showFeesStructureModal: boolean = false
  deleteMode: boolean = false;
  updateMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
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
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  sessions: any;
  schoolInfo: any;
  loader: Boolean = true;
  adminId!: string;
  session: string = '';
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private classService: ClassService, private feesStructureService: FeesStructureService) {
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
    this.getSchool();
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.getClass();
    this.getFeesStructureByClass();
    this.allOptions();
    this.loader = false;
  }
  getSchool() {
    this.schoolService.getSchool(this.adminId).subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }


  filterSession(session: any) {
    this.errorCheck = true;
    this.errorMsg = '';
    this.session = session;
    if (this.session !== '') {
      this.feesForm.get('session')?.setValue(session);
    }
  }
  chooseClass(cls: any) {
    this.errorCheck = true;
    this.errorMsg = '';
    this.cls = cls;
    if (cls !== 11 && cls !== 12) {
      this.stream = this.notApplicable;
      this.feesForm.get('class')?.setValue(cls);
      this.feesForm.get('stream')?.setValue("N/A");
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


  getFeesStructureByClass() {
    let params = {
      adminId: this.adminId,
    }
    this.feesStructureService.feesStructureByClass(params).subscribe((res: any) => {
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
    if (this.session == '') {
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

  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      this.getFeesStructureByClass();
    }, 1000)
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
          this.successDone();
          this.successMsg = res;
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
        this.successDone();
        this.getFeesStructureByClass();
        this.successMsg = res;
        this.deleteById = '';
      }
    })
  }

  allOptions() {
    this.sessions = [{ year: '2023-2024' }, { year: '2024-2025' }, { year: '2025-2026' }, { year: '2026-2027' }, { year: '2027-2028' }, { year: '2028-2029' }, { year: '2029-2030' }]
  }

}
