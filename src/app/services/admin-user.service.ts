import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AdminUserService {

  url = `${environment.API_URL}/v1/admin`;
  constructor(private http: HttpClient) { }
  getSingleAdminUser(adminId: any) {
    return this.http.get(`${this.url}/admin-user/${adminId}`);
  }
  updateAdminDetail(adminDetailData: any) {
    console.log(adminDetailData)
      return this.http.put(`${this.url}/admin-detail/${adminDetailData._id}`, adminDetailData);
    }
}