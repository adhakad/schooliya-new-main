import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatRadioChange } from '@angular/material/radio';
import { AdmitCardStructureService } from 'src/app/services/admit-card-structure.service';
import { AdmitCardService } from 'src/app/services/admit-card.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { SchoolService } from 'src/app/services/school.service';
import { ClassService } from 'src/app/services/class.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-id-card',
  templateUrl: './admin-id-card.component.html',
  styleUrls: ['./admin-id-card.component.css']
})
export class AdminIdCardComponent implements OnInit {
  public baseUrl = environment.API_URL;
  allAdmitCards: any[] = [];
  cls: number = 0;
  classInfo: any[] = [];
  admitCardInfo: any;
  studentInfo: any;
  loader: Boolean = true;
  showModal: Boolean = false;
  showTemplateModal: Boolean = false;
  admitCardStrInfo: any;
  admitCardStrInfoByStream: any;
  errorCheck: Boolean = false;
  statusCode: Number = 0;
  templateStatusCode: Number = 0;
  processedData: any[] = [];
  schoolInfo: any;
  baseURL!: string;
  examType: any[] = [];
  stream: string = '';
  notApplicable: string = "stream";
  streamMainSubject: any[] = ['mathematics(science)', 'biology(science)', 'history(arts)', 'sociology(arts)', 'political science(arts)', 'accountancy(commerce)', 'economics(commerce)', 'agriculture', 'home science'];
  selectedValue: number = 0;
  selectedTemplate: number = 1;
  adminId!: string;

  // Template definitions
  templates = [
    {
      id: 1,
      name: 'Classic Professional',
      description: 'Traditional design with clean borders',
      preview: 'classic-preview.png'
    },
    {
      id: 2,
      name: 'Modern Gradient',
      description: 'Contemporary design with gradient header',
      preview: 'modern-preview.png'
    },
    {
      id: 3,
      name: 'Minimalist Clean',
      description: 'Simple and elegant design',
      preview: 'minimal-preview.png'
    },
    {
      id: 4,
      name: 'Premium Executive',
      description: 'High-end design with premium styling',
      preview: 'premium-preview.png'
    }
  ];

