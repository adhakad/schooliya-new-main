import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransferCertificateRoutingModule } from './transfer-certificate-routing.module';
import { TransferCertificateComponent } from './transfer-certificate.component';


@NgModule({
  declarations: [
    TransferCertificateComponent
  ],
  imports: [
    CommonModule,
    TransferCertificateRoutingModule
  ]
})
export class TransferCertificateModule { }
