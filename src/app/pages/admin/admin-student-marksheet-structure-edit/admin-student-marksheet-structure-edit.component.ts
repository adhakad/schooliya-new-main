import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { ExamResultStructureService } from 'src/app/services/exam-result-structure.service';

@Component({
  selector: 'app-admin-student-marksheet-structure-edit',
  templateUrl: './admin-student-marksheet-structure-edit.component.html',
  styleUrls: ['./admin-student-marksheet-structure-edit.component.css']
})
export class AdminStudentMarksheetStructureEditComponent implements OnInit {
  subjectPermissionForm!: FormGroup;
  adminId: string = '';
  id: any;
  examStructure: any;
  subjects: any[] = [];
  selectedSubjects: any[] = [];
  terms: string[] = [];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private adminAuthService: AdminAuthService,
    private examResultStructureService: ExamResultStructureService
  ) {}

  ngOnInit(): void {
    this.subjectPermissionForm = this.fb.group({
      _id: ['']
    });

    const getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getSingleMarksheetTemplateById();
  }

  //  Backend se data fetch karna
  getSingleMarksheetTemplateById() {
    this.examResultStructureService.getSingleMarksheetTemplateById(this.id).subscribe(
      (res: any) => {
        this.examStructure = res.examStructure;
        this.subjects = res.subjects.map((subject: any) => subject.subject);
        this.terms = Object.keys(this.examStructure); //  Terms ko dynamic rakho
        this.selectedSubjects = this.examStructure[this.terms[0]]?.theoryMaxMarks.map(
          (item: any) => Object.keys(item)[0]
        );

        //  Form ko dynamically patch karo
        this.patchForm();
      },
      (err) => {
        this.toastr.error('Failed to fetch marksheet template');
      }
    );
  }

  //  Dynamic Form Creation
  patchForm() {
    //  Pehle se form clear karo
    this.terms.forEach((term) => {
      if (this.subjectPermissionForm.get(term)) {
        this.subjectPermissionForm.removeControl(term);
      }
    });

    //  Har term ke liye FormGroup banao
    this.terms.forEach((term) => {
      this.subjectPermissionForm.addControl(
        term,
        this.fb.group({
          theoryMaxMarks: this.fb.array([]),
          theoryPassMarks: this.fb.array([])
        })
      );

      const termMaxMarksControl = this.getTheoryMaxMarksArray(term);
      const termPassMarksControl = this.getTheoryPassMarksArray(term);

      //  Har subject ke liye FormArray ko push karo
      this.selectedSubjects.forEach((subject) => {
        termMaxMarksControl.push(
          this.fb.group({
            subject: [subject],
            value: [
              this.getDefaultValue(subject, term, 'theoryMaxMarks'),
              [Validators.required, Validators.min(0), Validators.max(100)]
            ]
          })
        );

        termPassMarksControl.push(
          this.fb.group({
            subject: [subject],
            value: [
              this.getDefaultValue(subject, term, 'theoryPassMarks'),
              [Validators.required, Validators.min(0), Validators.max(100)]
            ]
          })
        );
      });
    });
  }

  //  Default Value nikalna
  getDefaultValue(subject: string, term: string, field: string) {
    return this.examStructure?.[term]?.[field]?.find((item: any) => item[subject])?.[subject] || '';
  }

  //  Subject ko toggle karna
  theoryMarksToggle(subject: string, event: any) {
    if (event.checked) {
      if (!this.selectedSubjects.includes(subject)) {
        this.selectedSubjects.push(subject);
      }
    } else {
      this.selectedSubjects = this.selectedSubjects.filter(s => s !== subject);
    }
    this.patchForm();
  }

  isSubjectSelected(subject: string): boolean {
    return this.selectedSubjects.includes(subject);
  }

  //  FormArray ko get karna (dynamic terms ke hisaab se)
  getTheoryMaxMarksArray(term: string): FormArray {
    return this.subjectPermissionForm.get(`${term}.theoryMaxMarks`) as FormArray;
  }

  getTheoryPassMarksArray(term: string): FormArray {
    return this.subjectPermissionForm.get(`${term}.theoryPassMarks`) as FormArray;
  }

  //  Form ko submit karna
  subjectPermissionAdd() {
    if (this.subjectPermissionForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.');
      return;
    }

    this.subjectPermissionForm.value._id = this.id;
    console.log(this.subjectPermissionForm.value);

    this.toastr.success('Marksheet structure updated successfully!');
  }
}




// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
// import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
// import { ExamResultStructureService } from 'src/app/services/exam-result-structure.service';
// import { ToastrService } from 'ngx-toastr';

