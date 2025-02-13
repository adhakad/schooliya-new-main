import { Component, OnInit } from '@angular/core';
import { TeacherAuthService } from 'src/app/services/auth/teacher-auth.service';
import { TeacherService } from 'src/app/services/teacher.service';
@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent implements OnInit {
  teacherInfo:any;
  admissionPermission:boolean = false;
  studentPermission:boolean = false;
  admitCardPermission:boolean = false;
  marksheetPermission:boolean = false;
  feeCollectionPermission:boolean = false;
  promoteFailPermission:boolean = false;
  transferCertificatePermission:boolean = false;
  adminId!: String
  constructor(private teacherAuthService:TeacherAuthService,private teacherService:TeacherService) { }

  ngOnInit(): void {
    this.teacherInfo = this.teacherAuthService.getLoggedInTeacherInfo();
    this.adminId = this.teacherInfo?.adminId;
    if(this.teacherInfo){
      this.getTeacherById(this.teacherInfo)
    }
  }

  getTeacherById(teacherInfo:any){
    let params = {
      adminId:teacherInfo.adminId,
      teacherUserId:teacherInfo.id,
    }
    this.teacherService.getTeacherById(params).subscribe((res:any)=> {
      if(res){
        if(res.admissionPermission.status==true){
          this.admissionPermission = true;
        }
        if(res.studentPermission.status==true){
          this.studentPermission = true;
        }
        if(res.feeCollectionPermission.status==true){
          this.feeCollectionPermission = true;
        }
        if(res.admitCardPermission.status==true){
          this.admitCardPermission = true;
        }
        if(res.marksheetPermission.status==true){
          this.marksheetPermission = true;
        }
        if(res.promoteFailPermission.status==true){
          this.promoteFailPermission = true;
        }
        if(res.transferCertificatePermission.status==true){
          this.transferCertificatePermission = true;
        }
      }
    })
  }

}
