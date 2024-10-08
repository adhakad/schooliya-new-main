import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { Teacher } from 'src/app/modal/teacher.model';
import { ClassService } from 'src/app/services/class.service';

@Component({
  selector: 'app-teacher-permissions',
  templateUrl: './teacher-permissions.component.html',
  styleUrls: ['./teacher-permissions.component.css']
})
export class TeacherPermissionsComponent implements OnInit {
  teacherPermissionForm: FormGroup;
  showModal: boolean = false;
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  teacherInfo: any[] = [];
  recordLimit: number = 0;
  filters: any = {};
  number: number = 0;
  paginationValues: Subject<any> = new Subject();
  page: Number = 0;
  classInfo: any[] = [];
  selectedMarksheetPermissionClass: any[] = [];
  selectedStudentPermissionClass: any[] = [];
  selectedAdmissionPermissionClass: any[] = [];
  selectedFeeCollectionPermissionClass: any[] = [];
  selectedAdmitCardPermissionClass: any[] = [];
  selectedPromoteFailPermissionClass: any[] = [];
  selectedTransferCertificatePermissionClass: any[] = [];
  teacherObjId: string = '';

  loader: Boolean = true;
  adminId!: String
  constructor(private fb: FormBuilder,private adminAuthService: AdminAuthService, private teacherService: TeacherService, private classService: ClassService) {
    this.teacherPermissionForm = this.fb.group({
      _id: [''],
      adminId:this.adminId,
      type: this.fb.group({
        marksheetPermission: this.fb.array([], [Validators.required]),
        admitCardPermission: this.fb.array([], [Validators.required]),
        studentPermission: this.fb.array([], [Validators.required]),
        admissionPermission: this.fb.array([], [Validators.required]),
        feeCollectionPermission: this.fb.array([], [Validators.required]),
        promoteFailPermission: this.fb.array([], [Validators.required]),
        transferCertificatePermission: this.fb.array([], [Validators.required]),
      }),
    });
  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    let load: any = this.getTeacher({ page: 1 });
    this.getClass();
    if (load) {
      setTimeout(() => {
        this.loader = false;
      }, 1000);
    }
  }

  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        let classArray = [];
        for (let i = 0; i < res.length; i++) {
          classArray.push(res[i].class);
        }
        this.classInfo = classArray;
      }
    })
  }

  marksheetPermission(option: any) {
    const index = this.selectedMarksheetPermissionClass.indexOf(option);
    if (index > -1) {
      this.selectedMarksheetPermissionClass.splice(index, 1);
    } else {
      this.selectedMarksheetPermissionClass.push(option)
    }
  }

  studentPermission(option: any) {
    const index = this.selectedStudentPermissionClass.indexOf(option);
    if (index > -1) {
      this.selectedStudentPermissionClass.splice(index, 1);
    } else {
      this.selectedStudentPermissionClass.push(option)
    }
  }

  admissionPermission(option: any) {
    const index = this.selectedAdmissionPermissionClass.indexOf(option);
    if (index > -1) {
      this.selectedAdmissionPermissionClass.splice(index, 1);
    } else {
      this.selectedAdmissionPermissionClass.push(option)
    }
  }
  feeCollectionPermission(option: any) {
    const index = this.selectedFeeCollectionPermissionClass.indexOf(option);
    if (index > -1) {
      this.selectedFeeCollectionPermissionClass.splice(index, 1);
    } else {
      this.selectedFeeCollectionPermissionClass.push(option)
    }
  }
  admitCardPermission(option: any) {
    const index = this.selectedAdmitCardPermissionClass.indexOf(option);
    if (index > -1) {
      this.selectedAdmitCardPermissionClass.splice(index, 1);
    } else {
      this.selectedAdmitCardPermissionClass.push(option)
    }
  }
  promoteFailPermission(option: any) {
    const index = this.selectedPromoteFailPermissionClass.indexOf(option);
    if (index > -1) {
      this.selectedPromoteFailPermissionClass.splice(index, 1);
    } else {
      this.selectedPromoteFailPermissionClass.push(option)
    }
  }
  transferCertificatePermission(option: any) {
    const index = this.selectedTransferCertificatePermissionClass.indexOf(option);
    if (index > -1) {
      this.selectedTransferCertificatePermissionClass.splice(index, 1);
    } else {
      this.selectedTransferCertificatePermissionClass.push(option)
    }
  }

  getTeacher($event: any) {
    this.page = $event.page;
    return new Promise((resolve, reject) => {
      let params: any = {
        filters: {},
        page: $event.page,
        limit: $event.limit ? $event.limit : this.recordLimit,
        adminId:this.adminId,
      };
      this.recordLimit = params.limit;
      if (this.filters.searchText) {
        params["filters"]["searchText"] = this.filters.searchText.trim();
      }

      this.teacherService.teacherPaginationList(params).subscribe((res: any) => {
        if (res) {
          this.teacherInfo = res.teacherList;
          this.number = params.page;
          this.paginationValues.next({ type: 'page-init', page: params.page, totalTableRecords: res.countTeacher });
          return resolve(true);
        }
      });
    });
  }
  falseAllValue() {
    this.selectedMarksheetPermissionClass = [];
    this.selectedStudentPermissionClass = [];
    this.selectedAdmissionPermissionClass = [];
    this.selectedFeeCollectionPermissionClass = [];
    this.selectedAdmitCardPermissionClass = [];
    this.selectedPromoteFailPermissionClass = [];
    this.selectedTransferCertificatePermissionClass = [];
    const controlOne = <FormArray>this.teacherPermissionForm.get('type.marksheetPermission');
    const controlTwo = <FormArray>this.teacherPermissionForm.get('type.studentPermission');
    const controlThree = <FormArray>this.teacherPermissionForm.get('type.admissionPermission');
    const controlFour = <FormArray>this.teacherPermissionForm.get('type.admitCardPermission');
    const controlFive = <FormArray>this.teacherPermissionForm.get('type.feeCollectionPermission');
    const controlSix = <FormArray>this.teacherPermissionForm.get('type.promoteFailPermission');
    const controlSeven = <FormArray>this.teacherPermissionForm.get('type.transferCertificatePermission');
    controlOne.clear();
    controlTwo.clear();
    controlThree.clear();
    controlFour.clear();
    controlFive.clear();
    controlSix.clear();
    controlSeven.clear();
    this.teacherObjId = '';
    this.teacherPermissionForm.reset();

  }

  closeModal() {
    this.falseAllValue();
    this.showModal = false;
    this.errorMsg = '';
  }
  addTeacherPermissionModel(teacher: any) {
    this.showModal = true;
    this.teacherObjId = teacher._id;
    this.teacherPermissionForm.reset();
  }

  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      this.getTeacher({ page: this.page });
    }, 1000)
  }



  patch() {
    const controlOne = <FormArray>this.teacherPermissionForm.get('type.marksheetPermission');
    this.selectedMarksheetPermissionClass.forEach((x: any) => {
      controlOne.push(this.patchMarksheetValues(x))
      this.teacherPermissionForm.reset();
    })
    const controlTwo = <FormArray>this.teacherPermissionForm.get('type.studentPermission');
    this.selectedStudentPermissionClass.forEach((x: any) => {
      controlTwo.push(this.patchStudentValues(x))
      this.teacherPermissionForm.reset();
    })
    const controlThree = <FormArray>this.teacherPermissionForm.get('type.admissionPermission');
    this.selectedAdmissionPermissionClass.forEach((x: any) => {
      controlThree.push(this.patchAdmissionValues(x))
      this.teacherPermissionForm.reset();
    })
    const controlFour = <FormArray>this.teacherPermissionForm.get('type.admitCardPermission');
    this.selectedAdmitCardPermissionClass.forEach((x: any) => {
      controlFour.push(this.patchAdmitCardValues(x))
      this.teacherPermissionForm.reset();
    })
    const controlFive = <FormArray>this.teacherPermissionForm.get('type.feeCollectionPermission');
    this.selectedFeeCollectionPermissionClass.forEach((x: any) => {
      controlFive.push(this.patchFeeCollectionValues(x))
      this.teacherPermissionForm.reset();
    })
    const controlSix = <FormArray>this.teacherPermissionForm.get('type.promoteFailPermission');
    this.selectedPromoteFailPermissionClass.forEach((x: any) => {
      controlSix.push(this.patchPromoteFailValues(x))
      this.teacherPermissionForm.reset();
    })
    const controlSeven = <FormArray>this.teacherPermissionForm.get('type.transferCertificatePermission');
    this.selectedTransferCertificatePermissionClass.forEach((x: any) => {
      controlSeven.push(this.patchTransferCertificateValues(x))
      this.teacherPermissionForm.reset();
    })

  }
  patchMarksheetValues(selectedMarksheetPermissionClass: any) {
    return this.fb.group(
      { [selectedMarksheetPermissionClass]: [selectedMarksheetPermissionClass] }
    )
  }
  patchStudentValues(selectedStudentPermissionClass: any) {
    return this.fb.group(
      { [selectedStudentPermissionClass]: [selectedStudentPermissionClass] }
    )
  }
  patchAdmissionValues(selectedAdmissionPermissionClass: any) {
    return this.fb.group(
      { [selectedAdmissionPermissionClass]: [selectedAdmissionPermissionClass] }
    )
  }
  patchAdmitCardValues(selectedAdmitCardPermissionClass: any) {
    return this.fb.group(
      { [selectedAdmitCardPermissionClass]: [selectedAdmitCardPermissionClass] }
    )
  }
  patchFeeCollectionValues(selectedFeeCollectionPermissionClass: any) {
    return this.fb.group(
      { [selectedFeeCollectionPermissionClass]: [selectedFeeCollectionPermissionClass] }
    )
  }
  patchPromoteFailValues(selectedPromoteFailPermissionClass: any) {
    return this.fb.group(
      { [selectedPromoteFailPermissionClass]: [selectedPromoteFailPermissionClass] }
    )
  }
  patchTransferCertificateValues(selectedTransferCertificatePermissionClass: any) {
    return this.fb.group(
      { [selectedTransferCertificatePermissionClass]: [selectedTransferCertificatePermissionClass] }
    )
  }






  teacherPermissionAdd() {
    this.patch();
    this.teacherPermissionForm.value._id = this.teacherObjId;
    this.teacherPermissionForm.value.adminId = this.adminId;
    this.teacherService.addTeacherPermission(this.teacherPermissionForm.value).subscribe((res: any) => {
      if (res) {
        this.successDone();
        this.successMsg = res;
      }
    }, err => {
      this.errorCheck = true;
      this.errorMsg = err.error;
    })
  }

  changeStatus(id: any, statusValue: any) {
    if (id) {
      let params = {
        id: id,
        statusValue: statusValue,
      }
      this.teacherService.changeStatus(params).subscribe((res: any) => {
        if (res) {
          this.getTeacher({ page: this.page });
        }
      })
    }
  }
}
