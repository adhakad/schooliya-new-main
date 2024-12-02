import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatRadioChange } from '@angular/material/radio';
import { AdmitCardStructureService } from 'src/app/services/admit-card-structure.service';
import { AdmitCardService } from 'src/app/services/admit-card.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { SchoolService } from 'src/app/services/school.service';
import { ClassService } from 'src/app/services/class.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-student-admit-card',
  templateUrl: './admin-student-admit-card.component.html',
  styleUrls: ['./admin-student-admit-card.component.css']
})
export class AdminStudentAdmitCardComponent implements OnInit {
  public baseUrl = environment.API_URL;
  allAdmitCards: any[] = [];
  cls: any;
  classInfo: any[] = [];
  admitCardInfo: any;
  studentInfo: any;
  loader: Boolean = true;
  showModal: Boolean = false;
  admitCardStrInfo: any;
  admitCardStrInfoByStream: any;
  errorCheck: Boolean = false;
  statusCode: Number = 0;
  templateStatusCode: Number = 0;
  processedData: any[] = [];
  schoolInfo: any;
  baseURL!: string;
  stream: string = '';
  notApplicable: string = "stream";
  examType: any[] = [];
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  selectedValue: number = 0;
  adminId!: string;
  constructor(public activatedRoute: ActivatedRoute, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private classService: ClassService, private admitCardService: AdmitCardService, private printPdfService: PrintPdfService, private admitCardStructureService: AdmitCardStructureService) {

  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.getSchool();
    this.getClass();
    var currentURL = window.location.href;
    this.baseURL = new URL(currentURL).origin;
    setTimeout(() => {
      this.loader = false;
    }, 1000)
  }
  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }
  onChange(event: MatRadioChange) {
    this.selectedValue = event.value;
  }
  chooseClass(cls: any) {
    this.cls = cls;
    if (cls !== 11 && cls !== 12) {
      this.stream = this.notApplicable;
      let params = {
        adminId: this.adminId,
        cls: this.cls,
        stream: this.stream,
      }
      this.getAdmitCardStructureByClass(params);
      this.getStudentAdmitCardByClass(params);
    }
    if (cls == 11 || cls == 12) {
      if (this.stream == 'stream') {
        this.stream = '';
      }
      let params = {
        adminId: this.adminId,
        cls: this.cls,
        stream: this.stream,
      }
      this.getAdmitCardStructureByClass(params);
      this.getStudentAdmitCardByClass(params);
    }
  }
  filterStream(stream: any) {
    this.stream = stream;
    if (stream && this.cls) {
      let params = {
        adminId: this.adminId,
        cls: this.cls,
        stream: stream,
      }
      this.getAdmitCardStructureByClass(params);
      this.getStudentAdmitCardByClass(params);
    }
  }


  closeModal() {
    this.showModal = false;
    this.processedData = [];
  }
  bulkPrint(selectedValue: any) {
    this.selectedValue = selectedValue;
    this.processData();

    this.showModal = true;
  }

  getAdmitCardStructureByClass(params: any) {
    this.admitCardStructureService.admitCardStructureByClassStream(params).subscribe((res: any) => {
      if (res) {
        this.errorCheck = false;
        this.templateStatusCode = 200;
        this.admitCardStrInfo = res;
      }
    }, err => {
      this.errorCheck = true;
      this.templateStatusCode = err.status;
    })
  }
  getSchool() {
    this.schoolService.getSchool(this.adminId).subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  printStudentData() {
    if (this.selectedValue == 0) {
      const printContent = this.getPrintOneAdmitCardContent();
      this.printPdfService.printContent(printContent);
    }
    if (this.selectedValue == 1) {
      const printContent = this.getPrintTwoAdmitCardContent();
      this.printPdfService.printContent(printContent);
    }
    this.closeModal();
  }
  private getPrintOneAdmitCardContent(): string {
    let schoolName = this.schoolInfo.schoolName;
    let city = this.schoolInfo.city;
    let printHtml = '<html>';
    printHtml += '<head>';
    printHtml += '<style>';
    printHtml += 'body {width: 100%; height: 100%; margin: 0; padding: 0; }';
    printHtml += 'div {margin: 0; padding: 0;}';
    printHtml += '.custom-container {font-family: Arial, sans-serif;overflow: auto; width: 100%; height: auto; box-sizing: border-box;}';
    printHtml += '.table-container {width: 100%;height: auto; background-color: #fff;border: 2px solid #454545; box-sizing: border-box;}';
    printHtml += '.logo { height: 80px;margin-top:15px;margin-left:10px;}';
    printHtml += '.school-name {display: flex; align-items: center; justify-content: center; text-align: center; }';
    printHtml += '.school-name h3 { color: #0a0a0a !important; font-size: 26px !important;font-weight: bolder;margin-top:-125px !important; margin-bottom: 0 !important; }';

    printHtml += '.address{margin-top: -40px;}';
    printHtml += '.address p{font-size:18px;margin-top: -15px !important;}';
    printHtml += '.title-lable {text-align: center;margin-top: -5px;margin-bottom: 0;}';
    printHtml += '.title-lable p {color: #0a0a0a !important;font-size: 22px;font-weight: bold;letter-spacing: .5px;}';

    printHtml += '.info-table {width:100%;color: #0a0a0a !important;border: none;font-size: 18px;margin-top: 2px;margin-bottom: 6px;padding-top:12px;padding-bottom:4px;display: inline-table;}';
    printHtml += '.table-container .info-table th, .table-container .info-table td{color: #0a0a0a !important;text-align:left;padding-left:15px;}';
    printHtml += '.custom-table {width: 100%;color: #0a0a0a !important;border-collapse:collapse;margin-bottom: -8px;display: inline-table;border-radius:5px;}';
    printHtml += '.custom-table th{height: 35px;text-align: center;border:1px solid #454545;line-height:15px;font-size: 18px;}';
    printHtml += '.custom-table tr{height: 35px;}';
    printHtml += '.custom-table td {text-align: center;border:1px solid #454545;font-size: 18px;}';
    printHtml += '.text-bold { font-weight: bold;}';
    printHtml += '.text-left { text-align: left;}';
    printHtml += 'p {color: #0a0a0a !important;font-size:20px;}'
    printHtml += 'h4 {color: #0a0a0a !important;font-size:22px;}'
    // printHtml += '@media print {';
    // printHtml += '  body::before {';
    // printHtml += `    content: "${schoolName}, ${city}";`;
    // printHtml += '    position: fixed;';
    // printHtml += '    top: 20%;';
    // printHtml += '    left:10%;';
    // printHtml += '    font-size: 20px;';
    // printHtml += '    text-transform: uppercase;';
    // printHtml += '    font-weight: bold;';
    // printHtml += '    font-family: Arial, sans-serif;';
    // printHtml += '    color: rgba(50, 48, 65, 0.108);';
    // printHtml += '    pointer-events: none;';
    // printHtml += '  }';
    // printHtml += '}';
    printHtml += '</style>';
    printHtml += '</head>';
    printHtml += '<body>';

    this.allAdmitCards.forEach((student, index) => {
      const studentElement = document.getElementById(`student-${student.studentId}`);
      if (studentElement) {
        printHtml += studentElement.outerHTML;

        // Add a page break after each student except the last one
        if (index < this.allAdmitCards.length - 1) {
          printHtml += '<div style="page-break-after: always;"></div>';
        }
      }
    });
    printHtml += '</body></html>';
    return printHtml;
  }

  private getPrintTwoAdmitCardContent(): string {
    let schoolName = this.schoolInfo.schoolName;
    let city = this.schoolInfo.city;

    let printHtml = '<html>';
    printHtml += '<head>';
    printHtml += '<style>';
    printHtml += 'body {width: 100%; height: 100%; margin: 0; padding: 0; }';
    printHtml += 'div {margin: 0; padding: 0;}';
    printHtml += '.custom-container {font-family: Arial, sans-serif;overflow: auto; width: 100%; height: auto; box-sizing: border-box;}';
    printHtml += '.table-container {width: 100%;height: auto; background-color: #fff;border: 2px solid #454545; box-sizing: border-box;}';
    printHtml += '.logo { height: 80px;margin-top:15px;margin-left:10px;}';
    printHtml += '.school-name {display: flex; align-items: center; justify-content: center; text-align: center; }';
    printHtml += '.school-name h3 { color: #0a0a0a !important; font-size: 26px !important;font-weight: bolder;margin-top:-125px !important; margin-bottom: 0 !important; }';

    printHtml += '.address{margin-top: -40px;}';
    printHtml += '.address p{font-size:18px;margin-top: -15px !important;}';
    printHtml += '.title-lable {text-align: center;margin-top: -5px;margin-bottom: 0;}';
    printHtml += '.title-lable p {color: #0a0a0a !important;font-size: 22px;font-weight: bold;letter-spacing: .5px;}';

    printHtml += '.info-table {width:100%;color: #0a0a0a !important;border: none;font-size: 18px;margin-top: 2px;margin-bottom: 6px;padding-top:12px;padding-bottom:4px;display: inline-table;}';
    printHtml += '.table-container .info-table th, .table-container .info-table td{color: #0a0a0a !important;text-align:left;padding-left:15px;}';
    printHtml += '.custom-table {width: 100%;color: #0a0a0a !important;border-collapse:collapse;margin-bottom: -8px;display: inline-table;border-radius:5px;}';
    printHtml += '.custom-table th{height: 35px;text-align: center;border:1px solid #454545;line-height:15px;font-size: 18px;}';
    printHtml += '.custom-table tr{height: 35px;}';
    printHtml += '.custom-table td {text-align: center;border:1px solid #454545;font-size: 18px;}';
    printHtml += '.text-bold { font-weight: bold;}';
    printHtml += '.text-left { text-align: left;}';
    printHtml += 'p {color: #0a0a0a !important;font-size:18px;}'
    printHtml += 'h4 {color: #0a0a0a !important;}'
    // printHtml += '.watermark { position: fixed;font-family: Arial, sans-serif; font-size: 20px; font-weight: bold;text-transform: uppercase;color: rgba(50, 48, 65, 0.042); top: 60%; left:10%; pointer-events: none; z-index: 1; }';
    // printHtml += '@media print {';
    // printHtml += '  body::before {';
    // printHtml += `    content: "${schoolName}, ${city}";`;
    // printHtml += '    position: fixed;';
    // printHtml += '    top: 25%;';
    // printHtml += '    left:10%;';
    // printHtml += '    font-size: 20px;';
    // printHtml += '    text-transform: uppercase;';
    // printHtml += '    font-weight: bold;';
    // printHtml += '    font-family: Arial, sans-serif;';
    // printHtml += '    color: rgba(50, 48, 65, 0.108);';
    // printHtml += '    pointer-events: none;';
    // printHtml += '  }';
    // printHtml += '}';
    printHtml += '</style>';
    printHtml += '</head>';
    printHtml += '<body>';


    for (let i = 0; i < this.allAdmitCards.length; i += 2) {
      const student1 = this.allAdmitCards[i];
      const student2 = i + 1 < this.allAdmitCards.length ? this.allAdmitCards[i + 1] : null;

      // printHtml += `<div class="watermark">${schoolName}, ${city}</div>`;
      // Print details for the first student
      printHtml += this.getStudentHtml(student1);

      // Add a page break after the first student if there is a second student
      if (student2) {
        printHtml += '<div style="page-break-after: always;"></div>';
        // Print details for the second student
        printHtml += this.getStudentHtml(student2);
      }
    }

    printHtml += '</body></html>';
    return printHtml;
  }

  private getStudentHtml(student: any): string {
    const studentElement = document.getElementById(`student-${student.studentId}`);
    if (studentElement) {
      return studentElement.outerHTML;
    }
    return '';
  }

  processData() {
    for (let i = 0; i < this.admitCardStrInfo.examDate.length; i++) {
      const subject = Object.keys(this.admitCardStrInfo.examDate[i])[0];
      const date = Object.values(this.admitCardStrInfo.examDate[i])[0];
      const startTime = Object.values(this.admitCardStrInfo.examStartTime[i])[0];
      const endTime = Object.values(this.admitCardStrInfo.examEndTime[i])[0];

      this.processedData.push({
        subject,
        date,
        timing: `${startTime} to ${endTime}`
      });
    }
  }

  getStudentAdmitCardByClass(params: any) {
    this.admitCardService.getAllStudentAdmitCardByClass(params).subscribe((res: any) => {
      if (res) {
        this.errorCheck = false;
        this.statusCode = 200;
        this.admitCardInfo = res.admitCardInfo;
        this.studentInfo = res.studentInfo;
        const studentInfoMap = new Map();
        this.studentInfo.forEach((item: any) => {
          studentInfoMap.set(item._id, item);
        });

        const combinedData = this.admitCardInfo.reduce((result: any, admitCard: any) => {
          const studentInfo = studentInfoMap.get(admitCard.studentId);

          if (studentInfo) {
            result.push({
              session: studentInfo.session,
              studentId: admitCard.studentId,
              class: admitCard.class,
              stream: admitCard.stream,
              examType: admitCard.examType,
              status: admitCard.status || "",
              name: studentInfo.name,
              dob: studentInfo.dob,
              fatherName: studentInfo.fatherName,
              motherName: studentInfo.motherName,
              rollNumber: studentInfo.rollNumber,
              admissionNo: studentInfo.admissionNo
            });
          }

          return result;
        }, []);
        if (combinedData) {
          this.allAdmitCards = combinedData.sort((a: any, b: any) => a.name.localeCompare(b.name));
        }
      }
    }, err => {
      this.errorCheck = true;
      this.statusCode = err.status;
    })
  }

  changeStatus(id: any, statusValue: any) {
    if (id) {
      let params = {
        id: id,
        statusValue: statusValue,
      }
      this.admitCardService.changeStatus(params).subscribe((res: any) => {
        if (res) {
          this.getStudentAdmitCardByClass(this.cls);
        }
      })
    }
  }
}
