'use client';

import { 
  ArrowUpRight, 
  Plus, 
  Calendar, 
  MapPin, 
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { PageTransition } from '@/components/animations/page-transition';
import { RadialBarChart, RadialBar, Label, PolarRadiusAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { name: "Tournaments", completed: 124, inProgress: 32, upcoming: 24 }
];

const chartConfig = {
  completed: {
    label: "Completed",
    color: "#FFFFFF",
  },
  inProgress: {
    label: "In-Progress",
    color: "#FBBF24",
  },
  upcoming: {
    label: "Upcoming",
    color: "#60A5FA",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const tournaments = [
    { id: 1, title: 'Old Guard Games Anniversary Tournament', date: '05/24', location: 'Old Guard Games, Milwaukee' },
    { id: 2, title: 'USCF-Rated Scholastic June Summer Tournament', date: '06/21', location: 'Old Guard Games, Milwaukee' },
    { id: 3, title: 'USCF-Rated Scholastic July Summer Tournament', date: '07/19', location: 'Old Guard Games, Milwaukee' },
    { id: 4, title: 'Old Guard Games Anniversary Tournament', date: '08/16', location: 'Old Guard Games, Milwaukee' },
    { id: 5, title: 'USCF-Rated Scholastic August Summer Tournament', date: '08/30', location: 'Old Guard Games, Milwaukee' },
    { id: 6, title: 'Fall Open Chess Championship', date: '09/15', location: 'Old Guard Games, Milwaukee' },
    { id: 7, title: 'USCF-Rated Scholastic September Tournament', date: '09/29', location: 'Old Guard Games, Milwaukee' },
    { id: 8, title: 'Old Guard Games Halloween Blitz Tournament', date: '10/31', location: 'Old Guard Games, Milwaukee' },
    { id: 9, title: 'Annual Chess Club Championship', date: '11/25', location: 'Old Guard Games, Milwaukee' },
  ];

  return (
    <PageTransition>
      <div className="flex flex-col gap-6 w-full h-full font-sans">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <h1 className="font-poppins font-semibold text-[44px] leading-[54px] tracking-[-0.019em] text-[#083F92] m-0">
          Dashboard
        </h1>
        
        {/* Actions Button Group */}
        <div className="flex items-center gap-[12px] bg-[#083F92]/10 p-2.5 rounded-[100px] shadow-sm shrink-0">
          {/* Button 1: Already uploaded file */}
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent text-[#000000] hover:bg-black/5 rounded-[100px] transition-colors focus:outline-none">
            <div className="w-[32px] h-[32px] bg-[#083F92] rounded-full flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <span className="font-poppins font-medium text-[12px] leading-[20px] tracking-[-0.019em]">
              Already uploaded.File
            </span>
          </button>
          
          {/* Vertical divider */}
          <div className="w-[2px] h-6 bg-[#083F92] shrink-0" />
          
          {/* Button 2: Import Master File */}
          <button className="flex items-center gap-2 px-4 py-2 bg-transparent text-[#000000] hover:bg-black/5 rounded-[100px] transition-colors focus:outline-none">
            <div className="w-[32px] h-[32px] bg-[#083F92] rounded-full flex items-center justify-center text-white">
              <Plus className="w-5 h-5" />
            </div>
            <span className="font-poppins font-medium text-[14px] leading-[20px] tracking-[-0.019em]">
              Import Master File
            </span>
          </button>
        </div>
      </div>

      {/* Description Subheader */}
      <p className="font-poppins font-light text-[14px] md:text-[16px] leading-[150%] tracking-[-0.019em] text-[#565656] m-0 max-w-[750px]">
        Overview of platform performance, including user activity, revenue insights, memberships, and tournament statistics to help you monitor and manage everything efficiently.
      </p>

      {/* Main Stats and List Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        
        {/* Left Side: Stats and Gauge Chart */}
        <div className="xl:col-span-6 flex flex-col gap-6 w-full">
          
          {/* Stats Cards Row */}
          <div className="flex flex-row gap-6 w-full flex-wrap lg:flex-nowrap">
            
            {/* Card 1: Total Users */}
            <div className="w-[236.5px] h-[240px] bg-[#083F92]/10 rounded-[16px] relative shadow-sm group hover:shadow-md transition-all duration-200 shrink-0">
              <span className="absolute left-[16px] top-[16px] font-poppins font-light text-[16px] leading-[24px] tracking-[-0.019em] text-[#000000]/70">
                Total User's Count
              </span>
              <button className="absolute right-[8px] top-[8px] w-[42px] h-[42px] bg-[#083F92] text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                <ArrowUpRight className="w-5 h-5" />
              </button>
              
              <h2 className="absolute left-[16px] top-[93px] h-[54px] font-poppins font-semibold text-[44px] leading-[54px] tracking-[-0.019em] text-[#083F92] flex items-center">
                6420
              </h2>
              
              <div className="absolute left-[14px] top-[202px] flex items-center gap-[4px] h-[24px]">
                <div className="w-[45px] h-[24px] bg-[#083F92] rounded-[8px] flex items-center justify-center gap-[2px] px-[6px] py-[3px] text-white">
                  <span className="font-poppins font-normal text-[12px] leading-[18px]">34</span>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="w-[8px] h-[8px] fill-current">
                    <path d="M4 1L8 7H0L4 1Z" />
                  </svg>
                </div>
                <span className="font-poppins font-normal text-[12px] leading-[18px] tracking-[-0.02em] text-[#000000]">
                  Increased from last month
                </span>
              </div>
            </div>

            {/* Card 2: Active Users */}
            <div className="w-[236.5px] h-[240px] bg-[#083F92]/10 rounded-[16px] relative shadow-sm group hover:shadow-md transition-all duration-200 shrink-0">
              <span className="absolute left-[16px] top-[16px] font-poppins font-light text-[16px] leading-[24px] tracking-[-0.019em] text-[#000000]/70">
                Active User Count
              </span>
              <button className="absolute right-[8.5px] top-[8px] w-[42px] h-[42px] bg-[#083F92] text-white rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                <ArrowUpRight className="w-5 h-5" />
              </button>
              
              <h2 className="absolute left-[16px] top-[93px] h-[54px] font-poppins font-semibold text-[44px] leading-[54px] tracking-[-0.019em] text-[#083F92] flex items-center">
                5320
              </h2>
              
              <div className="absolute left-[14.5px] top-[202px] flex items-center gap-[4px] h-[24px]">
                <div className="w-[45px] h-[24px] bg-[#083F92] rounded-[8px] flex items-center justify-center gap-[2px] px-[6px] py-[3px] text-white">
                  <span className="font-poppins font-normal text-[12px] leading-[18px]">34</span>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="w-[8px] h-[8px] fill-current">
                    <path d="M4 1L8 7H0L4 1Z" />
                  </svg>
                </div>
                <span className="font-poppins font-normal text-[12px] leading-[18px] tracking-[-0.02em] text-[#000000]">
                  Increased from last month
                </span>
              </div>
            </div>

          </div>

          {/* Tournament Progress Card */}
          <div className="h-[476px] bg-[#083F92] rounded-[32.9px] p-8 flex flex-col justify-between relative overflow-hidden shadow-lg text-white">
            <span className="font-poppins font-semibold text-[16px] leading-[150%] tracking-[-0.019em] text-[#F6F6F6]/90 self-start z-10">
              Tournament Progress
            </span>
            
            {/* Shadcn Stacked Radial Chart */}
            <div className="flex flex-col items-center justify-center relative w-full h-[244px] z-10 mt-4">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square w-full max-w-[250px]"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={130}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 16}
                                className="fill-white text-[44px] font-poppins font-semibold tracking-[-0.05em]"
                              >
                                180
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 20}
                                className="fill-white/80 font-poppins font-light text-[12px] tracking-[-0.02em]"
                              >
                                Total Tournaments
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                  <RadialBar
                    dataKey="completed"
                    stackId="a"
                    cornerRadius={5}
                    fill="var(--color-completed)"
                    className="stroke-transparent stroke-2"
                  />
                  <RadialBar
                    dataKey="inProgress"
                    fill="var(--color-inProgress)"
                    stackId="a"
                    cornerRadius={5}
                    className="stroke-transparent stroke-2"
                  />
                  <RadialBar
                    dataKey="upcoming"
                    fill="var(--color-upcoming)"
                    stackId="a"
                    cornerRadius={5}
                    className="stroke-transparent stroke-2"
                  />
                </RadialBarChart>
              </ChartContainer>
            </div>

            {/* Bottom Chart Legends */}
            <div className="flex justify-between items-center w-full max-w-[318px] mx-auto z-10 border-t border-white/10 pt-4 text-nowrap">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FFFFFF] shrink-0" />
                <span className="font-poppins font-medium text-[13px] leading-[18px] text-white">
                  124 Completed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FBBF24] shrink-0" />
                <span className="font-poppins font-medium text-[13px] leading-[18px] text-white">
                  32 In-Progress
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#60A5FA] shrink-0" />
                <span className="font-poppins font-medium text-[13px] leading-[18px] text-white">
                  24 Upcoming
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Scrollable Upcoming Tournaments List */}
        <div className="xl:col-span-6 w-full h-[740px] bg-white rounded-[16px] p-6 shadow-md flex flex-col">
          
          {/* Header Row */}
          <div className="flex justify-between items-center w-full border-b pb-4 mb-4 shrink-0">
            <span className="font-poppins font-semibold text-[16px] leading-[150%] tracking-[-0.019em] text-[#083F92]">
              34 Upcoming Tournaments
            </span>
            <Link 
              href="/tournaments" 
              className="font-poppins font-normal text-[12px] leading-[150%] tracking-[-0.019em] text-[#083F92] underline hover:opacity-80 transition-opacity"
            >
              See All
            </Link>
          </div>
          
          {/* Scrollable List Container */}
          <div className="flex-grow overflow-y-auto pr-1 flex flex-col gap-3 max-h-[640px]">
            {tournaments.map((t, index) => {
              const isOdd = index % 2 === 0;
              return (
                <div 
                  key={t.id} 
                  className={`w-full h-[72px] flex items-center justify-between px-4 py-3 rounded-[8px] transition-all duration-150 hover:shadow-sm cursor-pointer border border-[#083F92]/5 ${
                    isOdd ? 'bg-[#083F92]/5' : 'bg-white'
                  }`}
                >
                  {/* Left block info */}
                  <div className="flex flex-col items-start gap-1 justify-center max-w-[85%]">
                    <span className="font-poppins font-medium text-[13px] leading-[17px] tracking-[-0.03em] text-[#000000] truncate w-full">
                      {t.title}
                    </span>
                    <div className="flex items-center gap-4 w-full">
                      {/* Date details */}
                      <div className="flex items-center gap-1 text-[#000000]/70">
                        <Calendar className="w-3.5 h-3.5 text-[#083F92]" />
                        <span className="font-poppins font-light text-[11px] leading-[14px] tracking-[-0.02em]">
                          {t.date}
                        </span>
                      </div>
                      {/* Location details */}
                      <div className="flex items-center gap-1 text-[#000000]/70 truncate max-w-[70%]">
                        <MapPin className="w-3.5 h-3.5 text-[#083F92]" />
                        <span className="font-poppins font-light text-[11px] leading-[14px] truncate">
                          {t.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right chevron action */}
                  <ChevronRight className="w-4 h-4 text-[#000000]/80 shrink-0" />
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
    </PageTransition>
  );
}
