import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  url = `${environment.API_URL}/v1/reminder`;
  constructor(private http: HttpClient) { }

  sendFeesReminder(feesReminderData: any) {
    return this.http.post(this.url, feesReminderData);
  }
  addFeesReminderFilter(allFilterData: any) {
    return this.http.post(`${this.url}/filter-create`, allFilterData);
  }
  studentFilter(studentFilterData: any) {
    return this.http.post(`${this.url}/student-filter`, studentFilterData);
  }
}
