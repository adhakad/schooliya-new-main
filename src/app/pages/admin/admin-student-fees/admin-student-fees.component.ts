import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { read, utils, writeFile } from 'xlsx';
import { FeesService } from 'src/app/services/fees.service';
import { MatRadioChange } from '@angular/material/radio';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { SchoolService } from 'src/app/services/school.service';
import { ClassService } from 'src/app/services/class.service';
import { environment } from 'src/environments/environment';

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
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  feesInfo: any[] = [1, 2, 3, 4, 5];
  recordLimit: number = 10;
  filters: any = {};
  number: number = 0;
  paginationValues: Subject<any> = new Subject();
  page: Number = 0;
  cls: any;
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
  notApplicable: String = "stream";
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  loader: Boolean = false;
  adminId!: string;
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private classService: ClassService, private printPdfService: PrintPdfService, private feesService: FeesService, private feesStructureService: FeesStructureService) {
    this.feesForm = this.fb.group({
      adminId: [''],
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
    // this.getFees({ page: 1 });
  }

  printReceipt() {
    this.printPdfService.printElement(this.receipt.nativeElement);
    this.closeModal();
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
    printHtml += '.custom-container {font-family: Arial, sans-serif;overflow: auto; width: 100%; height: auto; box-sizing: border-box;}';
    printHtml += '.table-container {width: 100%;height: auto; background-color: #fff;border: 2px solid #9e9e9e; box-sizing: border-box;}';
    printHtml += '.logo { height: 65px;margin-top:5px;margin-left:5px;}';
    printHtml += '.school-name {display: flex; align-items: center; justify-content: center; text-align: center; }';
    printHtml += '.school-name h3 { color: #252525 !important; font-size: 18px !important;font-weight: bolder;margin-top:-110px !important; margin-bottom: 0 !important; }';

    printHtml += '.address{margin-top: -43px;}';
    printHtml += '.address p{font-size:10px;margin-top: -10px !important;}';
    printHtml += '.title-lable {text-align: center;margin-top: -19px;margin-bottom: 0;}';
    printHtml += '.title-lable p {color: #252525 !important;font-size: 14px;font-weight: bold;letter-spacing: .5px;}';

    printHtml += '.info-table {width:100%;color: #252525 !important;border: none;font-size: 11px;margin-top: -8px;margin-bottom: 3px;padding-top:3px;display: inline-table;}';
    printHtml += '.table-container .info-table th, .table-container .info-table td{color: #252525 !important;text-align:left;padding-left:15px;}';
    printHtml += '.custom-table {width: 100%;color: #252525 !important;border-collapse:collapse;margin-bottom: -8px;display: inline-table;border-radius:5px;}';
    printHtml += '.custom-table th{height: 25px;text-align: center;border:1px solid #9e9e9e;line-height:15px;font-size: 10px;}';
    printHtml += '.custom-table tr{height: 25px;}';
    printHtml += '.custom-table td {text-align: center;border:1px solid #9e9e9e;font-size: 11px;}';
    printHtml += '.text-bold { font-weight: bold;}';
    printHtml += '.text-left { text-align: left;}';
    printHtml += 'p {color: #252525 !important;font-size:12px;}'
    printHtml += 'h4 {color: #252525 !important;}'
    printHtml += '@media print {';
    printHtml += '  body::before {';
    printHtml += `    content: "${schoolName}, ${city}";`;
    printHtml += '    position: fixed;';
    printHtml += '    top: 20%;';
    printHtml += '    left:10%;';
    printHtml += '    font-size: 20px;';
    printHtml += '    text-transform: uppercase;';
    printHtml += '    font-weight: bold;';
    printHtml += '    font-family: Arial, sans-serif;';
    printHtml += '    color: rgba(50, 48, 65, 0.108);';
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














  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }
  chooseClass(cls: any) {
    this.stream = '';
    this.cls = cls;
  }
  filterStream(stream: any) {
    this.stream = stream;
    if (stream && this.cls) {
      this.feesStructureByClass();
      this.getAllStudentFeesCollectionByClass();
    }
  }
  getSchool() {
    this.schoolService.getSchool(this.adminId).subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
        console.log(this.schoolInfo)
      }
    })
  }

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
        setTimeout(() => {
          this.loader = false;
        }, 1000)
      }
    })
  }

  feesStructureByClass() {
    let params = {
      class: this.cls,
      adminId: this.adminId,
      stream: this.stream
    }
    this.feesStructureService.feesStructureByClass(params).subscribe((res: any) => {
      if (res) {
        this.clsFeesStructure = res;
      }
    })
  }


  closeModal() {
    this.showModal = false;
    this.showPrintModal = false;
    this.showBulkFeesModal = false;
    this.updateMode = false;
    this.successMsg = '';
    this.errorMsg = '';
    this.payNow = false;
    this.paybleInstallment = [];
    this.paybleInstallment = [0, 0];
    this.receiptInstallment = {};
    this.receiptMode = false;
    this.getAllStudentFeesCollectionByClass()
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
    this.singleStudent = student;
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = false;
    this.feesForm.reset();

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



        this.feesService.addFees(this.feesForm.value).subscribe((res: any) => {
          if (res) {
            this.receiptMode = true;
            this.receiptInstallment = res;
            if (res.admissionFeesPayable == true) {
              this.clsFeesStructure.feesType = [{ Admission: res.admissionFees }, ...this.clsFeesStructure.feesType];
              this.showModal = false;
              this.showPrintModal = true;
            }
            if (res.admissionFeesPayable == false) {
              this.clsFeesStructure = this.clsFeesStructure;
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
