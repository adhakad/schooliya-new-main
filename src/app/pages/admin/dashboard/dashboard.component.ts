import { Component, OnInit } from '@angular/core';
import * as echarts from 'echarts';
import { AdsService } from 'src/app/services/ads.service';

import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';
import { BannerService } from 'src/app/services/banner.service';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { ClassService } from 'src/app/services/class.service';
import { StudentService } from 'src/app/services/student.service';
import { SubjectService } from 'src/app/services/subject.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { TestimonialService } from 'src/app/services/testimonial.service';
import { TopperService } from 'src/app/services/topper.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cookieValue: any;
  adsCountInfo: any;
  bannerCountInfo: any;
  classSubjectCountInfo: any;
  classCountInfo: any;
  studentCountInfo: any;
  studyMaterialCountInfo: any;
  subjectCountInfo: any;
  teacherCountInfo: any;
  testCountInfo: any;
  testimonialCountInfo: any;
  topperCountInfo: any;
  loader: Boolean = true;
  constructor(private adminAuthService: AdminAuthService, private adsService: AdsService, private bannerService: BannerService, private classSubjectService: ClassSubjectService, private classService: ClassService, private studentService: StudentService, private subjectService: SubjectService, private teacherService: TeacherService, private testimonialService: TestimonialService, private topperService: TopperService) { }

  ngOnInit(): void {
    this.adsCount();
    this.bannerCount();
    this.classSubjectCount();
    this.classCount();
    this.studentCount();
    this.subjectCount();
    this.teacherCount();
    this.testimonialCount();
    this.topperCount();
    setTimeout(() => {
      this.loader = false;
    }, 1000)

    // this.initLineChart();
    this.initPieChart();
  }


  initPieChart() {

    var chart = echarts.init(document.getElementById('pieChart'));
    var option = {
      title: {
        text: 'Customized Pie Chart',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: '#ffffff' // Custom color for legend text
        }
      },
      series: [
        {
          name: 'FEES RECORD',
          type: 'pie',
          radius: '50%', // Donut style pie chart
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 0,  // Rounded borders for each slice
          borderColor: '#fff',
          borderWidth: 1
        },
          data: [
            { value: 1048, name: 'TOTAL FEES' ,itemStyle: { color: '#8C52FF' }},
            { value: 735, name: 'PAID FEES',itemStyle:{color:'#a3e74b'} },
            { value: 580, name: 'FEES DISCOUNT',itemStyle:{color:'#d8c5ff'}  },
            { value: 484, name: 'DUE FEES',itemStyle:{color: '#ff7252'}},
            { value: 300, name: 'OVERALL FEES CLLECTION',itemStyle:{color:'#d8c5ff'}  }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          backgroundColor: '#2c343c',  // Dark background for a modern look
    animationDuration: 1000,
    animationEasing: 'cubicOut'
        }
      ]
    };
    chart.setOption(option);
  }

  // Initialize Line Chart
  // initLineChart(): void {
  //   const lineChartDom = document.getElementById('lineChart') as HTMLElement;
  //   const lineChart = echarts.init(lineChartDom);
  //   const lineOption = {
  //     xAxis: {
  //       type: 'category',
  //       data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  //     },
  //     yAxis: {
  //       type: 'value'
  //     },
  //     series: [
  //       {
  //         data: [50, 100, 150, 200, 250, 300, 350],
  //         type: 'line'
  //       }
  //     ]
  //   };
  //   lineChart.setOption(lineOption);
  // }







  // const pieChartDom = document.getElementById('pieChart') as HTMLElement;
  // const pieChart = echarts.init(pieChartDom);
  // const pieOption = {
  //   tooltip: {
  //     trigger: 'item'
  //   },
  //   legend: {
  //     top: '5%',
  //     left: 'center'
  //   },
  //   series: [
  //     {
  //       name: 'Access From',
  //       type: 'pie',
  //       radius: ['40%', '70%'],
  //       avoidLabelOverlap: false,
  //       itemStyle: {
  //         borderRadius: 10,
  //         borderColor: '#fff',
  //         borderWidth: 2
  //       },
  //       label: {
  //         show: false,
  //         position: 'center'
  //       },
  //       emphasis: {
  //         label: {
  //           show: true,
  //           fontSize: '20',
  //           fontWeight: 'bold'
  //         }
  //       },
  //       labelLine: {
  //         show: false
  //       },
  //       data: [
  //         { value: 1048, name: 'Search Engine' },
  //         { value: 735, name: 'Direct' },
  //         { value: 580, name: 'Email' },
  //         { value: 484, name: 'Union Ads' },
  //         { value: 300, name: 'Video Ads' }
  //       ]
  //     }
  //   ]
  // };
  // pieChart.setOption(pieOption);



  adsCount() {
    this.adsService.getAdsCount().subscribe((res: any) => {
      this.adsCountInfo = res.countAds;
    })
  }
  bannerCount() {
    this.bannerService.getBannerCount().subscribe((res: any) => {
      this.bannerCountInfo = res.countBanner;
    })
  }
  classSubjectCount() {
    this.classSubjectService.getClassSubjectCount().subscribe((res: any) => {
      this.classSubjectCountInfo = res.countClassSubject;
    })
  }
  classCount() {
    this.classService.getClassCount().subscribe((res: any) => {
      this.classCountInfo = res.countClass;
    })
  }
  studentCount() {
    this.studentService.getStudentCount().subscribe((res: any) => {
      this.studentCountInfo = res.countStudent;
    })
  }
  subjectCount() {
    this.subjectService.getSubjectCount().subscribe((res: any) => {
      this.subjectCountInfo = res.countSubject;
    })
  }
  teacherCount() {
    this.teacherService.getTeacherCount().subscribe((res: any) => {
      this.teacherCountInfo = res.countTeacher;
    })
  }
  testimonialCount() {
    this.testimonialService.getTestimonialCount().subscribe((res: any) => {
      this.testimonialCountInfo = res.countTestimonial;
    })
  }
  topperCount() {
    this.topperService.getTopperCount().subscribe((res: any) => {
      this.topperCountInfo = res.countTopper;
    })
  }

}
