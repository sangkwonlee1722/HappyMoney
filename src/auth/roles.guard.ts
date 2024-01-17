import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RolesGuard extends AuthGuard("jwt") implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const requiredRoles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => user.role?.toLowerCase() === role.toLowerCase());
    if (!hasRole) {
      throw new UnauthorizedException("Forbidden resource");
    }

    return user;
  }
}
