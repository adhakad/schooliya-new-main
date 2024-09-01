import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { StudentService } from 'src/app/services/student.service';
import { ClassService } from 'src/app/services/class.service';
import { MatRadioChange } from '@angular/material/radio';
import { ExcelService } from 'src/app/services/excel/excel.service';
import { SchoolService } from 'src/app/services/school.service';
import { HttpClient } from '@angular/common/http';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { IssuedTransferCertificateService } from 'src/app/services/issued-transfer-certificate.service';
import { TeacherAuthService } from 'src/app/services/auth/teacher-auth.service';
import { TeacherService } from 'src/app/services/teacher.service';


@Component({
  selector: 'app-teacher-student-promote-fail',
  templateUrl: './teacher-student-promote-fail.component.html',
  styleUrls: ['./teacher-student-promote-fail.component.css']
})
export class TeacherStudentPromoteFailComponent implements OnInit {
  @ViewChild('content') content!: ElementRef;
  studentClassPromoteForm: FormGroup;
  showClassPromoteModal: boolean = false;
  showStudentInfoViewModal: boolean = false;
  showStudentTCModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  statusCode: Number = 0;
  classInfo: any[] = [];
  studentInfo: any[] = [];
  studentInfoByClass: any[] = [];
  recordLimit: number = 10;
  filters: any = {};
  number: number = 0;
  paginationValues: Subject<any> = new Subject();
  page: Number = 0;
  selectedValue: number = 0;