// @Component({
//   selector: 'app-admin-student-marksheet-structure-edit',
//   templateUrl: './admin-student-marksheet-structure-edit.component.html',
//   styleUrls: ['./admin-student-marksheet-structure-edit.component.css']
// })
// export class AdminStudentMarksheetStructureEditComponent implements OnInit {
//   subjectPermissionForm!: FormGroup;
//   adminId: string = '';
//   id: any;
//   examStructure: any;
//   subjects: any[] = [];
//   selectedSubjects: any[] = [];

//   constructor(
//     private fb: FormBuilder,
//     private activatedRoute: ActivatedRoute,
//     private toastr: ToastrService,
//     private adminAuthService: AdminAuthService,
//     private examResultStructureService: ExamResultStructureService
//   ) {}

//   ngOnInit(): void {
//     this.subjectPermissionForm = this.fb.group({
//       _id: [''],
//       type: this.fb.group({
//         theoryMaxMarks: this.fb.array([]),
//         theoryPassMarks: this.fb.array([])
//       })
//     });

//     const getAdmin = this.adminAuthService.getLoggedInAdminInfo();
//     this.adminId = getAdmin?.id;
//     this.id = this.activatedRoute.snapshot.paramMap.get('id');
//     this.getSingleMarksheetTemplateById();
//   }

//   //  API Call se data fetch kar rahe hain
//   getSingleMarksheetTemplateById() {
//     this.examResultStructureService.getSingleMarksheetTemplateById(this.id).subscribe(
//       (res: any) => {
//         this.examStructure = res.examStructure;
//         this.subjects = res.subjects.map((subject: any) => subject.subject);
//         this.selectedSubjects = res.examStructure.term1.theoryMaxMarks.map(
//           (item: any) => Object.keys(item)[0]
//         );

//         //  Form patch kar rahe hain
//         this.patchForm();
//       },
//       (err) => {
//         this.toastr.error('Failed to fetch marksheet template');
//       }
//     );
//   }

//   //  Form patch karne ka sahi tareeka
//   patchForm() {
//     const maxMarksControl = this.getTheoryMaxMarksArray();
//     const passMarksControl = this.getTheoryPassMarksArray();

//     maxMarksControl.clear();
//     passMarksControl.clear();

//     this.selectedSubjects.forEach(subject => {
//       const maxMarksValue = this.getDefaultValue(subject, 'theoryMaxMarks');
//       const passMarksValue = this.getDefaultValue(subject, 'theoryPassMarks');

//       //  Theory Max Marks ke liye validators
//       maxMarksControl.push(
//         this.fb.group({
//           subject: [subject],
//           value: [
//             maxMarksValue,
//             [Validators.required, Validators.min(0), Validators.max(100)]
//           ]
//         })
//       );

//       //  Theory Passing Marks ke liye validators
//       passMarksControl.push(
//         this.fb.group({
//           subject: [subject],
//           value: [
//             passMarksValue,
//             [Validators.required, Validators.min(0), Validators.max(100)]
//           ]
//         })
//       );
//     });
//   }

//   //  Default Value nikalna
//   getDefaultValue(subject: string, field: string) {
//     return this.examStructure?.term1?.[field]?.find((item: any) => item[subject])?.[subject] || '';
//   }

//   //  Subject ko select karna
//   theoryMarksToggle(subject: string, event: any) {
//     if (event.checked) {
//       if (!this.selectedSubjects.includes(subject)) {
//         this.selectedSubjects.push(subject);
//       }
//     } else {
//       this.selectedSubjects = this.selectedSubjects.filter(s => s !== subject);
//     }
//     this.patchForm();
//   }

//   //  Subject check hone ka status
//   isSubjectSelected(subject: string): boolean {
//     return this.selectedSubjects.includes(subject);
//   }

//   //  FormArray ko properly get kar rahe hain
//   getTheoryMaxMarksArray(): FormArray {
//     return this.subjectPermissionForm.get('type.theoryMaxMarks') as FormArray;
//   }

//   getTheoryPassMarksArray(): FormArray {
//     return this.subjectPermissionForm.get('type.theoryPassMarks') as FormArray;
//   }

//   //  Form ko Submit karna
//   subjectPermissionAdd() {
//     if (this.subjectPermissionForm.invalid) {
//       this.toastr.error('Please fill all required fields correctly.');
//       return;
//     }

//     this.subjectPermissionForm.value._id = this.id;
//     console.log(this.subjectPermissionForm.value);
//     this.toastr.success('Marksheet structure updated successfully!');
//   }
// }

