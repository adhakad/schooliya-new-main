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

    this.initPieChart();
    this.initBarChart();
    this.initLineChart();
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
          color: '#fff',
          fontSize: 18,
          fontWeight: 'bold',
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params:any) {
          return `${params.marker} ${params.name}: ₹${params.value} (${params.percent}%)`;
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
          color: '#fff',      // Custom color for legend text
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
            borderColor: '#fff',
            borderWidth: 0,
          },
          label: {
            show: true,  // Enable labels in the pie chart
            formatter: function(params:any) {
              return `₹${params.value}`;  // Show name and amount
            },
            textStyle: {
              color: '#fff',  // Label text color
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
            { value: 1048, name: 'TOTAL FEES', itemStyle: { color: '#8C52FF' } },
            { value: 735, name: 'PAID FEES', itemStyle: { color: '#a3e74b' } },
            { value: 580, name: 'FEES DISCOUNT', itemStyle: { color: '#d8c5ff' } },
            { value: 484, name: 'DUE FEES', itemStyle: { color: '#ff7252' } },
            { value: 300, name: 'OVERALL FEES', itemStyle: { color: '#d8c5ff' } },
          ],
        }
      ],
      backgroundColor: '#2c343c', // Dark background for a modern look
      animationDuration: 1000,
      animationEasing: 'cubicOut' as 'cubicOut',
    };
  
    chart.setOption(option);
    window.addEventListener('resize', function() {
      chart.resize();  // Make chart responsive on window resize
    });
  }
  
  initBarChart(): void {
    const chartDom = document.getElementById('barChart') as HTMLElement;
    const chart = echarts.init(chartDom);
  
    const option = {
      title: {
        text: 'Fees Collection Bar Chart',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: ['January', 'February', 'March', 'April', 'May','June','July','August','September','October', 'November','November'],
        axisLine: {
          lineStyle: {
            color: '#ffffff'
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
            color: '#ffffff'
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
            { value: 1048, itemStyle: { color: '#8C52FF' } },  // TOTAL FEES
            { value: 735, itemStyle: { color: '#8C52FF' } },   // PAID FEES
            { value: 580, itemStyle: { color: '#8C52FF' } },   // FEES DISCOUNT
            { value: 484, itemStyle: { color: '#8C52FF' } },   // DUE FEES
            { value: 300, itemStyle: { color: '#8C52FF' } },
            { value: 300, itemStyle: { color: '#8C52FF' } },
            { value: 500, itemStyle: { color: '#8C52FF' } },
            { value: 3900, itemStyle: { color: '#8C52FF' } },
            { value: 3300, itemStyle: { color: '#8C52FF' } },
            { value: 3800, itemStyle: { color: '#8C52FF' } },
            { value: 450, itemStyle: { color: '#8C52FF' } },
            { value: 1000, itemStyle: { color: '#8C52FF' } },   // OVERALL FEES COLLECTION
          ],
          barWidth: '50%',
        }
      ],
      backgroundColor: '#2c343c',
      animationDuration: 1000,
      animationEasing: 'cubicOut' as 'cubicOut'
    };
  
    chart.setOption(option);
    window.addEventListener('resize', function() {
      chart.resize();  // Make chart responsive on window resize
    });
  }
  initLineChart(): void {
    const chartDom = document.getElementById('lineChart') as HTMLElement;
    const chart = echarts.init(chartDom);
  
    const option = {
      title: {
        text: 'Fees Collection Line Chart',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold',
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line'
        }
      },
      xAxis: {
        type: 'category',
        data: ['TOTAL FEES', 'PAID FEES', 'FEES DISCOUNT', 'DUE FEES', 'OVERALL FEES'],
        axisLine: {
          lineStyle: {
            color: '#ffffff'
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
            color: '#ffffff'
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
          type: 'line',
          data: [
            { value: 1048, itemStyle: { color: '#8C52FF' } },  // TOTAL FEES
            { value: 735, itemStyle: { color: '#a3e74b' } },   // PAID FEES
            { value: 580, itemStyle: { color: '#d8c5ff' } },   // FEES DISCOUNT
            { value: 484, itemStyle: { color: '#ff7252' } },   // DUE FEES
            { value: 300, itemStyle: { color: '#d8c5ff' } }    // OVERALL FEES COLLECTION
          ],
          lineStyle: {
            width: 3
          },
          symbol: 'circle',
          symbolSize: 10
        }
      ],
      backgroundColor: '#2c343c',
      animationDuration: 1000,
      animationEasing: 'cubicOut' as 'cubicOut'
    };
  
    chart.setOption(option);
    window.addEventListener('resize', function() {
      chart.resize();  // Make chart responsive on window resize
    });
  }

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
