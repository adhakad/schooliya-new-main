import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { read, utils, writeFile } from 'xlsx';
import { ExamResultService } from 'src/app/services/exam-result.service';
import { MatRadioChange } from '@angular/material/radio';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { environment } from 'src/environments/environment';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { ExamResultStructureService } from 'src/app/services/exam-result-structure.service';
import { SchoolService } from 'src/app/services/school.service';
import { ClassService } from 'src/app/services/class.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-student-marksheet',
  templateUrl: './admin-student-marksheet.component.html',
  styleUrls: ['./admin-student-marksheet.component.css']
})
export class AdminStudentMarksheetComponent implements OnInit {
  public baseUrl = environment.API_URL;
  showModal: boolean = false;
  showBulkResultPrintModal: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  errorMsg: String = '';
  statusCode: Number = 0;
  templateStatusCode: Number = 0;
  errorCheck: Boolean = false;
  schoolInfo: any;
  marksheetTemplateStructureInfo: any;
  resultStructureInfo: any;
  allExamResults: any[] = [];
  examResultInfo: any[] = [];
  mappedResults: any[] = [];
  studentInfo: any;
  recordLimit: number = 10;
  filters: any = {};
  number: number = 0;
  paginationValues: Subject<any> = new Subject();
  page: Number = 0;
  cls: number = 0;
  classInfo: any[] = [];
  classSubjectList: any;
  fileChoose: boolean = false;
  existRollnumber: number[] = [];
  bulkResult: any[] = [];
  selectedExam: any = '';
  stream: string = '';
  notApplicable: string = "stream";
  examType: any[] = [];
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  loader: Boolean = false;
  adminId!: string;
  constructor(public activatedRoute: ActivatedRoute, private router: Router, private toastr: ToastrService, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private printPdfService: PrintPdfService, private examResultService: ExamResultService, private classService: ClassService, private examResultStructureService: ExamResultStructureService) {
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
        this.getSingleClassResultStrucByStream();
        this.getStudentExamResultByClass();
      } else {
        this.cls = 0;
        this.stream = '';
      }
    });
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
      this.updateRouteParams();
      this.getSingleClassResultStrucByStream();
      this.getStudentExamResultByClass();
    }
    if (cls == 11 || cls == 12) {
      if (this.stream == 'stream') {
        this.stream = '';
      }
      this.updateRouteParams();
      this.getSingleClassResultStrucByStream();
      this.getStudentExamResultByClass();
    }
  }
  filterStream(stream: any) {
    this.stream = stream;
    if (stream && this.cls) {
      this.updateRouteParams();
      this.getSingleClassResultStrucByStream();
      this.getStudentExamResultByClass();
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
  deleteMarksheetResultModel(id: String) {
    this.showModal = true;
    this.deleteMode = true;
    this.deleteById = id;
  }

  falseFormValue() {

  }
  falseAllValue() {
    this.falseFormValue();
  }

  closeModal() {
    this.falseAllValue();
    this.deleteMode = false;
    this.errorMsg = '';
    this.selectedExam = '';
    this.showModal = false;
    this.showBulkResultPrintModal = false;
  }

  successDone(msg: any) {
    this.closeModal();
    this.getSingleClassResultStrucByStream();
    this.getStudentExamResultByClass();
    setTimeout(() => {
      this.toastr.success(msg, 'Success');
    }, 500)
  }

  bulkPrint() {
    this.showBulkResultPrintModal = true;
  }

  getStudentExamResultByClass() {
    let params = {
      class: this.cls,
      adminId: this.adminId,
      stream: this.stream
    }
    this.examResultService.getAllStudentExamResultByClass(params).subscribe((res: any) => {
      if (res) {
        this.errorCheck = false;
        // this.statusCode = 200;
        this.examResultInfo = res.examResultInfo;
        this.studentInfo = res.studentInfo;
        let isDate = res.isDate;
        let marksheetTemplateStructure = res.marksheetTemplateStructure;
        const gradeMinMarks = marksheetTemplateStructure.examStructure.term1.gradeMinMarks.map((grade: any) => Object.values(grade)[0]);
        const gradeMaxMarks = marksheetTemplateStructure.examStructure.term1.gradeMaxMarks.map((grade: any) => Object.values(grade)[0]);
        const mapExamResultsToStudents = (examResults: any, studentInfo: any) => {
          const studentInfoMap = studentInfo.reduce((acc: any, student: any) => {
            acc[student._id] = student;
            return acc;
          }, {});
          return examResults.map((result: any) => {
            const student = studentInfoMap[result.studentId];
            if (marksheetTemplateStructure.templateName == 'T3' || marksheetTemplateStructure.templateName == 'T4' || marksheetTemplateStructure.templateName == 'T5' || marksheetTemplateStructure.templateName == 'T6') {
              let overallMarksAndGrades = this.calculateAverageMarksAndGrades(result.resultDetail.term1.marks, result.resultDetail.term2.marks, result.resultDetail.term1.totalMaxMarks, result.resultDetail.term1.totalMaxMarks, marksheetTemplateStructure.examStructure.term1.gradeMinMarks, marksheetTemplateStructure.examStructure.term1.gradeMaxMarks);
              result.resultDetail.overallMarksAndGrades = overallMarksAndGrades;
            }
            return {
              session: student.session,
              adminId: result.adminId,
              studentId: result.studentId,
              resultId: result._id,
              class: result.class,
              stream: result.stream,
              dob: student.dob,
              marksheetTemplateStructure: marksheetTemplateStructure,
              gradeMinMarks,
              gradeMaxMarks,
              resultDetail: result.resultDetail,
              status: result.status || "",
              name: student.name,
              fatherName: student.fatherName,
              motherName: student.motherName,
              rollNumber: student.rollNumber,
              admissionNo: student.admissionNo,
              isDate: isDate,
            };
          });
        };
        let mappedResults = mapExamResultsToStudents(this.examResultInfo, this.studentInfo);
        this.mappedResults = mappedResults.sort((a: any, b: any) => a.name.localeCompare(b.name));
        this.statusCode = 200;
      }
    }, err => {
      this.errorCheck = true;
      this.statusCode = err.status;
    })
    setTimeout(() => {
      this.loader = false;
    }, 1000);
  }
  private getGrade(averageMarks: any, gradeMinMarks: any, gradeMaxMarks: any) {
    const roundedMarks = Math.round(parseFloat(averageMarks));
    const grade = gradeMaxMarks.reduce((grade: string, gradeRange: any, i: number) => {
      const maxMarks = parseFloat(String(Object.values(gradeRange)[0]));
      const minMarks = parseFloat(String(Object.values(gradeMinMarks[i])[0]));
      return roundedMarks >= minMarks && roundedMarks <= maxMarks ? Object.keys(gradeRange)[0] : grade;
    }, '');
    return grade;
  }
  private calculateAverageMarksAndGrades(term1: any[], term2: any[], term1TotalMaxMarks: number, term2TotalMaxMarks: number, gradeMinMarks: any[], gradeMaxMarks: any[]) {
    const subjects: { [key: string]: number[] } = {};

    // Collect marks for all subjects from both terms in a single pass
    const allTerms = [...term1, ...term2];
    allTerms.forEach((mark: any) => {
      if (!subjects[mark.subject]) {
        subjects[mark.subject] = [];
      }
      subjects[mark.subject].push(mark.totalMarks);
    });
    // Calculate average marks and grades for each subject
    const averageGradesAndMarks = Object.keys(subjects).map(subject => {
      const totalMarks = subjects[subject].reduce((acc, val) => acc + val, 0);
      const averageMarks = totalMarks / subjects[subject].length;
      const grade = this.getGrade(averageMarks, gradeMinMarks, gradeMaxMarks);

      return {
        subject,
        averageMarks,
        grade
      };
    });

    // Calculate total marks for each term
    const term1TotalMarks = term1.reduce((acc: number, mark: any) => acc + mark.totalMarks, 0);
    const term2TotalMarks = term2.reduce((acc: number, mark: any) => acc + mark.totalMarks, 0);
    const totalMarks = term1TotalMarks + term2TotalMarks;
    let averageTotalMarks = totalMarks / 2;
    const averageTotalMaxMarks = (term1TotalMaxMarks + term2TotalMaxMarks) / 2;
    const averagePercentile = parseFloat(((averageTotalMarks / averageTotalMaxMarks) * 100).toFixed(2));
    const averagePercentileGrade = this.getGrade(averagePercentile, gradeMinMarks, gradeMaxMarks);
    return {
      averageGradesAndMarks,
      averageTotalMaxMarks,
      averageTotalMarks: (averageTotalMarks).toFixed(2),
      averagePercentile,
      averagePercentileGrade
    };
  }


  printStudentData() {
    const printContent = this.getPrintOneAdmitCardContent();
    this.printPdfService.printContent(printContent);
    this.closeModal();
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
    printHtml += '.address p{font-size:18px;margin-top: -15px !important;}';
    printHtml += '.title-lable {text-align: center;margin-top: 0px;margin-bottom: 0;}';
    printHtml += '.title-lable p {color: #0a0a0a !important;font-size: 22px;font-weight: bold;letter-spacing: .5px;}';



    printHtml += '.info-table {width:100%;color: #0a0a0a !important;border: none;font-size: 18px;margin-top: 1.20vh;margin-bottom: 1vh;display: inline-table;}';
    printHtml += '.table-container .info-table th, .table-container .info-table td{color: #0a0a0a !important;text-align:left;padding-left:15px;padding-top:5px;padding-bottom:5px;}';

    printHtml += '.custom-table {width: 100%;color: #0a0a0a !important;border-collapse:collapse;margin-bottom: 20px;display: inline-table;border-radius:5px}';
    printHtml += '.custom-table th{min-height: 48px;text-align: center;border:1px solid #707070;line-height:25px;font-size: 18px;}';
    printHtml += '.custom-table tr{height: 48px;}';
    printHtml += '.custom-table td {text-align: center;border:1px solid #707070;font-size: 18px;}';
    printHtml += '.text-bold { font-weight: bold;}';
    printHtml += '.text-left { text-align: left;}';
    printHtml += 'p {color: #0a0a0a !important;font-size:19px;}'
    printHtml += 'h4 {color: #0a0a0a !important;}'
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

    this.mappedResults.forEach((student, index) => {
      const studentElement = document.getElementById(`student-${student.studentId}`);
      if (studentElement) {
        printHtml += studentElement.outerHTML;

        // Add a page break after each student except the last one
        if (index < this.mappedResults.length - 1) {
          printHtml += '<div style="page-break-after: always;"></div>';
        }
      }
    });
    printHtml += '</body></html>';
    return printHtml;
  }

  getSingleClassResultStrucByStream() {
    let params = {
      cls: this.cls,
      adminId: this.adminId,
      stream: this.stream
    }
    this.examResultStructureService.getSingleClassResultStrucByStream(params).subscribe((res: any) => {
      if (res) {
        this.errorCheck = false;
        this.templateStatusCode = 200;
        this.marksheetTemplateStructureInfo = res;
        this.examType = Object.keys(res.marksheetTemplateStructure.examStructure);
      }
    }, err => {
      this.errorCheck = true;
      this.templateStatusCode = err.status;
      this.falseAllValue();
    })
  }

  marksheetResultDelete(id: String) {
    this.examResultService.deleteMarksheetResult(id).subscribe((res: any) => {
      if (res) {
        this.successDone(res);
        this.deleteById = '';
      }
    })
  }
}
