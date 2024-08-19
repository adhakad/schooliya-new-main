import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { read, utils, writeFile } from 'xlsx';
import { ExamResultService } from 'src/app/services/exam-result.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { StudentService } from 'src/app/services/student.service';
import { ExamResultStructureService } from 'src/app/services/exam-result-structure.service';
import { SchoolService } from 'src/app/services/school.service';
import { ClassService } from 'src/app/services/class.service';

@Component({
  selector: 'app-admin-student-marksheet-result-add',
  templateUrl: './admin-student-marksheet-result-add.component.html',
  styleUrls: ['./admin-student-marksheet-result-add.component.css']
})
export class AdminStudentMarksheetResultAddComponent implements OnInit {
  examResultForm: FormGroup;
  showModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
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
  cls: any;
  classSubjectList: any;
  selectedValue: number = 0;
  theorySubjects: any[] = [];
  practicalSubjects: any[] = [];
  periodicTestSubjects: any[] = [];
  noteBookSubjects: any[] = [];
  subjectEnrichmentSubjects: any[] = [];
  coScholastic: any[] = [];
  theoryMaxMarks: any;
  practicalMaxMarks: any;
  periodicTestMaxMarks: any;
  noteBookMaxMarks: any;
  subjectEnrichmentMaxMarks: any;




