import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private requiredRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const hasRole = this.requiredRoles.some((role) =>
      user.roles?.includes(role),
    );

    if (!hasRole) {
      throw new ForbiddenException('Access denied (Insufficient role)');
    }

    return true;
  }
}