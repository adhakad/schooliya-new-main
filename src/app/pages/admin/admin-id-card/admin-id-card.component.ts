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
  adminId!: string;

  constructor(
    public activatedRoute: ActivatedRoute,
    private router: Router,
    private adminAuthService: AdminAuthService,
    private schoolService: SchoolService,
    private classService: ClassService,
    private admitCardService: AdmitCardService,
    private printPdfService: PrintPdfService,
    private admitCardStructureService: AdmitCardStructureService
  ) { }

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

  bulkPrint(selectedValue: any) {
    this.selectedValue = selectedValue;
    this.processData();
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
      const printContent = this.getPrintDualIdCardContent();
      this.printPdfService.printContent(printContent);
    }
    this.closeModal();
  }

  private getPrintDualIdCardContent(): string {
    let printHtml = '<html>';
    printHtml += '<head>';
    printHtml += '<style>';
    // Custom page size: 12x18 inches (304.8mm x 457.2mm)
    printHtml += '@page { size: 304.8mm 457.2mm; margin: 12.7mm; }';
    printHtml += 'body { width: 100%; height: 100%; margin: 0; padding: 0; font-family: Arial, sans-serif; }';
    // Grid layout for 25 cards (5x5) - consistent mm units
    printHtml += '.print-container { display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(5, 1fr); gap: 5mm; width: 100%; height: 100%; padding: 5mm; }';
    printHtml += this.getIdCardStyles();
    printHtml += '.dual-id-card-container { display: flex; align-items: center; justify-content: center; break-inside: avoid; }';
    printHtml += '.page-break { page-break-before: always; }';
    printHtml += '</style>';
    printHtml += '</head>';
    printHtml += '<body>';
    printHtml += '<div class="print-container">';

    this.allAdmitCards.forEach((student, index) => {
      // Add page break after every 25 cards
      if (index > 0 && index % 25 === 0) {
        printHtml += '</div><div class="print-container page-break">';
      }

      printHtml += `<div class="dual-id-card-container">`;
      printHtml += this.generateIdCardHtml(student);
      printHtml += '</div>';
    });

    printHtml += '</div>';
    printHtml += '</body></html>';
    return printHtml;
  }

  private generateIdCardHtml(student: any): string {
    return `
      <div class="id-card">
        <!-- Header -->
        <div class="id-card-header">
          <div class="id-card-logo-box">
            <div class="id-card-logo-bg">
              <img src="${this.schoolInfo?.schoolLogo || '../../../../assets/school-logo.png'}" 
                   alt="School Logo" class="id-card-logo">
            </div>
          </div>
          <div class="id-card-school-name">
            <span class="id-card-school-text">GREEN VALLEY SCHOOL</span>
          </div>
        </div>
        
        <!-- Photo -->
        <div class="id-card-photo-section">
          <div class="id-card-photo-frame">
            <div class="id-card-photo-bg">
              <img src="${student?.photo || '../../../../assets/R.jpeg'}" 
                   alt="Student Photo" class="id-card-photo">
            </div>
          </div>
        </div>
        
        <!-- Info -->
        <div class="id-card-info">
          <div class="id-card-student-name">
            <div class="id-card-student-text">${(student?.name || '').toUpperCase()}</div>
          </div>
          
          <div class="id-card-info-grid">
            <div class="id-card-info-row">
              <span class="id-card-info-label">Father Name</span>
              <span class="id-card-info-separator">:</span>
              <span class="id-card-info-value">${this.titleCase(student?.fatherName || '')}</span>
            </div>
            <div class="id-card-info-row">
              <span class="id-card-info-label">Date of Birth</span>
              <span class="id-card-info-separator">:</span>
              <span class="id-card-info-value">${student?.dob || ''}</span>
            </div>
            <div class="id-card-info-row">
              <span class="id-card-info-label">Mobile</span>
              <span class="id-card-info-separator">:</span>
              <span class="id-card-info-value">9234567541</span>
            </div>
            <div class="id-card-info-row">
              <span class="id-card-info-label">Class</span>
              <span class="id-card-info-separator">:</span>
              <span class="id-card-info-value">${student?.class}${this.getClassSuffix(student?.class)}${(this.cls == 11 || this.cls == 12) ? ' ' + this.titleCase(student?.stream || '') : ''}</span>
            </div>
          </div>
        </div>
        
        <!-- Signature -->
        <div class="id-card-signature">
          <img src="${this.schoolInfo?.principalSignature || '../../../../assets/screenshot-1750585576464.png'}" 
               alt="Principal Signature" class="id-card-signature-img">
          <span class="id-card-signature-text">PRINCIPAL SIGNATURE</span>
        </div>
        
        <!-- Footer -->
        <div class="id-card-footer">
          <span class="id-card-address">
            ADD - ${(this.schoolInfo?.street).toUpperCase()}, ${(this.schoolInfo?.city).toUpperCase()}-${this.schoolInfo?.pinCode}<br>
            CONTACT - ${this.schoolInfo?.phoneOne || ''}
          </span>
        </div>
      </div>
    `;
  }

  private getIdCardStyles(): string {
    return `
       .id-card {
   width: 58.21mm; /* Original size maintained */
   height: 92.6mm; /* Original size maintained */
   background: #ffffff;
   border-radius: 4.23mm; /* 16px */
   position: relative;
   overflow: hidden;
}

.id-card-header {
   height: 21.17mm; /* 80px */
   background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%);
   display: flex;
   justify-content: flex-start;
   gap: 0;
   padding: 3.18mm 0 0 3.18mm; /* 12px 0 0 12px */
   border-radius: 4.23mm 4.23mm 50% 50%; /* 16px 16px 50% 50% */
}

.id-card-logo-box {
   width: 8.47mm; /* 32px */
   height: 8.47mm; /* 32px */
   background: rgba(255, 255, 255, 0.2);
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
}

.id-card-logo-bg {
   width: 7.94mm; /* 30px */
   height: 7.94mm; /* 30px */
   background: #ffffff;
   border-radius: 1.59mm; /* 6px */
   padding: 0.53mm; /* 2px */
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 2.12mm; /* 8px */
   font-weight: 600;
   color: #2a5298;
}

.id-card-logo {
   width: 6.88mm; /* 26px */
   height: 6.88mm; /* 26px */
}

.id-card-school-name {
   color: #ffffff;
   line-height: 1.2;
   text-shadow: 0 0.53mm 1.06mm rgba(0, 0, 0, 0.3); /* 0 2px 4px */
   height: 9.26mm; /* 35px */
   text-align: center;
   display: flex;
   align-items: center;
   justify-content: center;
   word-wrap: break-word;
   overflow-wrap: break-word;
   hyphens: auto;
   padding-left: 2.12mm; /* 8px */
   padding-right: 2.12mm; /* 8px */
}

.id-card-school-text {
   font-size: 3.18mm; /* 12px */
   font-weight: 900;
   letter-spacing: 0.13mm; /* 0.5px */
   line-height: 4.23mm; /* 16px */
   word-spacing: 0.53mm; /* 2px */
   margin-bottom: 0.53mm; /* 2px */
   display: inline-block;
}

.id-card-photo-section {
   position: absolute;
   top: 14.55mm; /* 55px */
   left: 50%;
   transform: translateX(-50%);
   z-index: 10;
}

.id-card-photo-frame {
   width: 23.81mm; /* 90px */
   height: 23.81mm; /* 90px */
   border-radius: 50%;
   background: #f8f9fa;
   padding: 0.79mm; /* 3px */
   position: relative;
}

.id-card-photo-bg {
   border: 0.53mm solid #2a5298; /* 2px */
   padding: 0.53mm; /* 2px */
   border-radius: 50%;
   overflow: hidden;
   background: #f8f9fa;
   display: flex;
   align-items: center;
   justify-content: center;
   position: relative;
}

.id-card-photo {
   width: 100%;
   height: 100%;
   object-fit: cover;
   border-radius: 50%;
}

.id-card-info {
   position: absolute;
   top: 42mm; /* 145px */
   left: 4.23mm; /* 16px */
   right: 4.23mm; /* 16px */
   color: #2c3e50;
}

.id-card-student-name {
   text-align: center;
   padding-bottom: 1.75mm; /* 2px */
   margin-bottom: 2.38mm; /* 9px */
   border-bottom: 0.25mm solid #e3f2fd; /* 2px */
}

.id-card-student-text {
   font-size: 2.51mm; /* 9.5px */
   font-weight: 800;
   letter-spacing: 0.05mm; /* .2px */
   color: #2a5298;
}

.id-card-info-grid {
   display: grid;
   gap: 1.5mm; /* 8px */
}

.id-card-info-row {
   display: grid;
   grid-template-columns: 1fr auto 1fr;
   align-items: center;
   font-size: 2.38mm; /* 9px */
   line-height: 1.4;
}

.id-card-info-label {
   font-weight: 600;
   color: #37474f;
}

.id-card-info-separator {
   margin: 0 2.12mm; /* 0 8px */
   color: #90a4ae;
   font-weight: 500;
}

.id-card-info-value {
   color: #37474f;
   font-weight: 500;
   text-align: left;
}

/* Signature */
.id-card-signature {
   position: absolute;
   bottom: 11mm; /* 38px */
   right: 3.97mm; /* 15px */
   text-align: center;
}

.id-card-signature-img {
   height: 6.61mm; /* 25px */
   display: block;
   margin: 0 auto;
}

.id-card-signature-text {
   color: #37474f;
   font-size: 2.12mm; /* 8px */
   font-weight: 800;
   opacity: 0.9;
   letter-spacing: 0.08mm; /* 0.3px */
   display: block;
}

/* Footer */
.id-card-footer {
   position: absolute;
   bottom: 0;
   left: 0;
   right: 0;
   height: 6.75mm; /* 40px */
   background: linear-gradient(135deg, #2a5298 0%, #4a90e2 100%);
   border-radius: 50% 50% 0 0;
   padding: 0.05in 0.1in 0.05in 0.1in;
   text-align: center;
   display: flex;
   align-items: center;
   justify-content: center;
   word-wrap: break-word;
   overflow-wrap: break-word;
   hyphens: auto;
   color: white;
}

.id-card-address {
   font-size: 0.07in;
   font-weight: 400;
   opacity: 0.9;
   letter-spacing: 0.003in;
   line-height: 0.1in;
}

      /* Print Specific Styles */
      @media print {
        @page {
          size: 304.8mm 457.2mm !important; /* 12in x 18in */
          margin: 12.7mm !important; /* 0.5in */
        }
        
        body {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .print-container {
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          grid-template-rows: repeat(5, 1fr) !important;
          gap: 5mm !important;
          width: 279.4mm !important; /* 304.8mm - 25.4mm margin */
          height: 431.8mm !important; /* 457.2mm - 25.4mm margin */
          padding: 0 !important;
        }
        
        .dual-id-card-container {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .page-break {
          page-break-before: always !important;
        }
        
        .id-card {
          border: 1px solid #2a5298 !important;
        }
        
        /* Ensure images print properly */
        img {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;
  }
  private titleCase(str: string): string {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private getClassSuffix(cls: number): string {
    if (!cls) return '';
    if (cls === 1) return 'st';
    if (cls === 2) return 'nd';
    if (cls === 3) return 'rd';
    return 'th';
  }

  processData() {
    this.processedData = [];
    if (this.admitCardStrInfo && this.admitCardStrInfo.examDate) {
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
              admissionNo: studentInfo.admissionNo,
              mobile: studentInfo.mobile,
              photo: studentInfo.photo
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