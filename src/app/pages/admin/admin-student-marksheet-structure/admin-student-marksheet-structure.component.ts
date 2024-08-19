import { Component, Inject, OnInit, PLATFORM_ID, AfterViewInit, ElementRef } from '@angular/core';
declare var jQuery: any;
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { ExamResultStructureService } from 'src/app/services/exam-result-structure.service';

@Component({
  selector: 'app-admin-student-marksheet-structure',
  templateUrl: './admin-student-marksheet-structure.component.html',
  styleUrls: ['./admin-student-marksheet-structure.component.css']
})
export class AdminStudentMarksheetStructureComponent implements OnInit {
  private isBrowser: boolean = isPlatformBrowser(this.platformId);
  examResultForm: FormGroup;
  disabled = true;
  showModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  marksheetTemplate: any;
  marksheetSelectMode:boolean = true;
  selectedTemplate:string = '';
  examResultInfo: any;
  processedTheoryData: any[] = [];
  processedPracticalData: any[] = [];
  cls: any;
  stream: any;
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  loader: Boolean = true;
  isChecked!: Boolean;
  adminId: string = '';
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private el: ElementRef, private fb: FormBuilder, public activatedRoute: ActivatedRoute, private adminAuthService: AdminAuthService, private classSubjectService: ClassSubjectService, private examResultStructureService: ExamResultStructureService) {
    this.examResultForm = this.fb.group({
      adminId: [''],
      class: [''],
      stream: [''],
      templateName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.cls = this.activatedRoute.snapshot.paramMap.get('class');
    this.stream = this.activatedRoute.snapshot.paramMap.get('stream');
    if (this.cls && this.stream) {
      this.getSingleClassMarksheetTemplateByStream(this.cls);
      setTimeout(() => {
        this.loader = false;
      }, 1000);
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {

      setTimeout(() => {
        jQuery(this.el.nativeElement).find('.template-carousel').owlCarousel({
          stagePadding: 15,
          items: 1,
          loop: false,
          dots: false,
          nav: true,
          responsiveClass: true,
          navText: [
            "<button style='position:absolute;left:-10px;background:#8c88ff3d;color:#4e4caacd;border:none;border-radius:50%;width:30px;height:30px;top:50%;transform:translateY(-50%);'><mat-icon style='margin-top:2px;margin-left:-3px;' class='material-icons'>keyboard_arrow_left</mat-icon></button>",
            "<button style='position:absolute;right:-10px;background:#8c88ff3d;color:#4e4caacd;border:none;border-radius:50%;width:30px;height:30px;top:50%;transform:translateY(-50%);'><mat-icon style='margin-top:2px;margin-left:-3px;' class='material-icons'>keyboard_arrow_right</mat-icon></button>"
          ],
          responsive: {
            600: {
              stagePadding: 20,
              items: 3,
            },
            1500: {
              stagePadding: 50,
              items: 2,
            },
          }
        })
      }, 1500);

    }
  }


  addExamResultModel(template: any) {
    this.showModal = true;
    this.examResultForm.reset();
    this.examResultForm.get('templateName')?.setValue(template);
    this.selectedTemplate=template;
  }
  openExamResultStructureModal(examResult: any) {
    this.examResultInfo = examResult;
  }
  deleteMarksheetTemplateModel(id: String) {
    this.showModal = true;
    this.deleteMode = true;
    this.deleteById = id;
  }

  falseFormValue() {
    this.examResultForm.reset();
  }
  falseAllValue() {
    this.falseFormValue();
  }
  closeModal() {
    this.falseAllValue();
    this.showModal = false;
    this.errorMsg = '';
    this.deleteMode = false;
    this.deleteById = '';
    this.successMsg = '';
    this.examResultInfo;
    this.processedTheoryData = [];
    this.processedPracticalData = [];
    this.examResultForm.reset();
  }
  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      this.getSingleClassMarksheetTemplateByStream(this.cls)
    }, 1000)
  }
  getSingleClassMarksheetTemplateByStream(cls: any) {
    let params = {
      adminId: this.adminId,
      cls: cls,
      stream: this.stream,
    }
    this.examResultStructureService.getSingleClassMarksheetTemplateByStream(params).subscribe((res: any) => {
      if (res) {
        this.marksheetTemplate = res;
        this.marksheetSelectMode=false;
      }
    }, err => {
    })
  }

  examResultAddUpdate() {
    this.examResultForm.value.adminId = this.adminId;
    this.examResultForm.value.class = this.cls;
    this.examResultForm.value.stream = this.stream;
    this.examResultStructureService.addExamResultStructure(this.examResultForm.value).subscribe((res: any) => {
      if (res) {
        this.successDone();
        this.successMsg = res;
      }
    }, err => {
      this.errorCheck = true;
      this.errorMsg = err.error;
    })


  }

  marksheetTemplateDelete(id: String) {
    this.examResultStructureService.deleteResultStructure(id).subscribe((res: any) => {
      if (res) {
        this.marksheetSelectMode=true;
        this.successDone();
        this.successMsg = res;
        this.deleteById = '';
      }
    })
  }

}

