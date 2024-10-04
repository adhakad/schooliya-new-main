import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChunkPipe } from '../chunk.pipe';
import { ClassSuffixPipe } from '../class-suffix.pipe';
import { DateToWordsPipe } from '../date-to-words.pipe';
import { SecureEmailPipe } from '../secure-email.pipe';



@NgModule({
  declarations: [
    ChunkPipe,
    ClassSuffixPipe,
    DateToWordsPipe,
    SecureEmailPipe
  ],
  imports: [
    CommonModule
  ],
  exports:[
    ChunkPipe,
    ClassSuffixPipe,
    DateToWordsPipe,
    SecureEmailPipe
  ]
})
export class SharedPipeModule { }
