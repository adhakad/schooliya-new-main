import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { read, utils, writeFile } from 'xlsx';
import * as ExcelJS from 'exceljs';
import { Subject } from 'rxjs';
import { StudentService } from 'src/app/services/student.service';
import { ClassService } from 'src/app/services/class.service';
import { MatRadioChange } from '@angular/material/radio';
import { ExcelService } from 'src/app/services/excel/excel.service';
import { SchoolService } from 'src/app/services/school.service';
import { HttpClient } from '@angular/common/http';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { IssuedTransferCertificateService } from 'src/app/services/issued-transfer-certificate.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';



@Component({
  selector: 'app-transfer-certificate',
  templateUrl: './transfer-certificate.component.html',
  styleUrls: ['./transfer-certificate.component.css']
})
export class TransferCertificateComponent implements OnInit {
  @ViewChild('content') content!: ElementRef;
  public baseUrl = environment.API_URL;
  tcForm: FormGroup;
  showStudentInfoViewModal: boolean = false;
  showStudentTCFormModal: boolean = false;
  showStudentTCPrintModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  statusCode: Number = 0;
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
  notApplicable: string = "stream";
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  cls: number = 0;
  classInfo: any[] = [];
  admissionType: string = '';
  schoolInfo: any;
  bulkStudentRecord: any;
  fileChoose: boolean = false;
  loader: Boolean = true;
  promotedClass: any;
  singleStudentInfo: any
  singleStudentTCInfo: any
  classSubject: any[] = [];
  serialNo!: number;
  isDate: string = '';
  readyTC: Boolean = false;
  adminId!: String
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private router: Router, private toastr: ToastrService, private printPdfService: PrintPdfService, private schoolService: SchoolService, public ete: ExcelService, private adminAuthService: AdminAuthService, private issuedTransferCertificate: IssuedTransferCertificateService, private classService: ClassService, private classSubjectService: ClassSubjectService, private studentService: StudentService) {
    this.tcForm = this.fb.group({
      adminId: [''],
      lastExamStatus: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      reasonForLeaving: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      totalWorkingDays: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      totalPresenceDays: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      generalConduct: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      anyOtherRemarks: ['',],
    })
  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.loader = false;
    this.getSchool();
    this.getClass();
    this.allOptions();
    this.activatedRoute.queryParams.subscribe((params) => {
      this.cls = +params['cls'] || 0;
      this.stream = params['stream'] || '';
      if (this.cls) {
        this.getStudents({ page: 1 });
      } else {
        this.cls = 0;
        this.stream = '';
        this.studentInfo = [];
      }
    });
  }
  getSchool() {
    this.schoolService.getSchool(this.adminId).subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  chooseClass(cls: number) {
    this.cls = cls;
    if (cls !== 11 && cls !== 12) {
      this.stream = this.notApplicable;
      this.studentInfo = [];
      this.updateRouteParams();
      this.getStudents({ page: 1 });
    }
    if (cls == 11 || cls == 12) {
      if (this.stream == 'stream') {
        this.stream = '';
      }
      this.studentInfo = [];
      this.updateRouteParams();
      this.getStudents({ page: 1 });
    }
  }
  filterStream(stream: any) {
    this.stream = stream;
    if (stream && this.cls) {
      this.studentInfo = [];
      this.updateRouteParams();
      this.getStudents({ page: 1 });
    }
  }
  updateRouteParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { cls: this.cls || null, stream: this.stream || null }, // Reset parameters if cls or stream is null
      queryParamsHandling: 'merge' // Keep other query params
    });
  }

  onChange(event: MatRadioChange) {
    this.selectedValue = event.value;
  }

  printStudentData(singleStudentInfo: any) {

    singleStudentInfo.serialNo = this.serialNo;
    this.issuedTransferCertificate.createTransferCertificate(singleStudentInfo).subscribe((res: any) => {
      if (res.IssueTransferCertificate == 'IssueTransferCertificate') {
        const printContent = this.getPrintOneAdmitCardContent();
        this.printPdfService.printContent(printContent);
        this.closeModal();
        this.getStudents({ page: this.page });
        setTimeout(() => {
          this.toastr.success('',res.successMsg);
        }, 500)
      }
    }, err => {
      this.errorCheck = true;
      this.errorMsg = err.error;
    })
  }



  private getPrintOneAdmitCardContent(): string {
    let schoolName = this.schoolInfo.schoolName;
    let city = this.schoolInfo.city;
    let printHtml = '<html>';
    printHtml += '<head>';
    printHtml += '<style>';
    printHtml += '@page { size: A3; margin: 10mm; }';
    printHtml += 'body {width: 100%; height: 100%; margin: 0; padding: 0; }';
    printHtml += 'div {margin: 0; padding: 0;}';
    printHtml += '.custom-container {font-family: Arial, sans-serif;overflow: auto; width: 100%; height: auto; box-sizing: border-box;}';
    printHtml += '.table-container {width: 100%;height: auto; background-color: #fff;border: 2px solid #707070; box-sizing: border-box;}';
    printHtml += '.logo { height: 95px;margin-top:15px;margin-left:10px;}';
    printHtml += '.school-name {display: flex; align-items: center; justify-content: center; text-align: center; }';
    printHtml += '.school-name h3 { color: #0a0a0a !important; font-size: 26px !important;font-weight: bolder;margin-top:-140px !important; margin-bottom: 0 !important; }';

    printHtml += '.address{margin-top: -45px;}';
    printHtml += '.address p{color: #0a0a0a !important;font-size:18px;margin-top: -15px !important;}';
    printHtml += '.title-lable {text-align: center;margin-top: 0px;margin-bottom: 0;}';
    printHtml += '.title-lable p {color: #0a0a0a !important;font-size: 22px;font-weight: bold;letter-spacing: .5px;}';
    printHtml += '.info-table {width:100%;color: #0a0a0a !important;border: none;font-size: 18px;margin-top: 1.20vh;margin-bottom: 1vh;display: inline-table;}';
    printHtml += '.table-container .info-table th, .table-container .info-table td{color: #0a0a0a !important;text-align:left;padding-left:15px;padding-top:5px;padding-bottom:5px;}';
    printHtml += '.custom-table {width: 100%;color: #0a0a0a !important;border-collapse:collapse;margin-bottom: 20px;display: inline-table;border-radius:5px}';
    printHtml += '.custom-table th{min-height: 48px;text-align: center;border:1px solid #707070;line-height:25px;font-size: 18px;}';
    printHtml += '.custom-table tr{height: 48px;}';
    printHtml += '.custom-table td {text-align: center;border:1px solid #707070;font-size: 18px;}';
    printHtml += '.tc-codes-table {width: 100%;color: #252525 !important;display: inline-table;margin-top: 2vh;}';
    printHtml += '.tc-codes-table tr{height: 2vh;border:none;}';
    printHtml += '.tc-codes-table td {width:50%;border:none;font-size: 18px !important;}';
    printHtml += '.tc-codes-table td p{margin-left: 20px;margin-right: 20px;}';

    printHtml += '.student-info-table {width: 100%;color: #252525 !important;display: inline-table;margin-top:3vh}';
    printHtml += '.student-info-table tr{height: 2.5vh;border:none;}';
    printHtml += '.student-info-table .td-left {width:45%;border:none;font-size: 12px;}';
    printHtml += '.student-info-table .td-right {width:55%;border:none;font-size: 12px;}';
    printHtml += '.student-info-table td p{margin-left: 20px;}';
    printHtml += '.sign-table {position: relative;margin-top:120px;margin-bottom:120px;left: 0;bottom: 0;z-index: 2;}';

    printHtml += '.text-bold { font-weight: bold;}';
    printHtml += '.text-left { text-align: left;}';
    printHtml += '.text-right { text-align: right;}';
    printHtml += 'p {color: #252525 !important;font-size:18px;}'
    printHtml += 'h4 {color: #252525 !important;}'
    // printHtml += '@media print {';
    // printHtml += '  body::after {';
    // printHtml += `    content: "${schoolName}, ${city}";`;
    // printHtml += '    position: fixed;';
    // printHtml += '    top: 50%;';
    // printHtml += '    left: 25%;';
    // printHtml += '    font-size: 30px;';
    // printHtml += '    text-transform: uppercase;';
    // printHtml += '    font-weight: bold;';
    // printHtml += '    font-family: Arial, sans-serif;';
    // printHtml += '    text-align: center;';
    // printHtml += '    color: rgba(50, 48, 65, 0.2);';
    // printHtml += '    transform:';
    // printHtml += '    pointer-events: none;';
    // printHtml += '  }';
    // printHtml += '}';
    printHtml += '</style>';
    printHtml += '</head>';
    printHtml += '<body>';

    const studentElement = document.getElementById(`student`);
    if (studentElement) {
      printHtml += studentElement.outerHTML;
    }
    printHtml += '</body></html>';
    return printHtml;
  }















  closeModal() {
    this.showStudentInfoViewModal = false;
    this.showStudentTCFormModal = false;
    this.showStudentTCPrintModal = false;
    this.updateMode = false;
    this.deleteMode = false;
    this.fileChoose = false;
    this.errorCheck = false;
    this.readyTC = false;
    this.errorMsg = '';
    this.classSubject = [];
    this.promotedClass;
    this.singleStudentInfo;
    this.singleStudentTCInfo;
    this.tcForm.reset();
  }

  addStudentInfoViewModel(student: any) {
    this.showStudentInfoViewModal = true;
    this.singleStudentInfo = student;
  }
  addStudentTCModel(student: any) {
    this.showStudentTCFormModal = true;
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
  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res.map((item: any) => item.class);
      }
    })
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
  successDone(msg: any) {
    this.closeModal();
    this.getStudents({ page: this.page });
    setTimeout(() => {
      this.toastr.success('',msg);
    }, 500)
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
        class: this.cls,
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
    this.religions = [{ religion: 'Hinduism' }, { religion: 'Buddhism' }, { religion: 'Christanity' }, { religion: 'Jainism' }, { religion: 'Sikhism' }, { religion: 'Aninism / Adivasi' }, { religion: 'Islam' }, { religion: 'Baha I faith ' }, { religion: 'Judaism' }, { religion: 'Zoroastrianism' }, { religion: 'Other' }]
    this.qualifications = [{ qualification: 'Doctoral Degree' }, { qualification: 'Masters Degree' }, { qualification: 'Graduate Diploma' }, { qualification: 'Graduate Certificate' }, { qualification: 'Graduate Certificate' }, { qualification: 'Bachelor Degree' }, { qualification: 'Advanced Diploma' }, { qualification: 'Primary School' }, { qualification: 'High School' }, { qualification: 'Higher Secondary School' }, { qualification: 'Illiterate' }, { qualification: 'Other' }]
    this.occupations = [{ occupation: 'Agriculture(Farmer)' }, { occupation: 'Laborer' }, { occupation: 'Self Employed' }, { occupation: 'Private Job' }, { occupation: 'State Govt. Employee' }, { occupation: 'Central Govt. Employee' }, { occupation: 'Military Job' }, { occupation: 'Para-Military Job' }, { occupation: 'PSU Employee' }, { occupation: 'Other' }]
    this.mediums = [{ medium: 'Hindi' }, { medium: 'English' }]
  }
  getTC() {
    this.errorCheck = false;
    this.errorMsg = '';
    if (this.tcForm.valid && this.singleStudentInfo) {
      this.singleStudentInfo.isDate = this.isDate;
      this.tcForm.value.adminId = this.adminId;
      if (this.tcForm.value.totalWorkingDays > 365) {
        this.errorCheck = true;
        this.errorMsg = 'Total working days cannot be greater than 365!';
        return
      }
      if (this.tcForm.value.totalWorkingDays < this.tcForm.value.totalPresenceDays) {
        this.errorCheck = true;
        this.errorMsg = 'Total presence days cannot be greater than total working days!';
        return
      }
      if (!this.tcForm.value.anyOtherRemarks) {
        this.tcForm.value.anyOtherRemarks = 'Nil';
      }
      this.singleStudentTCInfo = { ...this.singleStudentInfo, ...this.tcForm.value }
      this.readyTC = true;
      this.showStudentTCFormModal = false;
      this.showStudentTCPrintModal = true;
    }

  }
}