  fileChoose: boolean = false;
  existRollnumber: number[] = [];
  bulkResult: any[] = [];
  selectedExam: any = '';
  selectedRollNumber !: number;
  stream: any;
  notApplicable: String = "stream";
  examType: any[] = [];
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  coScholasticGrades: any[] = ['A', 'B', 'C'];
  loader: Boolean = false;
  adminId!: string;
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private adminAuthService: AdminAuthService, private schoolService: SchoolService, private printPdfService: PrintPdfService, private examResultService: ExamResultService, private classService: ClassService, private examResultStructureService: ExamResultStructureService, private studentService: StudentService) {
    this.examResultForm = this.fb.group({
      adminId: [''],
      rollNumber: [''],
      examType: ['', Validators.required],
      stream: [''],
      class: [''],
      createdBy: [''],
      resultDetail: [''],
      type: this.fb.group({
        theoryMarks: this.fb.array([]),
        practicalMarks: this.fb.array([]),
        periodicTestMarks: this.fb.array([]),
        noteBookMarks: this.fb.array([]),
        subjectEnrichmentMarks: this.fb.array([]),
        coScholastic: this.fb.array([]),
      }),
    });
  }




  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.cls = this.activatedRoute.snapshot.paramMap.get('class');
    this.stream = this.activatedRoute.snapshot.paramMap.get('stream');
    if (this.stream && this.cls) {
      let params = {
        adminId: this.adminId,
        cls: this.cls,
        stream: this.stream,
      }
      this.getStudentExamResultByClassStream(params);
      this.getSingleClassResultStrucByStream(params);
    }
  }

  addExamResultModel(rollnumber: number) {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = false;
    this.examResultForm.reset();
    if (rollnumber !== 0) {
      this.selectedRollNumber = rollnumber;
    }

  }
  deleteExamResultModel(id: String) {
    this.showModal = true;
    this.updateMode = false;
    this.deleteMode = true;
    this.deleteById = id;
  }

  falseFormValue() {
    const controlOne = <FormArray>this.examResultForm.get('type.theoryMarks');
    const controlTwo = <FormArray>this.examResultForm.get('type.practicalMarks');
    const controlThree = <FormArray>this.examResultForm.get('type.periodicTestMarks');
    const controlFour = <FormArray>this.examResultForm.get('type.noteBookMarks');
    const controlFive = <FormArray>this.examResultForm.get('type.subjectEnrichmentMarks');
    const controlSix = <FormArray>this.examResultForm.get('type.coScholastic');
    controlOne.clear();
    controlTwo.clear();
    controlThree.clear();
    controlFour.clear();
    controlFive.clear();
    controlSix.clear();
  }
  falseAllValue() {
    this.falseFormValue();
    this.practicalSubjects = [];
    this.periodicTestSubjects = [];
    this.noteBookSubjects = [];
    this.subjectEnrichmentSubjects = [];
    this.theorySubjects = [];
    this.coScholastic = [];
  }

  closeModal() {
    this.falseAllValue();
    this.updateMode = false;
    this.deleteMode = false;
    this.errorMsg = '';
    this.selectedExam = '';
    this.examResultForm.reset();
    this.showModal = false;
    if (this.stream && this.cls) {
      let params = {
        adminId: this.adminId,
        cls: this.cls,
        stream: this.stream,
      }
      this.getStudentExamResultByClassStream(params);
      this.getSingleClassResultStrucByStream(params);
    }
  }

  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      if (this.stream && this.cls) {
        let params = {
          adminId: this.adminId,
          cls: this.cls,
          stream: this.stream,
        }
        this.getStudentExamResultByClassStream(params);
        this.getSingleClassResultStrucByStream(params);
      }
    }, 1000)
  }


  getStudentExamResultByClassStream(params: any) {
    let param = {
      class: params.cls,
      stream: params.stream,
      adminId: this.adminId,
    }
    this.examResultService.getAllStudentExamResultByClassStream(param).subscribe((res: any) => {
      if (res) {
        this.examResultInfo = res.examResultInfo;
        this.studentInfo = res.studentInfo;
        if (res.examResultInfo == 0) {
          this.examResultInfo = [];
          this.examResultInfo = res.studentInfo;
        }

        // console.log(`examResultInfo:`, this.examResultInfo)
        console.log(`studentInfo:`, this.studentInfo)
        let isDate = res.isDate;
        let marksheetTemplateStructure = res.marksheetTemplateStructure;
        let examType = Object.keys(marksheetTemplateStructure.examStructure);
        const mapExamResultsToStudents = (studentInfo: any) => {
          return studentInfo.map((student: any) => {

            let exams: any = {};


            let resultDetail = res.examResultInfo ==0? this.examResultInfo.find(info => info._id === student._id)?.resultDetail || {}:this.examResultInfo.find(info => info.studentId === student._id)?.resultDetail || {};


            examType.forEach((exam: any) => {
              exams[exam] = resultDetail[exam] ? "present" : "empty";
            });
            return {
              session: student.session,
              adminId: student.adminId,
              studentId: student._id,
              class: student.class,
              stream: student.stream,
              dob: student.dob,
              marksheetTemplateStructure: marksheetTemplateStructure,
              examType: examType,
              examTypeResultExist: examType.map((exam: any) => exams[exam]),
              name: student.name,
              fatherName: student.fatherName,
              motherName: student.motherName,
              rollNumber: student.rollNumber,
              admissionNo: student.admissionNo,
              isDate: isDate,
            };
          });
        };

        this.mappedResults = mapExamResultsToStudents(this.studentInfo);
        console.log(`mappedResults:`, this.mappedResults)
      }
    }, err => {
      console.log("error")
      console.log(err.error)
    })
    setTimeout(() => {
      this.loader = false;
    }, 1000);
  }

  selectExam(selectedExam: string) {
    if (this.theorySubjects || this.practicalSubjects || this.periodicTestSubjects || this.noteBookSubjects || this.subjectEnrichmentSubjects) {
      this.falseAllValue();
    }
    this.selectedExam = selectedExam;
    const examFilteredData = this.marksheetTemplateStructureInfo.marksheetTemplateStructure.examStructure[selectedExam];
    let subjects = this.marksheetTemplateStructureInfo.classSubjectList.subject;
    this.practicalSubjects = [];
    this.periodicTestSubjects = [];
    this.noteBookSubjects = [];
    this.subjectEnrichmentSubjects = [];
    this.coScholastic = [];

    if (examFilteredData.theoryMaxMarks) {
      this.theorySubjects = subjects.map((item: any) => {
        const theorySubject = Object.values(item)[0];
        return theorySubject;
      })
      if (this.theorySubjects) {
        this.theoryMaxMarks = examFilteredData.theoryMaxMarks;
        this.patchTheory();
      }
    }
    if (examFilteredData.practicalMaxMarks) {
      this.practicalSubjects = subjects.map((item: any) => {
        const practicalSubject = Object.values(item)[0];
        return practicalSubject;
      })
      if (this.practicalSubjects) {
        this.practicalMaxMarks = examFilteredData.practicalMaxMarks;
        this.patchPractical();
      }
    }
    if (examFilteredData.periodicTestMaxMarks) {
      this.periodicTestSubjects = subjects.map((item: any) => {
        const periodicTestSubject = Object.values(item)[0];
        return periodicTestSubject;
      })
      if (this.periodicTestSubjects) {
        this.practicalMaxMarks = examFilteredData.practicalMaxMarks;
        this.patchPeriodicTest();
      }
    }


    if (examFilteredData.noteBookMaxMarks) {
      this.noteBookSubjects = subjects.map((item: any) => {
        const noteBookSubject = Object.values(item)[0];
        return noteBookSubject;
      })
      if (this.noteBookSubjects) {
        this.noteBookMaxMarks = examFilteredData.noteBookMaxMarks;
        this.patchNoteBook();
      }
    }
    if (examFilteredData.subjectEnrichmentMaxMarks) {
      this.subjectEnrichmentSubjects = subjects.map((item: any) => {
        const subjectEnrichmentSubject = Object.values(item)[0];
        return subjectEnrichmentSubject;
      })
      if (this.subjectEnrichmentSubjects) {
        this.subjectEnrichmentMaxMarks = examFilteredData.subjectEnrichmentMaxMarks;
        this.patchSubjectEnrichment();
      }
    }
    if (examFilteredData.coScholastic) {
      this.coScholastic = examFilteredData.coScholastic;
      if (this.coScholastic) {
        this.patchCoScholastic();
      }
    }

    this.resultStructureInfo = {

      practicalMaxMarks: this.practicalSubjects.map((subject: any) => ({ [subject]: examFilteredData.practicalMaxMarks })),
      noteBookMaxMarks: this.noteBookSubjects.map((subject: any) => ({ [subject]: examFilteredData.noteBookMaxMarks })),
      periodicTestMaxMarks: this.periodicTestSubjects.map((subject: any) => ({ [subject]: examFilteredData.periodicTestMaxMarks })),
      subjectEnrichmentMaxMarks: this.subjectEnrichmentSubjects.map((subject: any) => ({ [subject]: examFilteredData.subjectEnrichmentMaxMarks })),
      theoryMaxMarks: this.theorySubjects.map((subject: any) => ({ [subject]: examFilteredData.theoryMaxMarks })),
      theoryPassMarks: this.theorySubjects.map((subject: any) => ({ [subject]: examFilteredData.theoryPassMarks })),
      gradeMaxMarks: examFilteredData.gradeMaxMarks,
      gradeMinMarks: examFilteredData.gradeMinMarks
    };


  }


  getSingleClassResultStrucByStream(params: any) {
    this.examResultStructureService.getSingleClassResultStrucByStream(params).subscribe((res: any) => {
      if (res) {
        this.marksheetTemplateStructureInfo = res;
        this.examType = Object.keys(res.marksheetTemplateStructure.examStructure);
      }
    }, err => {
      this.falseAllValue();
    })
  }


  patchTheory() {
    const controlOne = <FormArray>this.examResultForm.get('type.theoryMarks');
    this.theorySubjects.forEach((x: any) => {
      controlOne.push(this.patchTheoryValues(x));
    })
  }

  patchPractical() {
    const controlOne = <FormArray>this.examResultForm.get('type.practicalMarks');
    this.practicalSubjects.forEach((x: any) => {
      controlOne.push(this.patchPracticalValues(x))
    })
  }
  patchPeriodicTest() {
    const controlOne = <FormArray>this.examResultForm.get('type.periodicTestMarks');
    this.periodicTestSubjects.forEach((x: any) => {
      controlOne.push(this.patchPeriodicTestValues(x))
    })
  }
  patchNoteBook() {
    const controlOne = <FormArray>this.examResultForm.get('type.noteBookMarks');
    this.noteBookSubjects.forEach((x: any) => {
      controlOne.push(this.patchNoteBookValues(x))
    })
  }
  patchSubjectEnrichment() {
    const controlOne = <FormArray>this.examResultForm.get('type.subjectEnrichmentMarks');
    this.subjectEnrichmentSubjects.forEach((x: any) => {
      controlOne.push(this.patchSubjectEnrichmentValues(x))
    })
  }
  patchCoScholastic() {
    const controlOne = <FormArray>this.examResultForm.get('type.coScholastic');
    this.coScholastic.forEach((x: any) => {
      controlOne.push(this.patchCoScholasticValues(x))
    })
  }


  patchTheoryValues(theoryMarks: any) {
    return this.fb.group({
      [theoryMarks]: ['', [Validators.required, Validators.max(this.theoryMaxMarks), Validators.pattern('^[0-9]+$')]],
    })
  }

  patchPracticalValues(practicalMarks: any) {
    return this.fb.group({
      [practicalMarks]: ['', [Validators.required, Validators.max(this.practicalMaxMarks), Validators.pattern('^[0-9]+$')]],
    })
  }
  patchPeriodicTestValues(periodicTestMarks: any) {
    return this.fb.group({
      [periodicTestMarks]: ['', [Validators.required, Validators.max(periodicTestMarks), Validators.pattern('^[0-9]+$')]],
    })
  }
  patchNoteBookValues(noteBookMarks: any) {
    return this.fb.group({
      [noteBookMarks]: ['', [Validators.required, Validators.max(this.noteBookMaxMarks), Validators.pattern('^[0-9]+$')]],
    })
  }
  patchSubjectEnrichmentValues(subjectEnrichmentMarks: any) {
    return this.fb.group({
      [subjectEnrichmentMarks]: ['', [Validators.required, Validators.max(this.subjectEnrichmentMaxMarks), Validators.pattern('^[0-9]+$')]],
    })
  }
  patchCoScholasticValues(coScholastic: any) {
    return this.fb.group({
      [coScholastic]: ['', [Validators.required]],
    })
  }

  examResultAddUpdate() {
    const examResult = this.examResultForm.value.type;
    const countSubjectsBelowPassingMarks = (passMarks: any[], actualMarks: any[]): number => {
      return passMarks.reduce((count, passMarkSubject, index) => {
        const subject = Object.keys(passMarkSubject)[0];
        const passMark = parseInt(passMarkSubject[subject], 10);
        const actualMark = actualMarks[index] ? parseInt(actualMarks[index][subject], 10) : 0;
        return actualMark < passMark ? count + 1 : count;
      }, 0);
    };
    const count = countSubjectsBelowPassingMarks(this.resultStructureInfo.theoryPassMarks, examResult.theoryMarks);
    const resultStatus = count === 0 ? 'PASS' : count <= 2 ? 'SUPPLY' : 'FAIL';
    const calculateMaxMarks = (marksArray: any[]): number => {
      return marksArray.reduce((total, subjectMarks) => {
        const subjectName = Object.keys(subjectMarks)[0];
        return total + parseFloat(subjectMarks[subjectName]);
      }, 0);
    };
    const totalTheoryMaxMarks = calculateMaxMarks(this.resultStructureInfo.theoryMaxMarks);
    const totalPracticalMaxMarks = this.resultStructureInfo.practicalMaxMarks ? calculateMaxMarks(this.resultStructureInfo.practicalMaxMarks) : 0;
    const totalPeriodicTestMaxMarks = this.resultStructureInfo.periodicTestMaxMarks ? calculateMaxMarks(this.resultStructureInfo.periodicTestMaxMarks) : 0;
    const totalNoteBookMaxMarks = this.resultStructureInfo.noteBookMaxMarks ? calculateMaxMarks(this.resultStructureInfo.noteBookMaxMarks) : 0;
    const totalSubjectEnrichmentMaxMarks = this.resultStructureInfo.subjectEnrichmentMaxMarks ? calculateMaxMarks(this.resultStructureInfo.subjectEnrichmentMaxMarks) : 0;

    const totalMaxMarks = totalTheoryMaxMarks + totalPracticalMaxMarks + totalPeriodicTestMaxMarks + totalNoteBookMaxMarks + totalSubjectEnrichmentMaxMarks;
    const calculateGrades = (subjectMarks: any[], isPractical: boolean, isPeriodicTest: boolean, isNoteBook: boolean, isSubjectEnrichment: boolean) => {
      return subjectMarks.map((subjectMark) => {
        const subjectName = Object.keys(subjectMark)[0];

        const theoryMarks = parseFloat(subjectMark[subjectName]);
        const practicalMarkObject = isPractical ? examResult.practicalMarks.find((practicalMark: any) => practicalMark && practicalMark.hasOwnProperty(subjectName)) : null;
        const practicalMarks = practicalMarkObject ? parseFloat(practicalMarkObject[subjectName]) : 0;

        const periodicTestMarkObject = isPeriodicTest ? examResult.periodicTestMarks.find((periodicTestMark: any) => periodicTestMark && periodicTestMark.hasOwnProperty(subjectName)) : null;
        const periodicTestMarks = periodicTestMarkObject ? parseFloat(periodicTestMarkObject[subjectName]) : 0;
        const noteBookMarkObject = isNoteBook ? examResult.noteBookMarks.find((noteBookMark: any) => noteBookMark && noteBookMark.hasOwnProperty(subjectName)) : null;
        const noteBookMarks = noteBookMarkObject ? parseFloat(noteBookMarkObject[subjectName]) : 0;
        const subjectEnrichmentMarkObject = isSubjectEnrichment ? examResult.subjectEnrichmentMarks.find((subjectEnrichmentMark: any) => subjectEnrichmentMark && subjectEnrichmentMark.hasOwnProperty(subjectName)) : null;
        const subjectEnrichmentMarks = subjectEnrichmentMarkObject ? parseFloat(subjectEnrichmentMarkObject[subjectName]) : 0;



        const totalMarks = theoryMarks + practicalMarks + periodicTestMarks + noteBookMarks + subjectEnrichmentMarks;

        const theoryMaxMarksObject = this.resultStructureInfo.theoryMaxMarks.find((theoryMaxMarks: any) => theoryMaxMarks && theoryMaxMarks.hasOwnProperty(subjectName));
        const theoryMaxMarks = theoryMaxMarksObject ? parseFloat(theoryMaxMarksObject[subjectName]) : 0;


        const practicalMaxMarksObject = isPractical && this.resultStructureInfo.practicalMaxMarks ? this.resultStructureInfo.practicalMaxMarks.find((practicalMaxMark: any) => practicalMaxMark && practicalMaxMark.hasOwnProperty(subjectName)) : null;
        const practicalMaxMarks = practicalMaxMarksObject ? parseFloat(practicalMaxMarksObject[subjectName]) : 0;


        const periodicTestMaxMarksObject = isPeriodicTest && this.resultStructureInfo.periodicTestMaxMarks ? this.resultStructureInfo.periodicTestMaxMarks.find((periodicTestMaxMark: any) => periodicTestMaxMark && periodicTestMaxMark.hasOwnProperty(subjectName)) : null;
        const periodicTestMaxMarks = periodicTestMaxMarksObject ? parseFloat(periodicTestMaxMarksObject[subjectName]) : 0;
        const noteBookMaxMarksObject = isNoteBook && this.resultStructureInfo.noteBookMaxMarks ? this.resultStructureInfo.noteBookMaxMarks.find((noteBookMaxMark: any) => noteBookMaxMark && noteBookMaxMark.hasOwnProperty(subjectName)) : null;
        const noteBookMaxMarks = noteBookMaxMarksObject ? parseFloat(noteBookMaxMarksObject[subjectName]) : 0;
        const subjectEnrichmentMaxMarksObject = isSubjectEnrichment && this.resultStructureInfo.subjectEnrichmentMaxMarks ? this.resultStructureInfo.subjectEnrichmentMaxMarks.find((subjectEnrichmentMaxMark: any) => subjectEnrichmentMaxMark && subjectEnrichmentMaxMark.hasOwnProperty(subjectName)) : null;
        const subjectEnrichmentMaxMarks = subjectEnrichmentMaxMarksObject ? parseFloat(subjectEnrichmentMaxMarksObject[subjectName]) : 0;



        const totalMaxMarks = theoryMaxMarks + practicalMaxMarks + periodicTestMaxMarks + noteBookMaxMarks + subjectEnrichmentMaxMarks;
        const totalGettingMarksPercentile = ((totalMarks / totalMaxMarks) * 100).toFixed(0);
        const gradeMaxMarks = this.resultStructureInfo.gradeMaxMarks;
        const gradeMinMarks = this.resultStructureInfo.gradeMinMarks;
        const grade = gradeMaxMarks.reduce((grade: string, gradeRange: any, i: number) => {
          const maxMarks = parseFloat(String(Object.values(gradeRange)[0]));
          const minMarks = parseFloat(String(Object.values(gradeMinMarks[i])[0]));
          return parseFloat(totalGettingMarksPercentile) >= minMarks && parseFloat(totalGettingMarksPercentile) <= maxMarks ? Object.keys(gradeRange)[0] : grade;
        }, '');
        return {
          subject: subjectName,
          theoryMarks: theoryMarks,
          practicalMarks: practicalMarks,
          periodicTestMarks: periodicTestMarks,
          noteBookMarks: noteBookMarks,
          subjectEnrichmentMarks: subjectEnrichmentMarks,
          totalMarks: totalMarks,
          grade: grade,
        };
      });
    };
    let marks = calculateGrades(examResult.theoryMarks, !!examResult.practicalMarks, !!examResult.periodicTestMarks, !!examResult.noteBookMarks, !!examResult.subjectEnrichmentMarks);
    const grandTotalMarks = marks.reduce((total: number, item: any) => total + item.totalMarks, 0);
    const percentile = parseFloat(((grandTotalMarks / totalMaxMarks) * 100).toFixed(2));
    const basePercentile = parseFloat(percentile.toFixed(0));
    const percentileGrade = this.resultStructureInfo.gradeMaxMarks.reduce((grade: string, gradeRange: any, i: number) => {
      const maxMarks = parseFloat(String(Object.values(gradeRange)[0]));
      const minMarks = parseFloat(String(Object.values(this.resultStructureInfo.gradeMinMarks[i])[0]));
      return basePercentile >= minMarks && basePercentile <= maxMarks ? Object.keys(gradeRange)[0] : grade;
    }, '');

    let emptyArrayProperties: any[] = [];
    for (let key in this.resultStructureInfo) {
      if (Array.isArray(this.resultStructureInfo[key]) && this.resultStructureInfo[key].length === 0) {
        let transformedKey = key.replace(/Max|Pass/, '');
        emptyArrayProperties.push(transformedKey);
      }
    }

    marks.forEach((subject: any) => {
      emptyArrayProperties.forEach(prop => {
        delete subject[prop];
      });
    });

    const coScholastic = examResult.coScholastic.map((activity: any) => {
      const activityName = Object.keys(activity)[0];
      const grade = activity[activityName];
      return {
        activity: activityName,
        grade: grade
      };
    });

    let examResultInfo = {
      marks: marks,
      grandTotalMarks: grandTotalMarks,
      totalMaxMarks: totalMaxMarks,
      percentile: percentile,
      percentileGrade: percentileGrade,
      resultStatus: resultStatus,
      coScholastic: coScholastic,
    };
    if (this.examResultForm.valid) {
      this.examResultForm.value.resultDetail = examResultInfo;
      this.examResultForm.value.adminId = this.adminId;
      this.examResultForm.value.rollNumber = this.selectedRollNumber;
      if (this.updateMode) {
        this.examResultService.updateExamResult(this.examResultForm.value).subscribe((res: any) => {
          if (res) {
            this.successDone();
            this.successMsg = res;
          }
        }, err => {
          this.errorCheck = true;
          this.errorMsg = err.error;
        })
      } else {
        if (this.practicalSubjects.length === 0) {
          delete this.examResultForm.value.type.practicalMarks;
        }
        this.examResultForm.value.createdBy = "Admin";
        // this.examResultForm.value.examType = this.selectedExam;
        this.examResultForm.value.stream = this.stream;
        this.examResultForm.value.class = this.cls;
        this.examResultService.addExamResult(this.examResultForm.value).subscribe((res: any) => {
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
  }
}
