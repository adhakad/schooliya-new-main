import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { FeesService } from 'src/app/services/fees.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { SchoolService } from 'src/app/services/school.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-student-fees-statement',
  templateUrl: './admin-student-fees-statement.component.html',
  styleUrls: ['./admin-student-fees-statement.component.css']
})
export class AdminStudentFeesStatementComponent implements OnInit {
  @ViewChild('content') content!: ElementRef;
  @ViewChild('receipt') receipt!: ElementRef;
  public baseUrl = environment.API_URL;
  cls: any;
  showModal: boolean = false;
  clsFeesStructure: any;
  studentFeesCollection: any;
  studentId: any;
  processedData: any[] = [];
  singleReceiptInstallment: any[] = [];
  studentInfo: any[] = [];
  schoolInfo: any;
  stream: any;
  loader: Boolean = true;
  adminId!: string;
  constructor(public activatedRoute: ActivatedRoute, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private printPdfService: PrintPdfService, private feesService: FeesService, private feesStructureService: FeesStructureService) { }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.cls = this.activatedRoute.snapshot.paramMap.get('class');
    this.stream = this.activatedRoute.snapshot.paramMap.get('stream');
    this.studentId = this.activatedRoute.snapshot.paramMap.get('id');
    this.getSchool();
    if (this.adminId && this.cls && this.stream && this.studentId) {
      this.singleStudentFeesCollectionById(this.studentId)
    }
  }
  getSchool() {
    this.schoolService.getSchool(this.adminId).subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
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

  closeModal() {
    this.showModal = false;

  }
  feeReceipt(singleInstallment: any) {
    const data: any = this.processedData
    const desiredInstallment = singleInstallment;
    this.singleReceiptInstallment = data.filter((item: any) => item.paymentDate === desiredInstallment);
    this.singleReceiptInstallment[0].discountAmountInFees = this.studentFeesCollection.discountAmountInFees;
    this.showModal = true;

  }
  singleStudentFeesCollectionById(studentId: any) {
    this.feesService.singleStudentFeesCollectionById(studentId).subscribe((res: any) => {
      if (res) {
        this.studentFeesCollection = res.studentFeesCollection;
        this.studentInfo = res.studentInfo;
        this.feesStructureByClass();
        this.processData();
      }
    })
  }

  feesStructureByClass() {
    let params = {
      class: this.cls,
      adminId: this.adminId,
      stream:this.stream
    }
    this.feesStructureService.feesStructureByClass(params).subscribe((res: any) => {
      if (res) {
        if (this.studentFeesCollection.admissionFeesPayable == true) {
          res.feesType = [{ Admission: res.admissionFees }, ...res.feesType];
          this.clsFeesStructure = res;
        }
        if (this.studentFeesCollection.admissionFeesPayable == false) {
          this.clsFeesStructure = res;
        }
      }
    })
  }

  processData() {
    let allPaidAmount = this.studentFeesCollection.admissionFees;
    for (let i = 0; i < this.studentFeesCollection.installment.length; i++) {
      const receiptNo = this.studentFeesCollection.receipt[i];
      const paidAmount: any = this.studentFeesCollection.installment[i];
      const paymentDate = this.studentFeesCollection.paymentDate[i];
      const createdBy = this.studentFeesCollection.createdBy[i];
      allPaidAmount += paidAmount;
      this.processedData.push({
        allPaidAmount,
        receiptNo,
        paidAmount,
        paymentDate,
        createdBy
      });
    }
    setTimeout(() => {
      this.loader = false;
    }, 1000);
  }
}
