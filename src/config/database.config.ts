import {registerAs} from '@nestjs/config';
//database specific configuration
//can be accessed by configService.get('database.url');


export default registerAs('database',()=>({
    url:process.env.DATABASE_URL,
}))