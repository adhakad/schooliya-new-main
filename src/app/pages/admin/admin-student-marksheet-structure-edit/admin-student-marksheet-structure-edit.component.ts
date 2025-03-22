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
  selectedSubjects: { [key: string]: string[] } = {};
  terms: string[] = [];
  marksTypes: string[] = [];
  marksTypeGroups: { [key: string]: string[] } = {};

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

  getKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getSingleMarksheetTemplateById() {
    this.examResultStructureService.getSingleMarksheetTemplateById(this.id).subscribe(
      (res: any) => {
        this.examStructure = res.examStructure;
        this.subjects = res.subjects.map((subject: any) => subject.subject);
        this.terms = Object.keys(this.examStructure);
        this.marksTypes = this.getMarksTypes();
        this.groupMarksTypes();
        this.initializeSelectedSubjects();
        this.patchForm();
      },
      (err) => {
        this.toastr.error('Failed to fetch marksheet template');
      }
    );
  }

  getMarksTypes(): string[] {
    const allMarksTypes = new Set<string>();
    this.terms.forEach((term) => {
      const marks = Object.keys(this.examStructure[term]?.scholasticMarks || {});
      marks.forEach((type) => allMarksTypes.add(type));
    });
    return Array.from(allMarksTypes);
  }

  groupMarksTypes() {
    this.marksTypes.forEach((marksType) => {
      const baseType = marksType.replace(/MaxMarks|PassMarks/, '');
      if (!this.marksTypeGroups[baseType]) {
        this.marksTypeGroups[baseType] = [];
      }
      this.marksTypeGroups[baseType].push(marksType);
    });
  }

  initializeSelectedSubjects() {
    Object.keys(this.marksTypeGroups).forEach((group) => {
      this.selectedSubjects[group] = [];
      this.terms.forEach(term => {
        this.marksTypeGroups[group].forEach(marksType => {
          const marksArray = this.examStructure[term]?.scholasticMarks?.[marksType] || [];
          marksArray.forEach((item: any) => {
            const subject = Object.keys(item)[0];
            if (!this.selectedSubjects[group].includes(subject)) {
              this.selectedSubjects[group].push(subject);
            }
          });
        });
      });
    });
  }

  patchForm() {
    this.terms.forEach((term) => {
      if (this.subjectPermissionForm.get(term)) {
        this.subjectPermissionForm.removeControl(term);
      }
    });

    this.terms.forEach((term) => {
      const termGroup = this.fb.group({});
      this.subjectPermissionForm.addControl(term, termGroup);

      Object.keys(this.marksTypeGroups).forEach((group) => {
        this.marksTypeGroups[group].forEach((marksType) => {
          termGroup.addControl(marksType, this.fb.array([]));

          const marksControlArray = this.getMarksArray(term, marksType);
          marksControlArray.clear();

          this.selectedSubjects[group].forEach((subject) => {
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
    });
  }

  getDefaultValue(subject: string, term: string, marksType: string) {
    return this.examStructure?.[term]?.scholasticMarks?.[marksType]?.find((item: any) => item[subject])?.[subject] || '';
  }

  marksTypeToggle(subject: string, event: any, group: string) {
    if (event.checked) {
      if (!this.selectedSubjects[group].includes(subject)) {
        this.selectedSubjects[group].push(subject);
      }
    } else {
      this.selectedSubjects[group] = this.selectedSubjects[group].filter(s => s !== subject);
    }
    this.patchForm();
  }

  isSubjectSelected(subject: string, group: string): boolean {
    return this.selectedSubjects[group].includes(subject);
  }

  getMarksArray(term: string, marksType: string): FormArray {
    return this.subjectPermissionForm.get(`${term}.${marksType}`) as FormArray;
  }

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