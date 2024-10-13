import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { AcademicSessionService } from 'src/app/services/academic-session.service';
import { StudentService } from 'src/app/services/student.service';
import { ClassService } from 'src/app/services/class.service';
import { FeesService } from 'src/app/services/fees.service';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { SchoolService } from 'src/app/services/school.service';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-admission',
  templateUrl: './admission.component.html',
  styleUrls: ['./admission.component.css']
})
export class AdmissionComponent implements OnInit {
  @ViewChild('receipt') receipt!: ElementRef;
  public baseUrl = environment.API_URL;
  studentForm: FormGroup;
  showModal: boolean = false;
  showAdmissionPrintModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  academicSession!: string;
  allSession:any=[];
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
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
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
  constructor(private fb: FormBuilder, private adminAuthService: AdminAuthService, private academicSessionService: AcademicSessionService, private schoolService: SchoolService, private printPdfService: PrintPdfService, private classService: ClassService, private studentService: StudentService, private feesStructureService: FeesStructureService, private feesService: FeesService,) {
    this.studentForm = this.fb.group({
      _id: [''],
      adminId: [''],
      session: ['', Validators.required],
      medium: ['', Validators.required],
      admissionNo: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      admissionFees: ['', Validators.required],
      rollNumber: ['', [Validators.required, Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
      class: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      stream: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      dob: ['', Validators.required],
      aadharNumber: ['', [Validators.pattern('^\\d{12}$')]],
      samagraId: ['', [Validators.pattern('^\\d{9}$')]],
      udiseNumber: ['', [Validators.pattern('^\\d{11}$')]],
      bankAccountNo: ['', [Validators.minLength(9), Validators.maxLength(18), Validators.pattern('^[0-9]+$')]],
      bankIfscCode: ['', [Validators.minLength(11), Validators.maxLength(11)]],
      gender: ['', Validators.required],
      category: ['', Validators.required],
      religion: ['', Validators.required],
      nationality: ['', Validators.required],
      address: ['', [Validators.required, Validators.maxLength(50)]],
      lastSchool: ['', [Validators.maxLength(50)]],
      fatherName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      fatherQualification: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      fatherOccupation: ['', Validators.required],
      motherName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      motherQualification: ['', Validators.required],
      motherOccupation: ['', Validators.required],
      parentsContact: ['', [Validators.pattern('^[6789]\\d{9}$')]],
      parentsAnnualIncome: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      feesConcession: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      createdBy: [''],

    })
  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.getSchool(this.adminId);
    this.getClass();
    this.getAcademicSession();
    let load: any = this.getStudentsByAdmission({ page: 1 });
    this.allOptions();
    if (load) {
      setTimeout(() => {
        this.loader = false;
      }, 1000);
    }
    var currentURL = window.location.href;
    this.baseURL = new URL(currentURL).origin;
  }
  getAcademicSession() {
    this.academicSessionService.getAcademicSession().subscribe((res: any) => {
      if (res) {
        this.academicSession = res.academicSession;
      }
    })
  }
  printStudentData() {
    const printContent = this.getPrintContent();
    this.printPdfService.printContent(printContent);
    this.closeModal();
  }

  private getPrintContent(): string {
    let schoolName = this.schoolInfo.schoolName;
    let city = this.schoolInfo.city;
    let printHtml = '<html>';
    printHtml += '<head>';
    printHtml += '<style>';
    printHtml += 'body {width: 100%; height: 100%; margin: 0; padding: 0; }';
    printHtml += 'div {margin: 0; padding: 0;}';
    printHtml += '.custom-container {font-family: Arial, sans-serif;overflow: auto; width: 100%; height: 100%; box-sizing: border-box;}';
    printHtml += '.table-container {width: 100%;height: 100%; background-color: #fff;border: 2px solid #9e9e9e; box-sizing: border-box;}';
    printHtml += '.logo { height: 75px;margin-top:5px;margin-left:5px;}';
    printHtml += '.school-name {display: flex; align-items: center; justify-content: center; text-align: center; }';
    printHtml += '.school-name h3 { color: #252525 !important; font-size: 18px !important;font-weight: bolder;margin-top:-115px !important; margin-bottom: 0 !important; }';

    printHtml += '.address{margin-top: -42px;}';
    printHtml += '.address p{font-size:10px;margin-top: -8px !important;}';
    printHtml += '.title-lable {text-align: center;margin-bottom: 15px;}';
    printHtml += '.title-lable p {color: #252525 !important;font-size: 15px;font-weight: bolder;letter-spacing: .5px;}';

    printHtml += '.info-table {width:100%;color: #252525 !important;border: none;font-size: 11px;margin-top: 1.5vh;margin-bottom: 2vh;display: inline-table;}';
    printHtml += '.table-container .info-table th, .table-container .info-table td{color: #252525 !important;text-align:left;padding-left:15px;padding-top:5px;}';
    printHtml += '.custom-table {width: 100%;color: #252525 !important;border-collapse:collapse;margin-bottom: 20px;display: inline-table;border-radius:5px}';
    printHtml += '.custom-table th{height: 31px;text-align: center;border:1px solid #9e9e9e;line-height:15px;font-size: 10px;}';
    printHtml += '.custom-table tr{height: 30px;}';
    printHtml += '.custom-table td {text-align: center;border:1px solid #9e9e9e;font-size: 10px;}';

    printHtml += '.tc-codes-table {width: 100%;color: #252525 !important;display: inline-table;margin-top: 2vh;}';
    printHtml += '.tc-codes-table tr{height: 2vh;border:none;}';
    printHtml += '.tc-codes-table td {width:50%;border:none;font-size: 12px;}';
    printHtml += '.tc-codes-table td p{margin-left: 20px;margin-right: 20px;}';
    printHtml += '.text-bold { font-weight: bold;}';
    printHtml += 'p {color: #2e2d6a !important;font-size:12px;}'
    printHtml += 'h4 {color: #2e2d6a !important;}'
    printHtml += '@media print {';
    printHtml += '  body::after {';
    printHtml += `    content: "${schoolName}, ${city}";`;
    printHtml += '    position: fixed;';
    printHtml += '    top: 45%;';
    printHtml += '    left:10%;';
    printHtml += '    font-size: 20px;';
    printHtml += '    font-weight: bold;';
    printHtml += '    font-family: Arial, sans-serif;';
    printHtml += '    color: rgba(50, 48, 65, 0.2);';
    printHtml += '    pointer-events: none;';
    printHtml += '  }';
    printHtml += '}';
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

  getSchool(adminId: any) {
    this.schoolService.getSchool(adminId).subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  addPrintModal(student: any) {
    let params = {
      adminId : this.adminId,
      studentId:student._id,
    }
    this.showAdmissionPrintModal = true;
    this.feesService.singleStudentFeesCollectionById(params).subscribe((res: any) => {
      if (res) {
        this.singleStudentInfo = student;
        this.singleStudentInfo.admissionFees = res.studentFeesCollection.admissionFees;
      }
    })
  }

  chooseClass(cls: any) {
    this.errorCheck = false;
    this.errorMsg = '';
    this.cls = 0;
    this.clsFeesStructure = {};
    this.cls = cls;
    if (cls < 11 && cls !== 0 || cls == 200 || cls == 201 || cls == 202) {
      this.studentForm.get('stream')?.setValue("N/A");
      this.stream = '';
      this.stream = 'stream';
      if (this.stream) {
        this.feesStructureByClassStream();
      }
    }
  }
  chooseStream(stream: any) {
    this.stream = '';
    this.stream = stream;
    if (this.stream) {
      this.feesStructureByClassStream();
    }
  }
  feesStructureByClassStream() {
    let params = {
      class: this.cls,
      adminId: this.adminId,
      stream: this.stream
    }
    this.feesStructureService.feesStructureByClassStream(params).subscribe((res: any) => {
      if (res) {
        this.errorCheck = true;
        this.errorMsg = '';
        res.feesType = [{ Admission: res.admissionFees }, ...res.feesType];
        this.clsFeesStructure = res;
        const admissionFees = this.clsFeesStructure?.admissionFees;
        this.studentForm.get('admissionFees')?.setValue(admissionFees);
      }
    }, err => {
      this.errorCheck = true;
      this.errorMsg = err.error;
      this.studentForm.get('admissionFees')?.setValue('');
    })
  }

  date(e: any) {
    var convertDate = new Date(e.target.value).toISOString().substring(0, 10);
    this.studentForm.get('dob')?.setValue(convertDate, {
      onlyself: true,
    });
  }

  closeModal() {
    this.showModal = false;
    this.showAdmissionPrintModal = false;
    this.updateMode = false;
    this.deleteMode = false;
    this.successMsg = '';
    this.errorMsg = '';
    this.stream = '';
    this.cls = 0;
    this.receiptMode = false;
    this.admissionrReceiptInfo = null;
    this.studentForm.reset();
  }
  addStudentModel() {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = false;
    this.studentForm.reset();
    this.studentForm.get('session')?.setValue(this.academicSession);

  }
  updateStudentModel(student: any) {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = true;
    this.studentForm.patchValue(student);
  }
  deleteStudentModel(id: String) {
    this.showModal = true;
    this.updateMode = false;
    this.deleteMode = true;
    this.deleteById = id;
  }

  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }
  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      this.getStudentsByAdmission({ page: this.page });
    }, 1000)
  }

