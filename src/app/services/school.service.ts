import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  url = `${environment.API_URL}/v1/school`;
  constructor(private http: HttpClient) { }
  getSchoolNameLogo() {
    return this.http.get<any>(`${this.url}/name-logo`);
  }
  addSchool(schoolData: any) {
    var formData: any = new FormData();
    formData.append('adminId', schoolData.adminId);
    formData.append('schoolName', schoolData.schoolName);
    formData.append('schoolLogo', schoolData.schoolLogo);
    formData.append('affiliationNumber', schoolData.affiliationNumber);
    formData.append('schoolCode', schoolData.schoolCode);
    formData.append('foundedYear', schoolData.foundedYear);
    formData.append('board', schoolData.board);
    formData.append('medium', schoolData.medium);
    formData.append('street', schoolData.street);
    formData.append('city', schoolData.city);
    formData.append('district', schoolData.district);
    formData.append('state', schoolData.state);
    formData.append('pinCode', schoolData.pinCode);
    formData.append('phoneOne', schoolData.phoneOne);
    formData.append('phoneSecond', schoolData.phoneSecond);
    formData.append('email', schoolData.email);
    console.log(formData)
    return this.http.post(this.url,formData);
  }
  getSchool(adminId:any) {
    return this.http.get<any>(`${this.url}/${adminId}`);
  }
  updateSchool(schoolData: any) {
    return this.http.put(`${this.url}/${schoolData._id}`, schoolData);
  }
  deleteSchool(id: String) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
