import { Component, OnInit } from '@angular/core';
import { SchoolService } from 'src/app/services/school.service';
import { environment } from 'src/environments/environment';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  currentYear: any;
  schoolInfo:any;
  whatsapp:string = 'https://wa.me/919302798269';
  facebook:string = 'https://www.facebook.com/profile.php?id=61563830046242';
  linkedin:string = 'https://www.linkedin.com/company/schooliya-official';
  instagram:string='https://www.instagram.com/schooliya_official';
  youtube:string = 'https://www.youtube.com/@Schooliya-f8f';
  softwareCompanyLink:string='https://schooliya.in';
  adminId!:any;
  constructor(private schoolService:SchoolService,private adminAuthService:AdminAuthService) { }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.getSchool();
    this.currentYear = (new Date()).getFullYear();
  }
  socialMediaRedirect(link:string){
    const sanitizedLink = encodeURI(link);
    window.location.href = sanitizedLink;
  }
  softwareCompany(link:string){
    const sanitizedLink = encodeURI(link);
    window.location.href = sanitizedLink;
  }
  getSchool(){
    this.schoolService.getSchool(this.adminId).subscribe((res:any)=> {
      if(res){
        this.schoolInfo = res;
        this.whatsapp = 'https://wa.me/919302798269'
        this.facebook = 'https://www.facebook.com/profile.php?id=61563830046242';
        this.linkedin = 'https://www.linkedin.com/company/schooliya-official';
        this.instagram = 'https://www.instagram.com/schooliya_official';
        this.youtube = 'https://www.youtube.com/@Schooliya-f8f';
        
      }
    })
  }

}