  getStudentsByAdmission($event: any) {
    this.page = $event.page
    return new Promise((resolve, reject) => {
      let params: any = {
        filters: {},
        page: $event.page,
        limit: $event.limit ? $event.limit : this.recordLimit,
        adminId: this.adminId,
      };
      this.recordLimit = params.limit;
      if (this.filters.searchText) {
        params["filters"]["searchText"] = this.filters.searchText.trim();
      }

      this.studentService.studentPaginationByAdmission(params).subscribe((res: any) => {
        if (res) {
          this.studentInfo = res.studentList;
          this.number = params.page;
          this.paginationValues.next({ type: 'page-init', page: params.page, totalTableRecords: res.countStudent });
          return resolve(true);
        }
      });
    });
  }

  studentAddUpdate() {
    if (this.studentForm.valid) {
      this.studentForm.value.adminId = this.adminId;
      this.studentForm.value.admissionType = 'New';
      this.studentForm.value.createdBy = 'Admin';
      this.studentService.addStudent(this.studentForm.value).subscribe((res: any) => {
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

  allOptions() {
    this.sessions = [{ year: '2023-2024' }, { year: '2024-2025' }, { year: '2025-2026' }, { year: '2026-2027' }, { year: '2027-2028' }, { year: '2028-2029' }, { year: '2029-2030' }]
    this.categorys = [{ category: 'General' }, { category: 'OBC' }, { category: 'SC' }, { category: 'ST' }, { category: 'EWS' }, { category: 'Other' }]
    this.religions = [{ religion: 'Hinduism' }, { religion: 'Buddhism' }, { religion: 'Christanity' }, { religion: 'Jainism' }, { religion: 'Sikhism' }, { religion: 'Muslim' }, { religion: 'Other' }]
    this.qualifications = [{ qualification: 'Doctoral Degree' }, { qualification: 'Masters Degree' }, { qualification: 'Graduate Diploma' }, { qualification: 'Graduate Certificate' }, { qualification: 'Graduate Certificate' }, { qualification: 'Bachelor Degree' }, { qualification: 'Advanced Diploma' }, { qualification: 'Primary School' }, { qualification: 'High School' }, { qualification: 'Higher Secondary School' }, { qualification: 'Illiterate' }, { qualification: 'Other' }]
    this.occupations = [{ occupation: 'Agriculture(Farmer)' }, { occupation: 'Laborer' }, { occupation: 'Self Employed' }, { occupation: 'Private Job' }, { occupation: 'State Govt. Employee' }, { occupation: 'Central Govt. Employee' }, { occupation: 'Military Job' }, { occupation: 'Para-Military Job' }, { occupation: 'PSU Employee' }, { occupation: 'Other' }]
    this.mediums = [{ medium: 'Hindi' }, { medium: 'English' }]
  }
}
