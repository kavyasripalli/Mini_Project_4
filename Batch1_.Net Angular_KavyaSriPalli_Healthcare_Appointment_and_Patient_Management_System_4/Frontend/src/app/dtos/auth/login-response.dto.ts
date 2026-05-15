export interface ReadUserDto{
    id:number;
    userName:string;
    role:string;
}
export interface LoginResponseDto {
    token:string;
    expiresAt:string;
    user:ReadUserDto;
}
