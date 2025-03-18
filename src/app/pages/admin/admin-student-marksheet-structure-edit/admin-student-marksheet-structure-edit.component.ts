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
  subjectPermissionForm!: FormGroup;
  adminId: string = '';
  id: any;
  examStructure: any;
  subjects: any[] = [];
  selectedSubjects: any[] = [];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private adminAuthService: AdminAuthService,
    private examResultStructureService: ExamResultStructureService
  ) {}

  ngOnInit(): void {
    // Form Initialize
    this.subjectPermissionForm = this.fb.group({
      _id: [''],
      type: this.fb.group({
        theoryMaxMarksPermission: this.fb.array([]),
        theoryPassMarksPermission: this.fb.array([])
      })
    });

    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getSingleMarksheetTemplateById();
  }

  // API Call to get data
  getSingleMarksheetTemplateById() {
    this.examResultStructureService.getSingleMarksheetTemplateById(this.id).subscribe(
      (res: any) => {
        this.examStructure = res.examStructure;
        this.subjects = res.subjects.map((subject: any) => subject.subject);
        this.selectedSubjects = res.examStructure.term1.theoryMaxMarks.map((item: any) => Object.keys(item)[0]);

        // Form Patch
        this.patchForm();
      },
      (err) => {
        this.toastr.error('Failed to fetch marksheet template');
      }
    );
  }

  // Form Patch karne ka sahi tareeka
  patchForm() {
    const maxMarksControl = this.getTheoryMaxMarksArray();
    const passMarksControl = this.getTheoryPassMarksArray();

    maxMarksControl.clear();
    passMarksControl.clear();

    this.selectedSubjects.forEach(subject => {
      const maxMarksValue = this.getDefaultValue(subject, 'theoryMaxMarks');
      const passMarksValue = this.getDefaultValue(subject, 'theoryPassMarks');

      // Proper FormGroup Bind kar rahe hain
      maxMarksControl.push(
        this.fb.group({
          subject: [subject],
          value: [maxMarksValue, Validators.required]
        })
      );
      passMarksControl.push(
        this.fb.group({
          subject: [subject],
          value: [passMarksValue, Validators.required]
        })
      );
    });
  }

  // Default Value nikalna
  getDefaultValue(subject: string, field: string) {
    return this.examStructure?.term1?.[field]?.find((item: any) => item[subject])?.[subject] || '';
  }

  // Subject ko select karna
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

  // Subject check hone ka status
  isSubjectSelected(subject: string): boolean {
    return this.selectedSubjects.includes(subject);
  }

  // FormArray ko properly get kar rahe hain
  getTheoryMaxMarksArray(): FormArray {
    return this.subjectPermissionForm.get('type.theoryMaxMarksPermission') as FormArray;
  }

  getTheoryPassMarksArray(): FormArray {
    return this.subjectPermissionForm.get('type.theoryPassMarksPermission') as FormArray;
  }

  // Form ko Submit karna
  subjectPermissionAdd() {
    this.subjectPermissionForm.value._id = this.id;
    console.log(this.subjectPermissionForm.value);
  }
}
