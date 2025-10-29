'use client';

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addFaculty, deleteFaculty } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import type { Faculty } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical"
] as const;

const facultySchema = z.object({
  name: z.string().min(1, "Name is required"),
  department: z.enum(departments, {
    required_error: "Please select a department",
  }),
});

type FacultyFormValues = z.infer<typeof facultySchema>;

export function FacultyManager({ initialFaculty }: { initialFaculty: Faculty[] }) {
  const [faculty, setFaculty] = useState(initialFaculty);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: "",
      department: undefined,
    },
  });

  const onSubmit = (data: FacultyFormValues) => {
    startTransition(async () => {
      try {
        const result = await addFaculty({
          name: data.name,
          department: data.department,
        });

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
          return;
        }

  setFaculty(result.faculty ?? faculty);
        form.reset();
        setIsOpen(false);
        toast({
          title: "Success",
          description: "Faculty member added successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to add faculty member",
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        const result = await deleteFaculty(id);

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
          return;
        }

  setFaculty(result.faculty ?? faculty);
        toast({
          title: "Success",
          description: "Faculty member removed successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove faculty member",
          variant: "destructive",
        });
      }
    });
  };

  // Group faculty by department
  const facultyByDepartment = faculty.reduce((acc, f) => {
    if (!acc[f.department]) {
      acc[f.department] = [];
    }
    acc[f.department].push(f);
    return acc;
  }, {} as Record<string, Faculty[]>);

  return (
    <div className="space-y-6">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Add New Faculty</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Faculty Member</DialogTitle>
            <DialogDescription>
              Enter the details of the new faculty member.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Faculty"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6">
        {Object.entries(facultyByDepartment).map(([department, facultyList]) => (
          <Card key={department} className="p-6">
            <h2 className="text-xl font-semibold mb-4">{department}</h2>
            <div className="space-y-4">
              {facultyList.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <span>{f.name}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(f.id)}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Remove"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}