import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { read, utils, writeFile } from 'xlsx';
import { FeesService } from 'src/app/services/fees.service';
import { MatRadioChange } from '@angular/material/radio';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { SchoolService } from 'src/app/services/school.service';
import { ClassService } from 'src/app/services/class.service';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-student-fees',
  templateUrl: './admin-student-fees.component.html',
  styleUrls: ['./admin-student-fees.component.css']
})
export class AdminStudentFeesComponent implements OnInit {
  @ViewChild('receipt') receipt!: ElementRef;
  public baseUrl = environment.API_URL;
  feesForm: FormGroup;
  showModal: boolean = false;
  showPrintModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  feesInfo: any[] = [1, 2, 3, 4, 5];
  recordLimit: number = 10;
  filters: any = {};
  number: number = 0;
  paginationValues: Subject<any> = new Subject();
  page: Number = 0;
  cls: number = 0;
  classInfo: any[] = [];

  classSubject: any;
  showBulkFeesModal: boolean = false;
  movies: any[] = [];
  selectedValue: number = 0;
  fileChoose: boolean = false;
  existRollnumber: number[] = [];
  clsFeesStructure: any;
  schoolInfo: any;
  studentList: any[] = [];
  singleStudent: any;
  paybleInstallment: any;
  payNow: boolean = false;
  receiptInstallment: any = {};
  receiptMode: boolean = false;

  stream: string = '';
  notApplicable: string = "stream";
  streamMainSubject: any[] = ['mathematics(science)', 'biology(science)', 'history(arts)', 'sociology(arts)', 'political science(arts)', 'accountancy(commerce)', 'economics(commerce)', 'agriculture', 'home science'];
  loader: Boolean = false;
  baseURL!: string;
  adminId!: string;
  receiptSession: any;
  constructor(private fb: FormBuilder, private router: Router, public activatedRoute: ActivatedRoute, private toastr: ToastrService, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private classService: ClassService, private printPdfService: PrintPdfService, private feesService: FeesService, private feesStructureService: FeesStructureService) {
    this.feesForm = this.fb.group({
      adminId: [''],
      session: [''],
      class: [''],
      stream: [''],
      studentId: [''],
      feesAmount: [''],
      createdBy: [''],
    });
  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.getClass();
    this.getSchool();
    this.activatedRoute.queryParams.subscribe((params) => {
      this.cls = +params['cls'] || 0;
      this.stream = params['stream'] || '';
      if (this.cls) {
        this.getAllStudentFeesCollectionByClass();
      } else {
        this.cls = 0;
        this.stream = '';
        this.studentList = [];
      }
    });
  }

  formatCurrency(value: any): string {
    value = parseInt(value);
    if (typeof value === 'number') {
      return '₹ ' + value.toLocaleString(undefined); // No minimumFractionDigits
    }
    return '₹ 0';
  }
  formatKey(key: any): string {
    if (typeof key === 'string') {
      return key.toUpperCase();
    }
    return '';
  }
  printStudentData() {
    const printContent = this.getPrintContent();
    this.printPdfService.printContent(printContent);
    this.closeModal();
  }

