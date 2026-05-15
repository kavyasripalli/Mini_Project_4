export interface RegisterUserDto {
    userName:string;
    password:string;
    role:'Doctor'|'Patient';
}
