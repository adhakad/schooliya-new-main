




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

  // ✅ Marksheet Data ko fetch karna
  getSingleMarksheetTemplateById() {
    this.examResultStructureService.getSingleMarksheetTemplateById(this.id).subscribe(
      (res: any) => {
        this.examStructure = res.examStructure;
        this.subjects = res.subjects.map((subject: any) => subject.subject);
        this.selectedTheoryMaxMarks = res.examStructure.term1.theoryMaxMarks.map(
          (item: any) => Object.keys(item)[0]
        );
        this.patch(); // ✅ Form ko patch karo
      },
      (err) => {
        this.toastr.error('Failed to fetch marksheet template');
      }
    );
  }

  // ✅ Subject ko add/remove karna
  theoryMaxMarks(option: string, event: any) {
    if (event.checked) {
      if (!this.selectedTheoryMaxMarks.includes(option)) {
        this.selectedTheoryMaxMarks.push(option);
      }
    } else {
      this.selectedTheoryMaxMarks = this.selectedTheoryMaxMarks.filter(
        (subject) => subject !== option
      );
    }
    this.patch(); // ✅ Form ko sync karo
  }

  // ✅ Form ko patch karna
  patch() {
    const controlOne = <FormArray>(
      this.subjectPermissionForm.get('type.theoryMaxMarksPermission')
    );

    // ✅ Pehle se added values ko store karo
    const existingValues = controlOne.controls.reduce((acc: any, curr: any) => {
      const key = Object.keys(curr.value)[0];
      acc[key] = curr.value[key];
      return acc;
    }, {});

    // ✅ Purane aur naye subjects ko sync karo
    this.selectedTheoryMaxMarks.forEach((subject) => {
      const existingIndex = this.selectedTheoryMaxMarks.indexOf(subject);

      if (existingIndex !== -1 && existingValues[subject] !== undefined) {
        // ✅ Agar subject pehle se available hai to value ko update karo
        controlOne.at(existingIndex)?.patchValue({
          [subject]: existingValues[subject],
        });
      } else {
        // ✅ Agar naye subject ko add kar rahe hain to default value leke push karo
        const existingValue = this.examStructure?.term1?.theoryMaxMarks.find(
          (item: any) => Object.keys(item)[0] === subject
        )?.[subject] || '';

        controlOne.push(
          this.fb.group({
            [subject]: [existingValue, Validators.required],
          })
        );
      }
    });

    // ✅ Agar koi subject uncheck kar diya ho to use remove karo
    for (let i = controlOne.length - 1; i >= 0; i--) {
      const key = Object.keys(controlOne.at(i).value)[0];
      if (!this.selectedTheoryMaxMarks.includes(key)) {
        controlOne.removeAt(i);
      }
    }
  }

  // ✅ Checkbox ke liye selected state ko maintain karo
  isTheoryMaxMarksSelected(option: string): boolean {
    return this.selectedTheoryMaxMarks.includes(option);
  }

  // ✅ Form ko submit karna
  subjectPermissionAdd() {
    this.subjectPermissionForm.value._id = this.id;
    console.log(this.subjectPermissionForm.value);

    
  }
}

