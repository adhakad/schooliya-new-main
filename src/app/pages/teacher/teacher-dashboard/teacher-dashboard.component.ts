import { Component, OnInit } from '@angular/core';
import { AdsService } from 'src/app/services/ads.service';

import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { BannerService } from 'src/app/services/banner.service';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { ClassService } from 'src/app/services/class.service';
import { StudentService } from 'src/app/services/student.service';
import { SubjectService } from 'src/app/services/subject.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { TestimonialService } from 'src/app/services/testimonial.service';
import { TopperService } from 'src/app/services/topper.service';
import { TeacherAuthService } from 'src/app/services/auth/teacher-auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css']
})
export class TeacherDashboardComponent implements OnInit {

  cookieValue: any;


  classCountInfo: any;
  studentCountInfo: any;
  subjectCountInfo: any;
  loader: Boolean = true;
  adminId!:String;
  constructor(private classService: ClassService, private studentService: StudentService, private subjectService: SubjectService,private teacherAuthService: TeacherAuthService) { }

  ngOnInit(): void {
    let getTeacher = this.teacherAuthService.getLoggedInTeacherInfo();
    this.adminId = getTeacher?.adminId;
    console.log(this.adminId)
    this.classCount();
    this.studentCount();
    this.subjectCount();
  }

  classCount() {
    this.classService.getClassCount().subscribe((res: any) => {
      if (res) {
        this.classCountInfo = res.countClass;
      }

    })
  }
  studentCount() {
    this.studentService.getStudentCount().subscribe((res: any) => {
      if (res) {
        this.studentCountInfo = res.countStudent;
      }
    })
  }

  subjectCount() {
    this.subjectService.getSubjectCount().subscribe((res: any) => {
      if (res) {
        this.subjectCountInfo = res.countSubject;
        setTimeout(() => {
          this.loader = false;
        }, 1000)
      }
    })
  }
}