  sessions: any;
  categorys: any;
  religions: any;
  qualifications: any;
  occupations: any;
  mediums: any;
  stream: string = '';
  notApplicable: String = "stream";
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  cls: number = 0;
  className: any;
  admissionType: string = '';
  schoolInfo: any;
  bulkStudentRecord: any;
  fileChoose: boolean = false;
  promotedClass: any;
  singleStudentInfo: any
  singleStudentTCInfo: any
  classSubject: any[] = [];
  serialNo!: number;
  isDate: string = '';
  readyTC: Boolean = false;
  baseURL!: string;
  teacherInfo:any;
  createdBy: String = '';
  adminId!: String
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute,private teacherAuthService: TeacherAuthService,private teacherService: TeacherService, private schoolService: SchoolService, public ete: ExcelService, private adminAuthService: AdminAuthService, private issuedTransferCertificate: IssuedTransferCertificateService, private classService: ClassService, private classSubjectService: ClassSubjectService, private studentService: StudentService) {
    this.studentClassPromoteForm = this.fb.group({
      _id: ['', Validators.required],
      session: ['', Validators.required],
      admissionNo: ['', Validators.required],
      adminId: [''],
      class: [''],
      stream: [''],
      rollNumber: ['', Validators.required],
      discountAmountInFees: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      createdBy: ['']
    })

  }

  ngOnInit(): void {
    this.teacherInfo = this.teacherAuthService.getLoggedInTeacherInfo();
    this.adminId = this.teacherInfo?.adminId;
    if (this.teacherInfo) {
      this.getTeacherById(this.teacherInfo)
    }
    this.getSchool();
    this.allOptions();
    var currentURL = window.location.href;
    this.baseURL = new URL(currentURL).origin;
  }
  
  getTeacherById(teacherInfo: any) {
    let params = {
      adminId: teacherInfo.adminId,
      teacherUserId: teacherInfo.id,
    }
    this.teacherService.getTeacherById(params).subscribe((res: any) => {
      if (res) {
        this.classInfo = res.promoteFailPermission.classes;
        this.createdBy = `${res.name} (${res.teacherUserId})`;
      }

    })
  }

  getSchool() {
    this.schoolService.getSchool(this.adminId).subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  chooseClass(cls: any) {
    this.page = 0;
    this.className = cls;
    this.cls = cls;
    this.stream = '';
    this.studentInfo = [];
  }
  filterStream(stream: any) {
    this.stream = stream;
    if (stream && this.cls) {
      let params = {
        adminId: this.adminId,
        cls: this.cls,
        stream: stream,
      }
      this.getStudents({ page: 1 });
    }
  }
  chooseStream(event: any) {
    this.stream = event.value;
  }

  onChange(event: MatRadioChange) {
    this.selectedValue = event.value;
  }
  closeModal() {
    this.showClassPromoteModal = false;
    this.showStudentInfoViewModal = false;
    this.showStudentTCModal = false;
    this.updateMode = false;
    this.deleteMode = false;
    this.errorCheck = false;
    this.errorMsg = '';
    this.successMsg = '';
    this.classSubject = [];
    this.promotedClass;
    this.singleStudentInfo;
    this.singleStudentTCInfo;
    this.studentClassPromoteForm.reset();
  }
  
  
  addStudentClassPromoteModel(student: any) {
    this.showClassPromoteModal = true;
    this.singleStudentInfo = student;
    this.studentClassPromoteForm.patchValue(student);
    this.studentClassPromoteForm.get('stream')?.setValue(this.stream);
    this.studentClassPromoteForm.get('discountAmountInFees')?.setValue(null);
  }
  addStudentInfoViewModel(student: any) {
    this.showStudentInfoViewModal = true;
    this.singleStudentInfo = student;
  }
  addStudentTCModel(student: any) {
    this.showStudentTCModal = true;
    this.singleStudentInfo = student;
    let stream: String = student.stream;
    if (stream == "N/A") {
      stream = this.notApplicable;
    }
    let params = {
      cls: student.class,
      stream: stream,
      adminId: this.adminId,
    }
    this.getSingleClassSubjectByStream(params);
  }
  updateStudentModel(student: any) {
    this.deleteMode = false;
    this.updateMode = true;
  }
  deleteStudentModel(id: String) {
    this.updateMode = false;
    this.deleteMode = true;
    this.deleteById = id;
  }
  getSingleClassSubjectByStream(params: any) {
    this.classSubjectService.getSingleClassSubjectByStream(params).subscribe((res: any) => {
      if (res) {
        this.classSubject = res.subject;
      }
      if (!res) {
        this.classSubject = [];
      }
    })
  }
  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      this.getStudents({ page: this.page });
    }, 1000)
  }

  getStudentByClass(cls: any) {
    let params = {
      class: cls,
      stream: this.stream,
      adminId: this.adminId,
    }
    this.studentService.getStudentByClass(params).subscribe((res: any) => {
      if (res) {
        this.studentInfoByClass = res;
        const classMappings: any = {
          200: "Nursery",
          201: "LKG",
          202: "UKG",
          1: "1st",
          2: "2nd",
          3: "3rd",
        };
        for (let i = 4; i <= 12; i++) {
          classMappings[i] = i + "th";
        }
        this.studentInfoByClass.forEach((student) => {
          student.class = classMappings[student.class] || "Unknown";
          student.admissionClass = classMappings[student.admissionClass] || "Unknown";
        });
      }
    })
  }
  getStudents($event: any) {
    this.page = $event.page
    return new Promise((resolve, reject) => {
      let params: any = {
        filters: {},
        page: $event.page,
        limit: $event.limit ? $event.limit : this.recordLimit,
        adminId: this.adminId,
        class: this.className,
        stream: this.stream,
      };
      this.recordLimit = params.limit;
      if (this.filters.searchText) {
        params["filters"]["searchText"] = this.filters.searchText.trim();
      }

      this.studentService.studentPaginationList(params).subscribe((res: any) => {
        if (res) {
          this.errorCheck = false;
          this.statusCode = 200;
          this.studentInfo = res.studentList;
          this.serialNo = res.serialNo;
          this.isDate = res.isDate;
          this.number = params.page;
          this.paginationValues.next({ type: 'page-init', page: params.page, totalTableRecords: res.countStudent });
          return resolve(true);
        }
      }, err => {
        this.errorCheck = true;
        this.statusCode = err.status;
      });
    });
  }

  

  
  allOptions() {
    this.sessions = [{ year: '2023-2024' }, { year: '2024-2025' }, { year: '2025-2026' }, { year: '2026-2027' }, { year: '2027-2028' }, { year: '2028-2029' }, { year: '2029-2030' }]
    this.categorys = [{ category: 'General' }, { category: 'OBC' }, { category: 'SC' }, { category: 'ST' }, { category: 'Other' }]
    this.religions = [{ religion: 'Hinduism' }, { religion: 'Buddhism' }, { religion: 'Christanity' }, { religion: 'Jainism' }, { religion: 'Sikhism' }, { religion: 'Muslim' }, { religion: 'Other' }]
    this.qualifications = [{ qualification: 'Doctoral Degree' }, { qualification: 'Masters Degree' }, { qualification: 'Graduate Diploma' }, { qualification: 'Graduate Certificate' }, { qualification: 'Graduate Certificate' }, { qualification: 'Bachelor Degree' }, { qualification: 'Advanced Diploma' }, { qualification: 'Primary School' }, { qualification: 'High School' }, { qualification: 'Higher Secondary School' }, { qualification: 'Illiterate' }, { qualification: 'Other' }]
    this.occupations = [{ occupation: 'Agriculture(Farmer)' }, { occupation: 'Laborer' }, { occupation: 'Self Employed' }, { occupation: 'Private Job' }, { occupation: 'State Govt. Employee' }, { occupation: 'Central Govt. Employee' }, { occupation: 'Military Job' }, { occupation: 'Para-Military Job' }, { occupation: 'PSU Employee' }, { occupation: 'Other' }]
    this.mediums = [{ medium: 'Hindi' }, { medium: 'English' }]
  }

  studentClassPromote() {
    if (this.studentClassPromoteForm.valid) {
      this.studentClassPromoteForm.value.adminId = this.adminId;
      this.studentClassPromoteForm.value.class = this.createdBy
      this.studentService.studentClassPromote(this.studentClassPromoteForm.value).subscribe((res: any) => {
        if (res) {
          setTimeout(() => {
            this.successDone();
          }, 1000)
          this.promotedClass;
          this.promotedClass = res.className;
          this.successMsg = res.successMsg;
        }
      }, err => {
        this.errorCheck = true;
        this.promotedClass;
        if (err.error.className) {
          this.promotedClass = parseInt(err.error.className);
        }
        this.errorMsg = err.error.errorMsg;
      })
    }
  }
  


  // studentClassPromote() {
  //   if (this.studentClassPromoteForm.valid) {
  //     this.studentClassPromoteForm.value.class = parseInt(this.className);
  //     this.studentService.studentClassPromote(this.studentClassPromoteForm.value).subscribe((res: any) => {
  //       if (res) {
  //         setTimeout(() => {
  //           this.successDone();
  //         }, 2000)
  //         this.promotedClass;
  //         this.promotedClass = res.className;
  //         this.successMsg = res.successMsg;
  //       }
  //     }, err => {
  //       this.errorCheck = true;
  //       this.promotedClass;
  //       if (err.error.className) {
  //         this.promotedClass = parseInt(err.error.className);
  //       }
  //       this.errorMsg = err.error.errorMsg;
  //     })
  //   }
  // }
}
