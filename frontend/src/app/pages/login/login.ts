import { Component } from '@angular/core';
import { LOGIN_MESSAGES } from '../../strings/login/login.messages';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  readonly MESSAGES = LOGIN_MESSAGES;

}