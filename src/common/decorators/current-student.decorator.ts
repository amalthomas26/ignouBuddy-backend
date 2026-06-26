import {createParamDecorator,ExecutionContext} from '@nestjs/common';
import {FastifyRequest} from 'fastify';

//parameter decorators that extracts the authenticated student from the request

export const CurrentStudent = createParamDecorator(
    (_data:unknown,ctx:ExecutionContext)=>{
        const request = ctx.switchToHttp().getRequest<FastifyRequest>();
        return (request as FastifyRequest & {student:unknown}).student
    }
)

export interface StudentFromToken{
    readonly id:string;
    readonly enrollmentNumberr:string;
    readonly name:string;
    readonly email:string | null;
    readonly isActive: boolean;
    readonly deletedAt: Date | null;

}