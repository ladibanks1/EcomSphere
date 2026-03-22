import {Controller, Get, Param} from "@nestjs/common";
import {AuthService} from "./auth.service";

@Controller("auth")
export class AuthController {
    constructor(authService: AuthService) {
    }
}