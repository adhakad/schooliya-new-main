import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChunkPipe } from '../chunk.pipe';
import { ClassSuffixPipe } from '../class-suffix.pipe';
import { DateToWordsPipe } from '../date-to-words.pipe';
import { SecureEmailPipe } from '../secure-email.pipe';
import { NumberToWordsPipe } from '../number-to-words.pipe';


@NgModule({
  declarations: [
    ChunkPipe,
    ClassSuffixPipe,
    DateToWordsPipe,
    SecureEmailPipe,
    NumberToWordsPipe
  ],
  imports: [
    CommonModule
  ],
  exports:[
    ChunkPipe,
    ClassSuffixPipe,
    DateToWordsPipe,
    SecureEmailPipe,
    NumberToWordsPipe
  ]
})
export class SharedPipeModule { }
