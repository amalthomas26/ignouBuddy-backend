import {Injectable} from '@nestjs/common';
import { Prisma, Student } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class StudentRepository{
    constructor(private readonly prisma:PrismaService){}

    async findById(id:string):Promise<Student | null>{
     return this.prisma.student.findUnique({
        where:{id,deletedAt:null},
     });
    }

    async findByEnrollmentNumber(enrollmentNumber:string):Promise<Student|null>{
        return this.prisma.student.findUnique({
            where:{enrollmentNumber,deletedAt:null}
        });
    }
    
    async existsByEnrollmentNumber(enrollmentNumber:string):Promise<boolean>{
        const count=await this.prisma.student.count({
            where:{enrollmentNumber,deletedAt:null}
        });
        return count>0;
    }

    async create(data:Prisma.StudentCreateInput):Promsise<Student>{
        return this.prisma.student.create({data});
    }

    async createWithPreferences(studentData:Prisma.StudentCreateInput):Promise<Student>{
        return this.prisma.$transaction(async(tx)=>{
            const student = await tx.student.create({data:studentData});

            await tx.notificationPreference.create({
                data:{
                    studentId: student.id,
                    emailEnabled: true,
                    whatsappEnabled: false,
                    inAppEnabled: true,
                    resultAlerts: true,
                    deadlineAlerts: true,
                    examAlerts: true,
                    generalAlerts: true, 
                }
            });
            return student;
        });
    }

    async update(id:string,data:Prisma.StudentUpdateInput):Promise<Student>{
        return this.prisma.student.update({
            where:{id},
            data,
        });
    }


    async softDelete(id:string):Promise<Student>{
        return this.prisma.student.update({
            where:{id},
            data:{deletedAt:new Date(),isActive:false},
        });
    }

    async updateLastLogin(id:string):Promise<void>{
        await this.prisma.student.update({
            where:{id},
            data:{lastLoginAt:new Date()},
        });
    }


}