  private getPrintContent(): string {
  let schoolName = this.schoolInfo.schoolName;
  let city = this.schoolInfo.city;
  let schoolLogo = this.schoolInfo.schoolLogo; // Get the school logo URL
  
  let printHtml = '<html>';
  printHtml += '<head>';
  printHtml += '<style>';
  printHtml += '@page { size: A3; margin: 10mm; }';
  printHtml += 'body {width: 100%; height: 100%; margin: 0; padding: 0; position: relative; }';
  printHtml += 'div {margin: 0; padding: 0;}';
  printHtml += '.custom-container {font-family: Arial, sans-serif;overflow: auto; width: 100%; height: auto; box-sizing: border-box; position: relative; z-index: 2;}';
  printHtml += '.table-container {width: 100%;height: auto; background-color: #fff;border: 2px solid #454545; box-sizing: border-box;}';
  printHtml += '.logo { height: 80px;margin-top:15px;margin-left:10px;}';
  printHtml += '.school-name {display: flex; align-items: center; justify-content: center; text-align: center; }';
  printHtml += '.school-name h3 { color: #0a0a0a !important; font-size: 26px !important;font-weight: bolder;margin-top:-125px !important; margin-bottom: 0 !important; }';

  printHtml += '.address{margin-top: -42px;}';
  printHtml += '.address p{font-size:18px;margin-top: -15px !important;}';
  printHtml += '.title-lable {text-align: center;margin-top: -10px;margin-bottom: 0;}';
  printHtml += '.title-lable p {color: #0a0a0a !important;font-size: 22px;font-weight: bold;letter-spacing: .5px;}';

  printHtml += '.info-table {width:100%;color: #0a0a0a !important;border: none;font-size: 18px;margin-top: -8px;margin-bottom: 6px;padding-top:8px;display: inline-table;}';
  printHtml += '.table-container .info-table th, .table-container .info-table td{color: #0a0a0a !important;text-align:left;padding-left:15px;}';
  printHtml += '.custom-table {width: 100%;color: #0a0a0a !important;border-collapse:collapse;margin-bottom: -8px;display: inline-table;border-radius:5px;}';
  printHtml += '.custom-table th{height: 32px;text-align: center;border:1px solid #454545;line-height:15px;font-size: 18px;}';
  printHtml += '.custom-table tr{height: 32px;}';
  printHtml += '.custom-table td {text-align: center;border:1px solid #454545;font-size: 18px;}';
  printHtml += '.text-bold { font-weight: bold;}';
  printHtml += '.text-left { text-align: left;}';
  printHtml += 'p {color: #0a0a0a !important;font-size:18px;}';
  printHtml += 'h4 {color: #0a0a0a !important;}';
  
  // Add watermark styles
  printHtml += '.watermark {';
  printHtml += '  position: fixed;';
  printHtml += '  top: 50%;';
  printHtml += '  left: 50%;';
  printHtml += '  transform: translate(-50%, -50%) rotate(-45deg);';
  printHtml += '  opacity: 0.1;';
  printHtml += '  z-index: 1;';
  printHtml += '  pointer-events: none;';
  printHtml += '  width: 300px;';
  printHtml += '  height: auto;';
  printHtml += '}';
  
  // Alternative watermark with text and logo combination
  printHtml += '.watermark-container {';
  printHtml += '  position: fixed;';
  printHtml += '  top: 0;';
  printHtml += '  left: 0;';
  printHtml += '  width: 100%;';
  printHtml += '  height: 100%;';
  printHtml += '  z-index: 10;';
  printHtml += '  pointer-events: none;';
  printHtml += '}';
  
  printHtml += '.watermark-logo {';
  printHtml += '  position: absolute;';
  printHtml += '  top: 25%;';
  printHtml += '  left: 50%;';
  printHtml += '  text-align: center;';
  printHtml += '  transform: translate(-50%, -50%) rotate(360deg);';
  printHtml += '  opacity: 0.09;';
  printHtml += '  width: 45%;';
  printHtml += '  height: auto;';
  printHtml += '}';
  
  // printHtml += '.watermark-text {';
  // printHtml += '  position: absolute;';
  // printHtml += '  top: 55%;';
  // printHtml += '  left: 50%;';
  // printHtml += '  transform: translate(-50%, -50%) rotate(-20deg);';
  // printHtml += '  font-size: 24px;';
  // printHtml += '  font-weight: bold;';
  // printHtml += '  color: rgba(0, 0, 0, 0.08);';
  // printHtml += '  text-transform: uppercase;';
  // printHtml += '  font-family: Arial, sans-serif;';
  // printHtml += '  white-space: nowrap;';
  // printHtml += '}';
  
  // Print specific styles
  printHtml += '@media print {';
  printHtml += '  .watermark, .watermark-container { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }';
  printHtml += '}';
  
  printHtml += '</style>';
  printHtml += '</head>';
  printHtml += '<body>';
  
  // Add watermark container
  printHtml += '<div class="watermark-container">';
  if (schoolLogo) {
    printHtml += `<img src="${schoolLogo}" class="watermark-logo" alt="School Logo Watermark">`;
  }
  // printHtml += `<div class="watermark-text">${schoolName}</div>`;
  printHtml += '</div>';
  
  const studentElement = document.getElementById(`student`);
  if (studentElement) {
    printHtml += studentElement.outerHTML;
  }
  printHtml += '</body></html>';
  return printHtml;
}

