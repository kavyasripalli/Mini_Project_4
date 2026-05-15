import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth=inject(AuthService);
  const router=inject(Router);

  if(!auth.isLoggedIn()){
    router.navigate(['/User/login']);
    return false;
  }

  const roles=route.data['roles'] as string[] | undefined;
  if(roles && !auth.hasAnyRole(roles)){
    router.navigate(['/User/login']);
    return false;
  }

  return true;
};