  constructor(public activatedRoute: ActivatedRoute, private router: Router, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private classService: ClassService, private admitCardService: AdmitCardService, private printPdfService: PrintPdfService, private admitCardStructureService: AdmitCardStructureService) {

  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.getSchool();
    this.getClass();
    this.activatedRoute.queryParams.subscribe((params) => {
      this.cls = +params['cls'] || 0;
      this.stream = params['stream'] || '';
      if (this.cls) {
        this.getAdmitCardStructureByClass();
        this.getStudentAdmitCardByClass();
      } else {
        this.cls = 0;
        this.stream = '';
        this.processedData = [];
      }
    });
    var currentURL = window.location.href;
    this.baseURL = new URL(currentURL).origin;
    setTimeout(() => {
      this.loader = false;
    }, 1000)
  }

  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res.map((item: any) => item.class);
      }
    })
  }

  onChange(event: MatRadioChange) {
    this.selectedValue = event.value;
  }

  onTemplateChange(event: MatRadioChange) {
    this.selectedTemplate = event.value;
  }

  chooseClass(cls: number) {
    this.cls = cls;
    if (cls !== 11 && cls !== 12) {
      this.stream = this.notApplicable;
      this.processedData = [];
      this.updateRouteParams();
      this.getAdmitCardStructureByClass();
      this.getStudentAdmitCardByClass();
    }
    if (cls == 11 || cls == 12) {
      if (this.stream == 'stream') {
        this.stream = '';
      }
      this.processedData = [];
      this.updateRouteParams();
      this.getAdmitCardStructureByClass();
      this.getStudentAdmitCardByClass();
    }
  }

  filterStream(stream: any) {
    this.stream = stream;
    if (stream && this.cls) {
      this.processedData = [];
      this.updateRouteParams();
      this.getAdmitCardStructureByClass();
      this.getStudentAdmitCardByClass();
    }
  }

  updateRouteParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { cls: this.cls || null, stream: this.stream || null },
      queryParamsHandling: 'merge'
    });
  }

  closeModal() {
    this.showModal = false;
    this.processedData = [];
  }

  closeTemplateModal() {
    this.showTemplateModal = false;
  }

  openTemplateSelector() {
    this.showTemplateModal = true;
  }

  bulkPrint(selectedValue: any) {
    this.selectedValue = selectedValue;
    this.processData();
    this.openTemplateSelector();
  }

  confirmPrintWithTemplate() {
    this.closeTemplateModal();
    this.showModal = true;
  }

  getAdmitCardStructureByClass() {
    let params = {
      cls: this.cls,
      adminId: this.adminId,
      stream: this.stream
    }
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
    if (this.selectedValue == 1) {
      const printContent = this.getPrintTwoAdmitCardContent();
      this.printPdfService.printContent(printContent);
    } else {
      const printContent = this.getPrintOneAdmitCardContent();
      this.printPdfService.printContent(printContent);
    }
    this.closeModal();
  }

  private getStudentHtml(student: any): string {
    const studentElement = document.getElementById(`student-${student.studentId}`);
    if (studentElement) {
      return studentElement.outerHTML;
    }
    return '';
  }

  private getTemplateStyles(): string {
    switch(this.selectedTemplate) {
      case 1: // Classic Professional
        return this.getClassicStyles();
      case 2: // Modern Gradient
        return this.getModernGradientStyles();
      case 3: // Minimalist Clean
        return this.getMinimalistStyles();
      case 4: // Premium Executive
        return this.getPremiumStyles();
      default:
        return this.getClassicStyles();
    }
  }

  private getClassicStyles(): string {
    return `
      @page { size: A3; margin: 10mm; }
      body {width: 100%; height: 100%; margin: 0; padding: 0; position: relative; font-family: 'Times New Roman', serif; }
      .custom-container {overflow: auto; width: 100%; height: auto; box-sizing: border-box; position: relative; z-index: 2;}
      .table-container {width: 100%;height: auto; background-color: #fff;border: 3px solid #2c3e50; box-sizing: border-box; border-radius: 10px;}
      .logo { height: 80px;margin-top:15px;margin-left:10px;}
      .school-name h3 { color: #2c3e50 !important; font-size: 28px !important;font-weight: bold;margin-top:-125px !important; margin-bottom: 0 !important; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);}
      .address p{font-size:16px;margin-top: -15px !important; color: #34495e;}
      .title-lable p {color: #e74c3c !important;font-size: 24px;font-weight: bold;letter-spacing: 1px; background: linear-gradient(45deg, #e74c3c, #c0392b); -webkit-background-clip: text; -webkit-text-fill-color: transparent;}
      .info-table {border: 2px solid #34495e; background: #f8f9fa;}
      .custom-table th{background: #34495e; color: white !important; font-weight: bold;}
      .custom-table {border: 2px solid #34495e;}
    `;
  }

  private getModernGradientStyles(): string {
    return `
      @page { size: A3; margin: 10mm; }
      body {width: 100%; height: 100%; margin: 0; padding: 0; position: relative; font-family: 'Arial', sans-serif; }
      .custom-container {overflow: auto; width: 100%; height: auto; box-sizing: border-box; position: relative; z-index: 2;}
      .table-container {width: 100%;height: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-sizing: border-box; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);}
      .logo { height: 80px;margin-top:15px;margin-left:10px; border-radius: 50%; box-shadow: 0 5px 15px rgba(0,0,0,0.3);}
      .school-name h3 { color: white !important; font-size: 30px !important;font-weight: bold;margin-top:-125px !important; margin-bottom: 0 !important; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);}
      .address p{font-size:16px;margin-top: -15px !important; color: rgba(255,255,255,0.9);}
      .title-lable p {color: #ffd700 !important;font-size: 26px;font-weight: bold;letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);}
      .info-table {background: rgba(255,255,255,0.95); border-radius: 8px; margin: 15px;}
      .custom-table th{background: linear-gradient(45deg, #4facfe, #00f2fe); color: white !important; font-weight: bold;}
      .custom-table {background: rgba(255,255,255,0.95); border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);}
    `;
  }

  private getMinimalistStyles(): string {
    return `
      @page { size: A3; margin: 10mm; }
      body {width: 100%; height: 100%; margin: 0; padding: 0; position: relative; font-family: 'Helvetica Neue', sans-serif; }
      .custom-container {overflow: auto; width: 100%; height: auto; box-sizing: border-box; position: relative; z-index: 2;}
      .table-container {width: 100%;height: auto; background-color: #fff;border: 1px solid #e0e0e0; box-sizing: border-box;}
      .logo { height: 80px;margin-top:15px;margin-left:10px;}
      .school-name h3 { color: #333 !important; font-size: 26px !important;font-weight: 300;margin-top:-125px !important; margin-bottom: 0 !important; letter-spacing: 2px;}
      .address p{font-size:14px;margin-top: -15px !important; color: #666; font-weight: 300;}
      .title-lable p {color: #2196F3 !important;font-size: 22px;font-weight: 400;letter-spacing: 1px;}
      .info-table {border: none; border-bottom: 1px solid #e0e0e0;}
      .custom-table th{background: #f5f5f5; color: #333 !important; font-weight: 500; border: 1px solid #e0e0e0;}
      .custom-table {border: 1px solid #e0e0e0;}
      .custom-table td {border: 1px solid #f0f0f0;}
    `;
  }

  private getPremiumStyles(): string {
    return `
      @page { size: A3; margin: 10mm; }
      body {width: 100%; height: 100%; margin: 0; padding: 0; position: relative; font-family: 'Georgia', serif; }
      .custom-container {overflow: auto; width: 100%; height: auto; box-sizing: border-box; position: relative; z-index: 2;}
      .table-container {width: 100%;height: auto; background: linear-gradient(145deg, #f0f0f0, #ffffff); box-sizing: border-box; border: 3px solid #b8860b; border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.1);}
      .logo { height: 80px;margin-top:15px;margin-left:10px; border: 3px solid #b8860b; border-radius: 8px; padding: 5px; background: white;}
      .school-name h3 { color: #b8860b !important; font-size: 32px !important;font-weight: bold;margin-top:-125px !important; margin-bottom: 0 !important; text-shadow: 1px 1px 3px rgba(0,0,0,0.2);}
      .address p{font-size:16px;margin-top: -15px !important; color: #8b4513; font-weight: 500;}
      .title-lable p {color: #8b0000 !important;font-size: 28px;font-weight: bold;letter-spacing: 2px; text-transform: uppercase;}
      .info-table {background: linear-gradient(145deg, #fff, #f8f8f8); border: 2px solid #b8860b; border-radius: 8px; margin: 10px;}
      .custom-table th{background: linear-gradient(145deg, #b8860b, #daa520); color: white !important; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);}
      .custom-table {border: 2px solid #b8860b; border-radius: 8px; background: linear-gradient(145deg, #fff, #f9f9f9);}
    `;
  }

  private getPrintOneAdmitCardContent(): string {
    let printHtml = '<html>';
    printHtml += '<head>';
    printHtml += '<style>';
    printHtml += this.getTemplateStyles();
    printHtml += this.getCommonStyles();
    printHtml += '</style>';
    printHtml += '</head>';
    printHtml += '<body>';

    for (let i = 0; i < this.allAdmitCards.length; i++) {
      const student = this.allAdmitCards[i];
      printHtml += '<div class="page-wrapper">';
      printHtml += this.getWatermarkHtml();
      printHtml += this.getStudentHtml(student);
      printHtml += '</div>';
      
      if (i + 1 < this.allAdmitCards.length) {
        printHtml += '<div style="page-break-after: always;"></div>';
      }
    }

    printHtml += '</body></html>';
    return printHtml;
  }

  private getPrintTwoAdmitCardContent(): string {
    let printHtml = '<html>';
    printHtml += '<head>';
    printHtml += '<style>';
    printHtml += this.getTemplateStyles();
    printHtml += this.getCommonStyles();
    printHtml += '.student-container { position: relative; height: 48vh; margin-bottom: 2vh; }';
    printHtml += '</style>';
    printHtml += '</head>';
    printHtml += '<body>';

    for (let i = 0; i < this.allAdmitCards.length; i += 2) {
      const student1 = this.allAdmitCards[i];
      const student2 = i + 1 < this.allAdmitCards.length ? this.allAdmitCards[i + 1] : null;

      printHtml += '<div class="page-wrapper">';
      
      printHtml += '<div class="student-container">';
      printHtml += this.getWatermarkHtml();
      printHtml += this.getStudentHtml(student1);
      printHtml += '</div>';

      if (student2) {
        printHtml += '<div class="student-container">';
        printHtml += this.getWatermarkHtml();
        printHtml += this.getStudentHtml(student2);
        printHtml += '</div>';
      }

      printHtml += '</div>';

      if (i + 2 < this.allAdmitCards.length) {
        printHtml += '<div style="page-break-after: always;"></div>';
      }
    }

    printHtml += '</body></html>';
    return printHtml;
  }

  private getWatermarkHtml(): string {
    if (this.schoolInfo?.schoolLogo) {
      return `
        <div class="watermark-container">
          <img src="${this.schoolInfo.schoolLogo}" class="watermark-logo" alt="School Logo Watermark">
        </div>
      `;
    }
    return '';
  }

  private getCommonStyles(): string {
    return `
      div {margin: 0; padding: 0;}
      .page-wrapper { position: relative; min-height: 100vh; }
      .school-name {display: flex; align-items: center; justify-content: center; text-align: center; }
      .address{margin-top: -40px; text-align: center;}
      .title-lable {text-align: center;margin-top: -5px;margin-bottom: 0;}
      .info-table {width:100%;border: none;font-size: 18px;margin-top: 2px;margin-bottom: 6px;padding-top:12px;padding-bottom:4px;display: inline-table;}
      .table-container .info-table th, .table-container .info-table td{text-align:left;padding-left:15px;}
      .custom-table {width: 100%;border-collapse:collapse;margin-bottom: -8px;display: inline-table;border-radius:5px;}
      .custom-table th{height: 35px;text-align: center;line-height:15px;font-size: 18px;}
      .custom-table tr{height: 35px;}
      .custom-table td {text-align: center;font-size: 18px;}
      .text-bold { font-weight: bold;}
      .text-left { text-align: left;}
      p {font-size:18px;}
      h4 {color: #0a0a0a !important;}
      .watermark-container {position: absolute;top: 0;left: 0;width: 100%;height: 100%;z-index: 1000;pointer-events: none;}
      .watermark-logo {position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);opacity: 0.2;width: 35%;height: auto;max-width: 500px;}
      @media print {.watermark-container { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }}
    `;
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

  getStudentAdmitCardByClass() {
    let params = {
      cls: this.cls,
      adminId: this.adminId,
      stream: this.stream
    }
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
}