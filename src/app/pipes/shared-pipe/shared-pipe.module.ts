import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChunkPipe } from '../chunk.pipe';
import { ClassSuffixPipe } from '../class-suffix.pipe';
import { DateToWordsPipe } from '../date-to-words.pipe';
import { SecureEmailPipe } from '../secure-email.pipe';
import { NumberToWordsPipe } from '../number-to-words.pipe';
import { FormatMarksTypePipe } from '../format-marks-type.pipe';
import { TitlecaseSeparatorPipe } from '../titlecase-separator.pipe';


@NgModule({
  declarations: [
    ChunkPipe,
    ClassSuffixPipe,
    DateToWordsPipe,
    SecureEmailPipe,
    NumberToWordsPipe,
    FormatMarksTypePipe,
    TitlecaseSeparatorPipe
  ],
  imports: [
    CommonModule
  ],
  exports:[
    ChunkPipe,
    ClassSuffixPipe,
    DateToWordsPipe,
    SecureEmailPipe,
    NumberToWordsPipe,
    FormatMarksTypePipe,
    TitlecaseSeparatorPipe
  ]
})
export class SharedPipeModule { }
