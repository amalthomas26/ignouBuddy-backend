import {Global,Module} from '@nestjs/common';
import {PrismaService} from './prisma.service';

@Global() //makes prismaservice available everywhere without importing
//DatabaseModule
@Module({
    providers:[PrismaService],
    exports:[PrismaService],
})
export class DatabaseModule {}
