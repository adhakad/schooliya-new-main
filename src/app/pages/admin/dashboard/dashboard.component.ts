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
import { FeesService } from 'src/app/services/fees.service';

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
  adminId: string = '';
  totalFeesSum: number = 0;
  paidFeesSum: number = 0;
  dueFeesSum: number = 0;
  constructor(private adminAuthService: AdminAuthService, private adsService: AdsService, private bannerService: BannerService, private feesService: FeesService, private classSubjectService: ClassSubjectService, private classService: ClassService, private studentService: StudentService, private subjectService: SubjectService, private teacherService: TeacherService, private testimonialService: TestimonialService, private topperService: TopperService) { }

  ngOnInit(): void {
    let getAdmin = this.adminAuthService.getLoggedInAdminInfo();
    this.adminId = getAdmin?.id;
    this.adsCount();
    this.feesCollectionBySession();
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
  }
  initPieChart(): void {
    const chartDom = document.getElementById('pieChart') as HTMLElement;
    const chart = echarts.init(chartDom);

    const option = {
      title: {
        text: 'Fees Record',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#2c343c',
          fontSize: 18,
          fontWeight: 'bold',
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function (params: any) {
          return `${params.name} <br/> ${params.marker}  ₹${params.value} &nbsp; (${params.percent}%)`;
        },
        backgroundColor: '#fff',  // Custom background color
        textStyle: {
          fontSize: 12,  // Font size for tooltip text
          color: '#2c343c'  // Text color
        }
      },
      legend: {
        orient: 'horizontal',    // Horizontal legend
        left: 'center',          // Center align horizontally
        bottom: 0,               // Position it at the bottom
        textStyle: {
          color: '#2c343c',      // Custom color for legend text
        }
      },
      series: [
        {
          name: 'Fees Distribution',
          type: 'pie',
          radius: ['40%', '50%'], // Donut style pie chart
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 0, // Rounded borders for each slice
            borderColor: '#2c343c',
            borderWidth: 0,
          },
          label: {
            show: true,  // Enable labels in the pie chart
            formatter: function (params: any) {
              return `₹${params.value}`;  // Show name and amount
            },
            textStyle: {
              color: '#2c343c',  // Label text color
              fontSize: 12,   // Font size for label text
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '10',
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          data: [
            { value: this.paidFeesSum, name: 'Paid Fees', itemStyle: { color: '#8C52FF' } },
            { value: this.dueFeesSum, name: 'Due Fees', itemStyle: { color: '#e9ecff' } },
          ],
        }
      ],
      backgroundColor: '#fff', // Dark background for a modern look
      animationDuration: 1000,
      animationEasing: 'cubicOut' as 'cubicOut',
    };

    chart.setOption(option);
    window.addEventListener('resize', function () {
      chart.resize();  // Make chart responsive on window resize
    });
  }

  initBarChart(): void {
    const chartDom = document.getElementById('barChart') as HTMLElement;
    const chart = echarts.init(chartDom);

    const option = {
      title: {
        text: 'Fees Record 2023-2024',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#2c343c',
          fontSize: 18,
          fontWeight: 'bold',
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          const param = params[0];
          return `${param.name} <br/> ${param.marker}  ₹${param.value}`;
        },
        axisPointer: {
          type: 'shadow'
        },
        textStyle: {
          color: '#2c343c',
          fontSize: 12,
        }
      },
      grid: {
        top: 100,  // Increase this value to give more space under the title
        left: '2%',
        right: '2%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['Total Fees', 'Paid Fees', 'Due Fees'],
        axisLine: {
          lineStyle: {
            color: '#2c343c'
          }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#2c343c'
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Fees',
          type: 'bar',
          data: [
            { value: this.totalFeesSum, itemStyle: { color: '#8C52FF' } },
            { value: this.paidFeesSum, itemStyle: { color: '#35a831' } },
            { value: this.dueFeesSum, itemStyle: { color: '#e45757' } },
          ],
          barWidth: '50%',
        }
      ],
      backgroundColor: '#fff',
      animationDuration: 1000,
      animationEasing: 'cubicOut' as 'cubicOut'
    };

    chart.setOption(option);
    window.addEventListener('resize', function () {
      chart.resize();  // Make chart responsive on window resize
    });
  }


  // initLineChart(): void {
  //   const chartDom = document.getElementById('lineChart') as HTMLElement;
  //   const chart = echarts.init(chartDom);

  //   const option = {
  //     title: {
  //       text: 'Fees Collection Line Chart',
  //       left: 'center',
  //       top: 20,
  //       textStyle: {
  //         color: '#ffffff',
  //         fontSize: 18,
  //         fontWeight: 'bold',
  //       }
  //     },
  //     tooltip: {
  //       trigger: 'axis',
  //       axisPointer: {
  //         type: 'line'
  //       }
  //     },
  //     xAxis: {
  //       type: 'category',
  //       data: ['TOTAL FEES', 'PAID FEES', 'FEES DISCOUNT', 'DUE FEES', 'OVERALL FEES'],
  //       axisLine: {
  //         lineStyle: {
  //           color: '#ffffff'
  //         }
  //       },
  //       axisTick: {
  //         show: false
  //       }
  //     },
  //     yAxis: {
  //       type: 'value',
  //       axisLine: {
  //         lineStyle: {
  //           color: '#ffffff'
  //         }
  //       },
  //       splitLine: {
  //         lineStyle: {
  //           type: 'dashed'
  //         }
  //       }
  //     },
  //     series: [
  //       {
  //         name: 'Fees',
  //         type: 'line',
  //         data: [
  //           { value: 1048, itemStyle: { color: '#8C52FF' } },  // TOTAL FEES
  //           { value: 735, itemStyle: { color: '#a3e74b' } },   // PAID FEES
  //           { value: 580, itemStyle: { color: '#d8c5ff' } },   // FEES DISCOUNT
  //           { value: 484, itemStyle: { color: '#ff7252' } },   // DUE FEES
  //           { value: 300, itemStyle: { color: '#d8c5ff' } }    // OVERALL FEES COLLECTION
  //         ],
  //         lineStyle: {
  //           width: 3
  //         },
  //         symbol: 'circle',
  //         symbolSize: 10
  //       }
  //     ],
  //     backgroundColor: '#2c343c',
  //     animationDuration: 1000,
  //     animationEasing: 'cubicOut' as 'cubicOut'
  //   };

  //   chart.setOption(option);
  //   window.addEventListener('resize', function() {
  //     chart.resize();  // Make chart responsive on window resize
  //   });
  // }

  adsCount() {
    this.adsService.getAdsCount().subscribe((res: any) => {
      this.adsCountInfo = res.countAds;
    })
  }
  feesCollectionBySession() {
    let params = {
      adminId: this.adminId,
      session: '2023-2024'
    }
    this.feesService.feesCollectionBySession(params).subscribe((res: any) => {
      if (res) {
        this.totalFeesSum = res.totalFeesSum;
        this.paidFeesSum = res.paidFeesSum;
        this.dueFeesSum = res.dueFeesSum;
        this.initPieChart();
        this.initBarChart();
      }
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
