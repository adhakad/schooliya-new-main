import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { read, utils, writeFile } from 'xlsx';
import * as ExcelJS from 'exceljs';
import { Subject } from 'rxjs';
import { AcademicSessionService } from 'src/app/services/academic-session.service';
import { StudentService } from 'src/app/services/student.service';
import { ClassService } from 'src/app/services/class.service';
import { MatRadioChange } from '@angular/material/radio';
import { ExcelService } from 'src/app/services/excel/excel.service';
import { SchoolService } from 'src/app/services/school.service';
import { HttpClient } from '@angular/common/http';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {
  @ViewChild('content') content!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  studentForm: FormGroup;
  excelForm: FormGroup;
  showModal: boolean = false;
  showBulkImportModal: boolean = false;
  showBulkExportModal: boolean = false;
  showStudentInfoViewModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  statusCode: Number = 0;
  academicSession!: string;
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
  notApplicable: string = "stream";
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  cls: number = 0;
  className: any;
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
  baseURL!: string;
  adminId!: String
  selectedSession: string = '';
  classMap: any = {
    200: 'Nursery',
    201: 'LKG',
    202: 'UKG',
    // अन्य क्लासेज़ भी यहाँ मैप करें
  };
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private toastr: ToastrService, private academicSessionService: AcademicSessionService, private printPdfService: PrintPdfService, private schoolService: SchoolService, public ete: ExcelService, private adminAuthService: AdminAuthService, private classService: ClassService, private classSubjectService: ClassSubjectService, private studentService: StudentService) {
    this.studentForm = this.fb.group({
      _id: [''],
      session: ['', Validators.required],
      medium: ['', Validators.required],
      adminId: [''],
      admissionNo: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      admissionType: [''],
      class: [''],
      admissionClass: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      stream: [''],
      rollNumber: ['', [Validators.required, Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      dob: ['', Validators.required],
      doa: ['', Validators.required],
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
      familyAnnualIncome: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      feesConcession: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      createdBy: [''],
    })

    this.excelForm = this.fb.group({
      excelData: [null],
    });
  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.loader = false;
    this.getSchool();
    this.getAcademicSession();
    this.getClass();
    this.allOptions();
    var currentURL = window.location.href;
    this.baseURL = new URL(currentURL).origin;
  }
  getAcademicSession() {
    this.academicSessionService.getAcademicSession().subscribe((res: any) => {
      if (res) {
        this.academicSession = res.academicSession;
        this.selectedSession = res.academicSession;
      }
    })
  }
  filterSession(selectedSession: any) {
    this.errorCheck = true;
    this.errorMsg = '';
    this.selectedSession = selectedSession;
    // this.getFeesStructureBySession(this.adminId, selectedSession);
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
    if (cls !== 11 && cls !== 12) {
      this.stream = this.notApplicable;
      this.studentInfo = [];
      this.getStudents({ page: 1 });
    }
    if (cls == 11 || cls == 12) {
      if (this.stream == 'stream') {
        this.stream = '';
      }
      this.studentInfo = [];
      this.getStudents({ page: 1 });
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
      this.getStudents({ page: 1 });
    }
  }

  date(e: any) {
    var convertDate = new Date(e.target.value).toISOString().substring(0, 10);
    this.studentForm.get('dob')?.setValue(convertDate, {
      onlyself: true,
    });
  }
  onChange(event: MatRadioChange) {
    this.selectedValue = event.value;
  }
  closeModal() {
    this.showModal = false;
    this.showBulkImportModal = false;
    this.showBulkExportModal = false;
    this.showStudentInfoViewModal = false;
    this.updateMode = false;
    this.deleteMode = false;
    this.fileChoose = false;
    this.errorCheck = false;
    this.errorMsg = '';
    this.successMsg = '';
    this.classSubject = [];
    this.promotedClass;
    this.singleStudentInfo;
    this.singleStudentTCInfo;
    this.admissionType = '';
    this.resetFileInput();
    this.studentForm.reset();
    this.excelForm.reset();
  }
  addStudentModel() {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = false;
    this.studentForm.reset();
    this.classStreamFormValueSet();
    this.studentForm.get('session')?.setValue(this.academicSession);
  }
  classStreamFormValueSet() {
    let cls = '';
    if (this.className == 1) {
      cls = `${this.className}st`;
    }
    if (this.className == 2) {
      cls = `${this.className}nd`;
    }
    if (this.className == 3) {
      cls = `${this.className}rd`;
    }
    if (this.className >= 4 && this.className <= 12) {
      cls = `${this.className}th`;
    }
    if (this.className == 200) {
      cls = `Nursery`;
    }
    if (this.className == 201) {
      cls = `LKG`;
    }
    if (this.className == 202) {
      cls = `UKG`;
    }
    this.studentForm.get('class')?.setValue(cls);
    if (this.cls < 11 && this.cls !== 0 || this.cls == 200 || this.cls == 201 || this.cls == 202) {
      this.studentForm.get('stream')?.setValue("N/A");
    }
    if (this.cls == 12 || this.cls == 11) {
      this.studentForm.get('stream')?.setValue(this.stream);
    }
  }
  addBulkStudentImportModel() {
    this.showBulkImportModal = true;
    this.errorCheck = false;
  }
  addBulkStudentExportModel() {
    this.showBulkExportModal = true;
    this.errorCheck = false;
    this.getStudentByClass(this.className);
  }

  addStudentInfoViewModel(student: any) {
    this.showStudentInfoViewModal = true;
    this.singleStudentInfo = student;
  }
  updateStudentModel(student: any) {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = true;
    const dobArray = student.dob.split('/');
    const doaArray = student.doa.split('/');

    const dobISO = new Date(`${dobArray[2]}/${dobArray[1]}/${dobArray[0]}`);
    const doaISO = new Date(`${doaArray[2]}/${doaArray[1]}/${doaArray[0]}`);

    // Patch the form with the student data
    this.studentForm.patchValue({
      _id: student._id,
      session: student.session,
      medium: student.medium,
      adminId: student.adminId,
      admissionNo: student.admissionNo,
      admissionType: student.admissionType,
      class: student.class,
      admissionClass: student.admissionClass,
      stream: student.stream,
      rollNumber: student.rollNumber,
      name: student.name,
      dob: dobISO,
      doa: doaISO,
      aadharNumber: student.aadharNumber,
      samagraId: student.samagraId,
      udiseNumber: student.udiseNumber,
      bankAccountNo: student.bankAccountNo,
      bankIfscCode: student.bankIfscCode,
      gender: student.gender,
      category: student.category,
      religion: student.religion,
      nationality: student.nationality,
      address: student.address,
      lastSchool: student.lastSchool,
      fatherName: student.fatherName,
      fatherQualification: student.fatherQualification,
      fatherOccupation: student.fatherOccupation,
      motherName: student.motherName,
      motherQualification: student.motherQualification,
      motherOccupation: student.motherOccupation,
      parentsContact: student.parentsContact,
      familyAnnualIncome: student.familyAnnualIncome,
      feesConcession: student.feesConcession,
      createdBy: student.createdBy
    });
    const classValue = student.class;
    if (classValue && this.classMap[classValue]) {
      this.studentForm.patchValue({
        class: this.classMap[classValue], // यहाँ क्लास की वैल्यू को टेक्स्ट में बदलकर सेट करें

      });
    }
    if (this.updateMode) {
      this.studentForm.get('feesConcession')?.disable();
      this.studentForm.get('session')?.disable();  // Disable in edit mode
    }
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
  successDone(msg:any) {
    this.closeModal();
    this.successMsg = '';
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


  studentAddUpdate() {
    if (this.studentForm.valid) {
      this.studentForm.value.adminId = this.adminId;
      this.studentForm.value.class = this.className;

      if (this.updateMode) {

        const classText = this.studentForm.get('class')?.value;

        // टेक्स्ट को ओरिजिनल वैल्यू (जैसे 200, 201, 202) में कन्वर्ट करें
        const classValue = Object.keys(this.classMap).find(key => this.classMap[key] === classText);

        // अगर वैल्यू मिली, तो उसे फॉर्म में अपडेट करें ताकि सही वैल्यू डेटाबेस में जाए
        if (classValue) {
          this.studentForm.patchValue({
            class: classValue
          });
        }
        const dob = new Date(this.studentForm.get('dob')?.value);
        const formattedDob = `${String(dob.getDate()).padStart(2, '0')}/${String(dob.getMonth() + 1).padStart(2, '0')}/${dob.getFullYear()}`;

        const doa = new Date(this.studentForm.get('doa')?.value);
        const formattedDoa = `${String(doa.getDate()).padStart(2, '0')}/${String(doa.getMonth() + 1).padStart(2, '0')}/${doa.getFullYear()}`;

        // Prepare the final form data
        const formData = {
          ...this.studentForm.value,
          dob: formattedDob, // Convert back to 'dd-mm-yyyy'
          doa: formattedDoa  // Convert back to 'dd-mm-yyyy'
        };


        this.studentService.updateStudent(formData).subscribe((res: any) => {
          if (res) {
            this.successDone(res);
          }
        }, err => {
          this.errorCheck = true;
          this.errorMsg = err.error;
        })
      } else {
        this.studentForm.value.admissionType = 'Old';
        this.studentForm.value.createdBy = 'Admin';
        this.studentService.addStudent(this.studentForm.value).subscribe((res: any) => {
          if (res) {
            this.successDone(res);
          }
        }, err => {
          this.errorCheck = true;
          this.errorMsg = err.error;
        })
      }
    }
  }
  changeStatus(id: any, statusValue: any) {
    if (id) {
      let params = {
        id: id,
        statusValue: statusValue,
      }
      this.studentService.changeStatus(params).subscribe((res: any) => {
        if (res) {
          this.getStudents({ page: this.page });
        }
      })
    }
  }
  studentDelete(id: String) {
    this.studentService.deleteStudent(id).subscribe((res: any) => {
      if (res) {
        this.successDone(res);
        this.deleteById = '';
      }
    })
  }

  handleImport(event: any): void {
    const file = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      const arrayBuffer = e.target.result;
      this.parseExcel(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(file);
  }
  resetFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
  parseExcel(arrayBuffer: any): void {
    const workbook = new ExcelJS.Workbook();
    workbook.xlsx.load(arrayBuffer).then((workbook) => {
      const worksheet = workbook.getWorksheet(1);
      const data: any = [];
      worksheet!.eachRow({ includeEmpty: false }, (row: any, rowNumber) => {
        // Assuming the first row contains headers
        if (rowNumber === 1) {
          const headers = row.values.map(String);
          data.push(headers);
        } else {
          const rowData = row.values.map(String);
          data.push(rowData);
        }
      });
      const lastIndex = data.length - 1;
      const indexesToDelete = [0, lastIndex];
      // IndexesToDelete ke hisab se elements ko delete karna
      indexesToDelete.sort((a, b) => b - a); // Sort indexesToDelete in descending order
      indexesToDelete.forEach((index) => {
        data.splice(index, 1);
      });
      const fields = data[0];
      // Data ke baki ke rows
      const dataRows = data.slice(1);
      // Data ko objects mein map karna
      const mappedData = dataRows.map((row: any) => {
        const obj: any = {};
        fields.forEach((field: any, index: any) => {
          obj[field] = row[index];
        });
        return obj;
      });

      function transformKeys(dataArray: any) {
        return dataArray.map((obj: any) => {
          const newObj: any = {};
          for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
              const newKey = key.replace(/\s+/g, ''); // Remove spaces
              newObj[newKey.charAt(0).toLowerCase() + newKey.slice(1)] = obj[key];
            }
          }
          return newObj;
        });
      }
      // Transform the keys of the array
      const transformedDataArray = transformKeys(mappedData);
      if (transformedDataArray.length > 100) {
        this.fileChoose = false;
        this.errorCheck = true;
        this.errorMsg = 'File too large, Please make sure that file records to less then or equals to 100';
      }
      if (transformedDataArray.length <= 100) {
        this.bulkStudentRecord = transformedDataArray;
        this.fileChoose = true;
        this.errorCheck = false;
        this.errorMsg = '';
      }
    });
  }
  addBulkStudentRecord() {
    let studentRecordData = {
      bulkStudentRecord: this.bulkStudentRecord,
      session: this.selectedSession,
      class: this.className,
      stream: this.stream,
      adminId: this.adminId,
      createdBy: 'Admin',

    }
    if (studentRecordData) {
      this.studentService.addBulkStudentRecord(studentRecordData).subscribe((res: any) => {
        if (res) {
          this.successDone(res);
        }
      }, err => {
        this.errorCheck = true;
        this.errorMsg = err.error;
      })
    }
  }


  async exportToExcel() {
    let className = this.className;
    if (className == 1) {
      className = `${this.className}st`;
    }
    if (className == 2) {
      className = `${this.className}nd`;
    }
    if (className == 3) {
      className = `${this.className}rd`;
    }
    if (className >= 4 && className <= 12) {
      className = `${this.className}th`;
    }
    if (className == 200) {
      className = `Nursery`;
    }
    if (className == 201) {
      className = `LKG`;
    }
    if (className == 202) {
      className = `UKG`;
    }
    let samagraId = 'samagraId' //dynamic field add testing
    const header: string[] = [
      'admissionNo',
      'name',
      'fatherName',
      'motherName',
      'rollNumber',
      'medium',
      'feesConcession',
      'aadharNumber',
      samagraId,
      'dob',
      'doa',
      'admissionType',
      'admissionClass',
      'gender',
      'category',
      'religion',
      'nationality',
      'address',
      'udiseNumber',
      'bankAccountNo',
      'bankIfscCode',
      'fatherQualification',
      'motherQualification',
      'fatherOccupation',
      'motherOccupation',
      'parentsContact',
      'familyAnnualIncome',
    ];
    function toTitleCase(str: string) {
      return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
    }
    function orderObjectsByHeaders(studentInfoByClass: any, header: any, selectedSession: string) {
      const filteredData = studentInfoByClass.filter((obj: any) => obj.session === selectedSession);
      return filteredData.map((obj: any) => {
        const orderedObj: any = {};
        header.forEach((header: any) => {
          let value = obj[header];
          if (["name", "fatherName", "motherName"].includes(header) && typeof value === "string") {
            value = toTitleCase(value);
          }
          orderedObj[header] = value;
        });
        return orderedObj;
      });
    }
    const orderedData = await orderObjectsByHeaders(this.studentInfoByClass, header, this.selectedSession);
    const modifiedHeader = header.map(field =>
      field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    );

    let reportData = {
      title: `${this.schoolInfo?.schoolName}, Student Record Class - ${className}, ${this.selectedSession}`,
      data: orderedData,
      headers: modifiedHeader,
      fileName: `Student Class - ${className}, ${this.selectedSession}, ${this.schoolInfo?.schoolName}`,
    };

    this.ete.exportExcel(reportData);
    this.successDone("Student Data Exported Successfully");
  }

  allOptions() {
    this.sessions = [{ year: '2023-2024' }, { year: '2024-2025' }, { year: '2025-2026' }, { year: '2026-2027' }, { year: '2027-2028' }, { year: '2028-2029' }, { year: '2029-2030' }]
    this.categorys = [{ category: 'General' }, { category: 'OBC' }, { category: 'SC' }, { category: 'ST' }, { category: 'EWS' }, { category: 'Other' }]
    this.religions = [{ religion: 'Hinduism' }, { religion: 'Buddhism' }, { religion: 'Christanity' }, { religion: 'Jainism' }, { religion: 'Sikhism' }, { religion: 'Aninism / Adivasi' }, { religion: 'Islam' }, { religion: 'Baha I faith ' }, { religion: 'Judaism' }, { religion: 'Zoroastrianism' }, { religion: 'Other' }]
    this.qualifications = [{ qualification: 'Doctoral Degree' }, { qualification: 'Masters Degree' }, { qualification: 'Graduate Diploma' }, { qualification: 'Graduate Certificate' }, { qualification: 'Graduate Certificate' }, { qualification: 'Bachelor Degree' }, { qualification: 'Advanced Diploma' }, { qualification: 'Primary School' }, { qualification: 'High School' }, { qualification: 'Higher Secondary School' }, { qualification: 'Illiterate' }, { qualification: 'Other' }]
    this.occupations = [{ occupation: 'Agriculture(Farmer)' }, { occupation: 'Laborer' }, { occupation: 'Self Employed' }, { occupation: 'Private Job' }, { occupation: 'State Govt. Employee' }, { occupation: 'Central Govt. Employee' }, { occupation: 'Military Job' }, { occupation: 'Para-Military Job' }, { occupation: 'PSU Employee' }, { occupation: 'Other' }]
    this.mediums = [{ medium: 'Hindi' }, { medium: 'English' }]
  }
}