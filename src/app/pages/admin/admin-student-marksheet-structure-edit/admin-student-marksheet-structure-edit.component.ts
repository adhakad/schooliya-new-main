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
  marksTypes: string[] = []; // Dynamic marks types store karne ke liye

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

  // Backend se marksheet template fetch karna
  getSingleMarksheetTemplateById() {
    this.examResultStructureService.getSingleMarksheetTemplateById(this.id).subscribe(
      (res: any) => {
        this.examStructure = res.examStructure;
        this.subjects = res.subjects.map((subject: any) => subject.subject);
        this.terms = Object.keys(this.examStructure); // Terms ko dynamically set karo
        
        // Pehla term ka subject list le lo
        this.selectedSubjects = this.examStructure[this.terms[0]]?.scholasticMarks.theoryMaxMarks.map(
          (item: any) => Object.keys(item)[0]
        );

        // Marks types ko identify karo (e.g., Theory, Practical, Project, Half-Yearly)
        this.marksTypes = this.getMarksTypes();

        // Form ko dynamically patch karo
        this.patchForm();
      },
      (err) => {
        this.toastr.error('Failed to fetch marksheet template');
      }
    );
  }

  // Available marks types nikalna
  getMarksTypes(): string[] {
    const allMarksTypes = new Set<string>();
    this.terms.forEach((term) => {
      const marks = Object.keys(this.examStructure[term]?.scholasticMarks || {});
      marks.forEach((type) => allMarksTypes.add(type));
    });
    return Array.from(allMarksTypes);
  }

  // Dynamic Form Creation
  patchForm() {
    this.terms.forEach((term) => {
      if (this.subjectPermissionForm.get(term)) {
        this.subjectPermissionForm.removeControl(term);
      }
    });

    this.terms.forEach((term) => {
      const termGroup = this.fb.group({});
      this.subjectPermissionForm.addControl(term, termGroup);

      this.marksTypes.forEach((marksType) => {
        termGroup.addControl(marksType, this.fb.array([]));

        const marksControlArray = this.getMarksArray(term, marksType);

        this.selectedSubjects.forEach((subject) => {
          marksControlArray.push(
            this.fb.group({
              subject: [subject],
              value: [
                this.getDefaultValue(subject, term, marksType),
                [Validators.required, Validators.min(0), Validators.max(100)]
              ]
            })
          );
        });
      });
    });
  }

  // Default Value nikalna
  getDefaultValue(subject: string, term: string, marksType: string) {
    return this.examStructure?.[term]?.scholasticMarks?.[marksType]?.find((item: any) => item[subject])?.[subject] || '';
  }

  // Subject ko toggle karna
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

  // Dynamic FormArray Get Karna
  getMarksArray(term: string, marksType: string): FormArray {
    return this.subjectPermissionForm.get(`${term}.${marksType}`) as FormArray;
  }

  // Form Submit
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
