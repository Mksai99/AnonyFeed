"use client";

import type { Feedback, Faculty } from "@/lib/types";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ChartTooltip, ChartTooltipContent, ChartContainer } from "@/components/ui/chart";

export function RatingsChart({
  feedback,
  faculty,
}: {
  feedback: Feedback[];
  faculty: Faculty[];
}) {
  const data = faculty.map((f) => {
    const facultyFeedback = feedback.filter((fb) => fb.facultyId === f.id);
    const avgRating =
      facultyFeedback.length > 0
        ? (
            facultyFeedback.reduce((acc, item) => acc + item.rating, 0) /
            facultyFeedback.length
          )
        : 0;
    return {
      name: f.name.split(" ").slice(1).join(" "), // Use last name
      "Average Rating": parseFloat(avgRating.toFixed(1)),
    };
  });

  return (
    <ChartContainer config={{}} className="h-[350px] w-full">
        <BarChart
        accessibilityLayer
        data={data}
        margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 5,
        }}
        >
        <CartesianGrid vertical={false} />
        <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis domain={[0, 5]} />
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="Average Rating" fill="hsl(var(--primary))" radius={4} />
        </BarChart>
    </ChartContainer>
  );
}
