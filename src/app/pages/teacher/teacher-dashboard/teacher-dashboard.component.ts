import { Component, OnInit } from '@angular/core';
import { AdsService } from 'src/app/services/ads.service';

import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { BannerService } from 'src/app/services/banner.service';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { ClassService } from 'src/app/services/class.service';
import { StudentService } from 'src/app/services/student.service';
import { SubjectService } from 'src/app/services/subject.service';
import { ExamResultService } from 'src/app/services/exam-result.service';
import { IssuedTransferCertificateService } from 'src/app/services/issued-transfer-certificate.service';
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
  markshhetCountInfo: any;
  teacherCountInfo: any;
  transferCertificateCountInfo: any;
  loader: Boolean = true;
  adminId!: String;
  constructor(private classService: ClassService, private studentService: StudentService, private subjectService: SubjectService, private examResultService: ExamResultService, private issuedTransferCertificateService: IssuedTransferCertificateService, private teacherService: TeacherService, private teacherAuthService: TeacherAuthService) { }

  ngOnInit(): void {
    let getTeacher = this.teacherAuthService.getLoggedInTeacherInfo();
    this.adminId = getTeacher?.adminId;
    this.studentCount();
    this.teacherCount();
    this.marksheetCount();
    this.transferCertificateCount();
  }

  studentCount() {
    let params = {
      adminId: this.adminId
    }
    this.studentService.getStudentCount(params).subscribe((res: any) => {
      this.studentCountInfo = res.countStudent;
    })
  }
  teacherCount() {
    let params = {
      adminId: this.adminId
    }
    this.teacherService.getTeacherCount(params).subscribe((res: any) => {
      this.teacherCountInfo = res.countTeacher;
    })
  }

  marksheetCount() {
    let params = {
      adminId: this.adminId
    }
    this.examResultService.geteExamResultCount(params).subscribe((res: any) => {
      this.markshhetCountInfo = res.countExamResult;
    })
  }
  transferCertificateCount() {
    let params = {
      adminId: this.adminId
    }
    this.issuedTransferCertificateService.getIssuedTransferCertificateCount(params).subscribe((res: any) => {
      this.transferCertificateCountInfo = res.countIssuedTransferCertificate;
    })
  }


}