  closeModal() {
    this.showModal = false;
    this.showPrintModal = false;
    this.showBulkFeesModal = false;
    this.updateMode = false;
    this.errorMsg = '';
    this.payNow = false;
    this.paybleInstallment = [];
    this.paybleInstallment = [0, 0];
    this.receiptInstallment = {};
    this.receiptMode = false;
    this.getAllStudentFeesCollectionByClass();
  }


  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res.map((item: any) => item.class);
      }
    })
  }
  chooseClass(cls: number) {
    this.cls = cls;
    if (cls !== 11 && cls !== 12) {
      this.stream = this.notApplicable;
      this.studentList = [];
      this.updateRouteParams();
      this.getAllStudentFeesCollectionByClass();
    }
    if (cls == 11 || cls == 12) {
      if (this.stream == 'stream') {
        this.stream = '';
      }
      this.studentList = [];
      this.updateRouteParams();
      this.getAllStudentFeesCollectionByClass();
    }
  }
  filterStream(stream: any) {
    this.stream = stream;
    if (stream && this.cls) {
      this.studentList = [];
      this.updateRouteParams();
      this.getAllStudentFeesCollectionByClass();
    }
  }
  updateRouteParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { cls: this.cls || null, stream: this.stream || null }, // Reset parameters if cls or stream is null
      queryParamsHandling: 'merge' // Keep other query params
    });
  }
  getSchool() {
    this.schoolService.getSchool(this.adminId).subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  // feesStructureByClass() {
  //   let params = {
  //     class: this.cls,
  //     adminId: this.adminId,
  //     stream: this.stream
  //   }
  //   this.feesStructureService.feesStructureByClassStream(params).subscribe((res: any) => {
  //     if (res) {
  //       this.clsFeesStructure = res;
  //     }
  //   })
  // }
  getAllStudentFeesCollectionByClass() {
    let params = {
      class: this.cls,
      adminId: this.adminId,
      stream: this.stream
    }
    this.feesService.getAllStudentFeesCollectionByClass(params).subscribe((res: any) => {
      if (res) {
        let studentFeesCollection = res.studentFeesCollection;
        let studentInfo = res.studentInfo;
        const studentMap: any = new Map(studentInfo.map((student: any) => [student._id, student]));
        const combinedData = studentFeesCollection.map((feeCollection: any) => ({
          ...studentMap.get(feeCollection.studentId),
          ...feeCollection
        }));

        this.studentList = combinedData.sort((a: any, b: any) => a.name.localeCompare(b.name));
      }
    })
  }

  feesPay(pay: boolean) {
    if (pay === false) {
      this.payNow = true;
    }
    if (pay === true) {
      this.payNow = false;
    }
  }
  studentFeesPay(student: any) {
    this.getPayableSingleStudentFeesCollectionById(student);
  }
  getPayableSingleStudentFeesCollectionById(student: any) {
    this.feesService.payableSingleStudentFeesCollectionById(student.studentId).subscribe((res: any) => {
      if (res) {
        this.clsFeesStructure = res.singleFeesStr;
        this.singleStudent = { ...res.studentInfo, ...res.studentFeesCollection };
        this.showModal = true;
        this.deleteMode = false;
        this.updateMode = false;
        this.feesForm.reset();
      }
    })
  }
  // updateFeesModel(fees: any) {
  //   this.showModal = true;
  //   this.deleteMode = false;
  //   this.updateMode = true;
  // }
  // deleteFeesModel(id: String) {
  //   this.showModal = true;
  //   this.updateMode = false;
  //   this.deleteMode = true;
  //   this.deleteById = id;
  // }


  // getFees($event: any) {
  //   this.page = $event.page
  //   return new Promise((resolve, reject) => {
  //     let params: any = {
  //       filters: {},
  //       page: $event.page,
  //       limit: $event.limit ? $event.limit : this.recordLimit,
  //       class: this.cls
  //     };
  //     this.recordLimit = params.limit;
  //     if (this.filters.searchText) {
  //       params["filters"]["searchText"] = this.filters.searchText.trim();
  //     }

  //     this.feesService.feesPaginationList(params).subscribe((res: any) => {
  //       if (res) {
  //         this.feesInfo = res.feesList;
  //         this.number = params.page;
  //         this.paginationValues.next({ type: 'page-init', page: params.page, totalTableRecords: res.countFees });
  //         return resolve(true);
  //       }
  //     });
  //   });
  // }

  feesAddUpdate() {
    if (this.feesForm.valid) {
      this.feesForm.value.adminId = this.adminId;
      this.feesForm.value.stream = this.stream;
      if (this.updateMode) {
        // this.feesService.updateFees(this.feesForm.value).subscribe((res: any) => {
        //   if (res) {
        //     this.closeModal();
        //     this.successMsg = res;
        //   }
        // }, err => {
        //   this.errorCheck = true;
        //   this.errorMsg = err.error;
        // })
        console.log("this block is comment out");
      } else {
        this.feesForm.value.class = this.singleStudent.class;
        this.feesForm.value.createdBy = "Admin";
        this.feesForm.value.studentId = this.singleStudent.studentId;
        this.feesForm.value.session = this.singleStudent.session;



        this.feesService.addFees(this.feesForm.value).subscribe((res: any) => {
          if (res) {
            this.receiptMode = true;
            this.receiptSession = res.session;
            this.receiptInstallment = res;
            if (res.admissionFeesPayable == true) {
              this.clsFeesStructure.feesType = [{ Admission: res.admissionFees }, ...this.clsFeesStructure.feesType];
              this.toastr.success('','Fee Amount Collected Successfully');
              this.showModal = false;
              this.showPrintModal = true;
            }
            if (res.admissionFeesPayable == false) {
              this.clsFeesStructure = this.clsFeesStructure;
              this.toastr.success('','Fee Amount Collected Successfully',);
              this.showModal = false;
              this.showPrintModal = true;
            }
          }
        }, err => {
          this.errorCheck = true;
          this.errorMsg = err.error;
        })
      }
    }
  }



  // handleImport($event: any) {
  //   this.fileChoose = true;
  //   const files = $event.target.files;
  //   if (files.length) {
  //     const file = files[0];
  //     const reader = new FileReader();
  //     reader.onload = (event: any) => {
  //       const wb = read(event.target.fees);
  //       const sheets = wb.SheetNames;

  //       if (sheets.length) {
  //         const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
  //         this.movies = rows;
  //       }
  //     }
  //     reader.readAsArrayBuffer(file);
  //   }

  // }

  // onChange(event: MatRadioChange) {
  //   this.selectedValue = event.value;
  // }
  // addBulkFeesModel() {
  //   this.showBulkFeesModal = true;
  // }
  // addBulkFees() {
  //   this.feesService.addBulkFees(this.movies).subscribe((res: any) => {
  //     if (res) {
  //       this.successMsg = res;
  //     }
  //   }, err => {
  //     this.errorCheck = true;
  //     this.errorMsg = err.error.errMsg;
  //     this.existRollnumber = err.error.existRollnumber;
  //   })
  // }


}
