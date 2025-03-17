import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { ExamResultStructureService } from 'src/app/services/exam-result-structure.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-student-marksheet-structure-edit',
  templateUrl: './admin-student-marksheet-structure-edit.component.html',
  styleUrls: ['./admin-student-marksheet-structure-edit.component.css']
})
export class AdminStudentMarksheetStructureEditComponent implements OnInit {
  subjectPermissionForm: FormGroup;
  adminId: string = '';
  id: any;
  examStructure: any;
  subjects: any[] = [];
  selectedTheoryMaxMarks: any[] = [];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private adminAuthService: AdminAuthService,
    private examResultStructureService: ExamResultStructureService
  ) {
    this.subjectPermissionForm = this.fb.group({
      _id: [''],
      type: this.fb.group({
        theoryMaxMarksPermission: this.fb.array([], [Validators.required]),
      }),
    });
  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getSingleMarksheetTemplateById();
  }

  getSingleMarksheetTemplateById() {
    this.examResultStructureService.getSingleMarksheetTemplateById(this.id).subscribe((res: any) => {
      this.examStructure = res.examStructure;
      this.subjects = res.subjects.map((subject: any) => subject.subject);
      this.selectedTheoryMaxMarks = res.examStructure.term1.theoryMaxMarks.map(
        (item: any) => Object.keys(item)[0]
      );
      this.patch(); // ✅ Form patching yahi kar rahe hain
    });
  }

  theoryMaxMarks(option: string, event: any) {
    if (event.checked) {
      if (!this.selectedTheoryMaxMarks.includes(option)) {
        this.selectedTheoryMaxMarks.push(option);
      }
    } else {
      this.selectedTheoryMaxMarks = this.selectedTheoryMaxMarks.filter(
        (cls) => cls !== option
      );
    }
    this.patch(); // ✅ Form ko har update par patch karo
  }

  isTheoryMaxMarksSelected(option: string): boolean {
    return this.selectedTheoryMaxMarks.includes(option);
  }

  patch() {
    const controlOne = <FormArray>(
      this.subjectPermissionForm.get('type.theoryMaxMarksPermission')
    );
    controlOne.clear(); // ✅ Purane values ko clear kar do
    this.selectedTheoryMaxMarks.forEach((x) => {
      controlOne.push(this.patchTheoryMaxMarksValues(x));
    });
  }

  patchTheoryMaxMarksValues(theoryMaxMarksPermission: any) {
    return this.fb.group({
      [theoryMaxMarksPermission.toString()]: [
        theoryMaxMarksPermission,
        Validators.required,
      ],
    });
  }

  subjectPermissionAdd() {
    this.subjectPermissionForm.value._id = this.id;
    console.log(this.subjectPermissionForm.value);

    // ✅ Yaha API ko call karo (example ke liye commented rakha hai)
    // this.examResultStructureService.addPermission(this.subjectPermissionForm.value).subscribe(
    //   (res) => {
    //     this.toastr.success('Permission added successfully');
    //   },
    //   (err) => {
    //     this.toastr.error('Failed to add permission');
    //   }
    // );
  }
}












// import { Component, Inject, OnInit, PLATFORM_ID, AfterViewInit, ElementRef } from '@angular/core';
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
//   subjectPermissionForm: FormGroup;
//   adminId: string = '';
//   id: any;
//   examStructure: any;
//   subjects: any[] = [];
//   selectedTheoryMaxMarks: any[] = [];
//   constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private toastr: ToastrService, private adminAuthService: AdminAuthService, private examResultStructureService: ExamResultStructureService) {
//     this.subjectPermissionForm = this.fb.group({
//       _id: [''],
//       type: this.fb.group({
//         theoryMaxMarksPermission: this.fb.array([],[Validators.required]),
//       }),
//     });
//   }

//   ngOnInit(): void {
//     let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
//     this.adminId = getAdmin?.id;
//     this.id = this.activatedRoute.snapshot.paramMap.get('id');
//     this.getSingleMarksheetTemplateById();
//   }
//   getSingleMarksheetTemplateById() {
//     this.examResultStructureService.getSingleMarksheetTemplateById(this.id).subscribe((res: any) => {
//       this.examStructure = res.examStructure;
//       this.subjects = res.subjects.map(((subject: any) => { return subject.subject }));
//       this.selectedTheoryMaxMarks = res.examStructure.term1.theoryMaxMarks.map((item: any) => {
//         return Object.keys(item)[0];
//       });
//     })
//   }
//   theoryMaxMarks(option: number, event: any) {
//     if (event.checked) {
//       if (!this.selectedTheoryMaxMarks.includes(option)) {
//         this.selectedTheoryMaxMarks.push(option);
//         // console.log(this.selectedTheoryMaxMarks)
//       }
//     } else {
//       this.selectedTheoryMaxMarks = this.selectedTheoryMaxMarks.filter(cls => cls !== option);
//       // console.log(this.selectedTheoryMaxMarks)
//     }
//   }
//   isTheoryMaxMarksSelected(option: number): boolean {
//     this.patch();
//     return this.selectedTheoryMaxMarks.includes(option);
//   }
//   patch() {
//     const controlOne = <FormArray>this.subjectPermissionForm.get('type.theoryMaxMarksPermission');
//     this.selectedTheoryMaxMarks.forEach((x: any) => {
//       controlOne.push(this.patchTheoryMaxMarksValues(x))
//       this.subjectPermissionForm.reset();
//     })
//   }
//   patchTheoryMaxMarksValues(theoryMaxMarksPermission: any) {
//     return this.fb.group(
//       { [theoryMaxMarksPermission]: [theoryMaxMarksPermission] }
//     )
//   }
//   subjectPermissionAdd() {
//     this.subjectPermissionForm.value._id = this.id;
//     console.log(this.subjectPermissionForm.value)
  
//     // this.teacherService.addTeacherPermission(this.teacherPermissionForm.value).subscribe((res: any) => {
//     //   if (res) {
//     //     this.successDone(res);
//     //   }
//     // }, err => {
//     //   this.errorCheck = true;
//     //   this.errorMsg = err.error;
//     // })
//   }
// }