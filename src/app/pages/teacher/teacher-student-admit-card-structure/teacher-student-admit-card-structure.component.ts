import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { AdmitCardStructureService } from 'src/app/services/admit-card-structure.service';
import { ClassService } from 'src/app/services/class.service';
import { TeacherAuthService } from 'src/app/services/auth/teacher-auth.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-teacher-student-admit-card-structure',
  templateUrl: './teacher-student-admit-card-structure.component.html',
  styleUrls: ['./teacher-student-admit-card-structure.component.css']
})
export class TeacherStudentAdmitCardStructureComponent implements OnInit {
  cls: number = 0;
  admitcardForm: FormGroup;
  showModal: boolean = false;
  showAdmitCardStructureModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  classSubject: any[] = [];
  examAdmitCard: any;
  admitCardInfo: any;
  processedData: any[] = [];
  classInfo: any[] = [];
  teacherInfo: any;
  stream: string = '';
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  examTime: any[] = ["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"];
  loader: Boolean = true;
  adminId!: string;
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private toastr: ToastrService, private adminAuthService: AdminAuthService, private teacherAuthService: TeacherAuthService, private teacherService: TeacherService, private classSubjectService: ClassSubjectService, private admitCardStructureService: AdmitCardStructureService) {
    this.admitcardForm = this.fb.group({
      adminId: [''],
      class: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      stream: ['', Validators.required],
      examType: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      type: this.fb.group({
        examDate: this.fb.array([], [Validators.required]),
        startTime: this.fb.array([], [Validators.required]),
        endTime: this.fb.array([], [Validators.required]),
      }),
    });
  }

  ngOnInit(): void {
    this.teacherInfo = this.teacherAuthService.getLoggedInTeacherInfo();
    this.adminId = this.teacherInfo?.adminId;
    if (this.teacherInfo) {
      this.getTeacherById(this.teacherInfo)
    }
    this.getAdmitCardStructureByClass();
  }
  getTeacherById(teacherInfo: any) {
    let params = {
      adminId: teacherInfo.adminId,
      teacherUserId: teacherInfo.id,
    }
    this.teacherService.getTeacherById(params).subscribe((res: any) => {
      if (res) {
        this.classInfo = res.admitCardPermission.classes;
        // this.createdBy = `${res.name} (${res.teacherUserId})`;
      }

    })
  }
  chooseClass(cls: any) {
    this.errorCheck = false;
    this.errorMsg = '';
    this.cls = 0;
    this.cls = cls;
    this.classSubject = [];
    if (cls < 11 && cls !== 0 || cls == 200 || cls == 201 || cls == 202) {
      this.admitcardForm.get('stream')?.setValue("N/A");
      this.stream = '';
      this.stream = 'stream';
      if (this.cls && this.stream) {
        let params = {
          cls: this.cls,
          stream: this.stream,
          adminId: this.adminId,
        }
        this.getSingleClassSubjectByStream(params);
      }
    }
  }
  chooseStream(stream: any) {
    this.stream = '';
    this.stream = stream;
    console.log(stream)
    console.log(stream)
    if (this.cls && this.stream) {
      let params = {
        cls: this.cls,
        stream: this.stream,
        adminId: this.adminId,
      }
      this.getSingleClassSubjectByStream(params);
    }
  }
  preventManualInput(event: KeyboardEvent) {
    event.preventDefault();  // यह मैन्युअल एंट्री को रोकेगा
  }
  falseFormValue() {
    const controlOne = <FormArray>this.admitcardForm.get('type.examDate');
    const controlTwo = <FormArray>this.admitcardForm.get('type.startTime');
    const controlThree = <FormArray>this.admitcardForm.get('type.endTime');
    controlOne.clear();
    controlTwo.clear();
    controlThree.clear();
    this.admitcardForm.reset();
  }
  falseAllValue() {
    this.falseFormValue();
    this.classSubject = [];
    this.admitcardForm.reset();
  }
  // classStreamFormValueSet() {
  //   if (this.cls < 11 && this.cls !== 0 || this.cls == 200 || this.cls == 201 || this.cls == 202) {
  //     this.admitcardForm.get('stream')?.setValue("N/A");
  //     this.loader = false;
  //     this.showModal = true;
  //   }
  //   if (this.cls == 12 || this.cls == 11) {
  //     this.admitcardForm.get('stream')?.setValue(this.stream);
  //     this.loader = false;
  //     this.showModal = true;
  //   }
  // }

  getSingleClassSubjectByStream(params: any) {
    this.classSubjectService.getSingleClassSubjectByStream(params).subscribe((res: any) => {
      if (res) {
        this.classSubject = res.subject;
        if (this.classSubject) {
          this.patch();

        }
      }
      if (!res) {
        this.classSubject = [];
      }
    }, err => {
      this.errorCheck = true;
      if (err.status == 404) {
        this.errorMsg = 'No student was found, please add students !'
      }
    })
  }

  getAdmitCardStructureByClass() {
    let params = {
      cls: this.cls,
      adminId: this.adminId,
      stream: this.stream,
    }
    this.admitCardStructureService.admitCardStructureByClass(params).subscribe((res: any) => {
      if (res) {
        this.examAdmitCard = res;
        this.loader = false;
        // setTimeout(() => {
        //   this.loader = false;
        // }, 1000)
        // let date = new Date();
        // let examDate: any = this.examAdmitCard[0]?.examDate;

        // // Convert the date strings to Date objects
        // const datesAsObjects = examDate?.map((entry: any) => {
        //   const subject = Object.keys(entry)[0];
        //   const dateParts = entry[subject].split('.');
        //   const dateObject = new Date(
        //     parseInt(dateParts[2], 10),
        //     parseInt(dateParts[1], 10) - 1,
        //     parseInt(dateParts[0], 10)
        //   );
        //   return { subject, date: dateObject };
        // });

        // // Sort the dates in ascending order
        // datesAsObjects?.sort((a: any, b: any) => a.date - b.date);

        // // Get the last date
        // const lastDate = datesAsObjects[datesAsObjects?.length - 1];



        // console.log(lastDate)
        // console.log(date)


        // const date1 = lastDate;
        // const date2 = date;

        // // Set the time components of both dates to zero
        // const newDate1 = new Date(date1);
        // newDate1.setHours(0, 0, 0, 0);

        // const newDate2 = new Date(date2);
        // newDate2.setHours(0, 0, 0, 0);

        // // Compare the dates
        // if (newDate1.getTime() === newDate2.getTime()) {
        //   console.log('The dates are equal.');
        // } else if (newDate1.getTime() < newDate2.getTime()) {
        //   console.log('date1 is before date2.');
        // } else {
        //   console.log('date1 is after date2.');
        // }




        // // const dateString: string = "20.07.2023";
        // // const [day, month, year]: number[] = dateString.split(".").map(Number);
        // // const dateObject: Date = new Date(year, month - 1, day);
        // // const timestamp: number = Math.floor(dateObject.getTime() / 1000);

        // // console.log(timestamp);

      }
    }, err => {
      if (err.status == 404) {
        // if (this.cls && this.stream) {
        //   this.classStreamFormValueSet();
        //   let params = {
        //     cls: this.cls,
        //     stream: this.stream,
        //     adminId: this.adminId,
        //   }
        //   this.getSingleClassSubjectByStream(params);
        // }
      }
    })
  }
  processData(examAdmitCard: any) {
    for (let i = 0; i < examAdmitCard.examDate.length; i++) {
      const subject = Object.keys(examAdmitCard.examDate[i])[0];
      const date = Object.values(examAdmitCard.examDate[i])[0];
      const startTime = Object.values(examAdmitCard.examStartTime[i])[0];
      const endTime = Object.values(examAdmitCard.examEndTime[i])[0];

      this.processedData.push({
        subject,
        date,
        timing: `${startTime} to ${endTime}`
      });
    }
  }

  addAdmitCardModel() {
    this.showModal = true;
  }
  openAdmitCardStructureModal(examAdmitCard: any) {
    this.showAdmitCardStructureModal = true;
    this.admitCardInfo = examAdmitCard;
    this.processData(examAdmitCard);
  }
  deleteAdmitCardStructureModel(id: String) {
    this.showModal = true;
    this.deleteMode = true;
    this.deleteById = id;
  }

  closeModal() {
    this.showModal = false;
    this.errorMsg = '';
    this.deleteMode = false;
    this.deleteById = '';
    this.showAdmitCardStructureModal = false;
    this.admitCardInfo;
    this.processedData = [];
    this.falseAllValue();
    this.admitcardForm.reset();
  }
  successDone(msg: any) {
    this.closeModal();
    this.getAdmitCardStructureByClass();
    setTimeout(() => {
      this.toastr.success('',msg);
    }, 500)
  }

  patch() {
    const controlOne = <FormArray>this.admitcardForm.get('type.examDate');
    this.classSubject.forEach((x: any) => {
      controlOne.push(this.patchExamDate(x.subject))
    })

    const controlTwo = <FormArray>this.admitcardForm.get('type.startTime');
    this.classSubject.forEach((x: any) => {
      controlTwo.push(this.patchStartTime(x.subject))
    })
    const controlThree = <FormArray>this.admitcardForm.get('type.endTime');
    this.classSubject.forEach((x: any) => {
      controlThree.push(this.patchEndTime(x.subject))
    })
  }
  patchExamDate(examDate: any) {
    return this.fb.group({
      [examDate]: ['', Validators.required,],
    })
  }
  patchStartTime(startTime: any) {
    return this.fb.group({
      [startTime]: ['', Validators.required,],
    })
  }

  patchEndTime(endTime: any) {
    return this.fb.group({
      [endTime]: ['', Validators.required,],
    })
  }

  admitcardAddUpdate() {
    this.admitcardForm.value.type.examDate = this.admitcardForm.value.type.examDate.map((exam: any) => {
      const subject = Object.keys(exam)[0];
      const dateStr = exam[subject];
      const dateObj = new Date(dateStr);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const formattedDate = `${day}.${month}.${year}`;
      return { [subject]: formattedDate };
    });
    this.admitcardForm.value.adminId = this.adminId;
    this.admitCardStructureService.addAdmitCardStructure(this.admitcardForm.value).subscribe((res: any) => {
      if (res) {
        this.successDone(res);
      }
    }, err => {
      this.errorCheck = true;
      this.errorMsg = err.error;
    })
    // }

  }

  onToggleChange(id: any, admitCardPublishStatus: any) {
    let params = {
      id: id,
      admitCardPublishStatus: admitCardPublishStatus
    }
    this.admitCardStructureService.changeAdmitCardPublishStatus(params)
      .subscribe(
        (response: any) => {
        },
        error => {
          console.log(error)
        }
      );
  }

  admitCardStructureDelete(id: String) {
    this.admitCardStructureService.deleteAdmitCardStructure(id).subscribe((res: any) => {
      if (res) {
        this.successDone(res);
        this.deleteById = '';
      }
    })
  }

}
