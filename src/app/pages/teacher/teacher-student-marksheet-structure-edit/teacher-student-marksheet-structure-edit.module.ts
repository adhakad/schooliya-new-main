import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeacherStudentMarksheetStructureEditRoutingModule } from './teacher-student-marksheet-structure-edit-routing.module';
import { TeacherStudentMarksheetStructureEditComponent } from './teacher-student-marksheet-structure-edit.component';


@NgModule({
  declarations: [
    TeacherStudentMarksheetStructureEditComponent
  ],
  imports: [
    CommonModule,
    TeacherStudentMarksheetStructureEditRoutingModule
  ]
})
export class TeacherStudentMarksheetStructureEditModule { }
